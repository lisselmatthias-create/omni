// Reaction-Diffusion (Gray-Scott) Compute Shader
// Ping-pong between read and write textures

struct Globals {
  time: f32,
  dt: f32,
  width: f32,
  height: f32,
  bpm: f32,
  bpmPhase: f32,
  bass: f32,
  mid: f32,
  treble: f32,
  rms: f32,
  _pad0: f32, _pad1: f32, _pad2: f32, _pad3: f32, _pad4: f32, _pad5: f32,
}

struct RdParams {
  feed: f32,        // F parameter (feed rate)
  kill: f32,        // k parameter (kill rate)
  diffA: f32,       // diffusion rate of A
  diffB: f32,       // diffusion rate of B
  speed: f32,       // simulation speed multiplier
  audioFeed: f32,   // audio → feed modulation
  audioKill: f32,   // audio → kill modulation
  audioDiff: f32,   // audio → diffusion modulation
  colorMode: f32,   // 0=classic, 1=hue, 2=fire, 3=ice
  colorScale: f32,  // color intensity
  seedMode: f32,    // 0=center, 1=random, 2=beat-triggered
  resetTrigger: f32,// >0 triggers reset
  _pad0: f32, _pad1: f32, _pad2: f32, _pad3: f32,
}

@group(0) @binding(0) var<uniform> G: Globals;
@group(0) @binding(1) var<uniform> P: RdParams;
@group(0) @binding(2) var rdSampler: sampler;
@group(0) @binding(3) var rdRead: texture_2d<f32>;     // ping: read
@group(0) @binding(4) var rdWrite: texture_storage_2d<rgba16float, write>; // pong: write
@group(0) @binding(5) var colorOut: texture_storage_2d<rgba16float, write>; // visual output

// ─── Laplacian (5-tap) ───────────────────────────────────────────────────────

fn laplacian(tex: texture_2d<f32>, samp: sampler, uv: vec2f, px: vec2f) -> vec4f {
  let c = textureSampleLevel(tex, samp, uv, 0.0);
  let n = textureSampleLevel(tex, samp, uv + vec2f(0.0, px.y), 0.0);
  let s = textureSampleLevel(tex, samp, uv - vec2f(0.0, px.y), 0.0);
  let e = textureSampleLevel(tex, samp, uv + vec2f(px.x, 0.0), 0.0);
  let w = textureSampleLevel(tex, samp, uv - vec2f(px.x, 0.0), 0.0);
  // weighted Laplacian: -1*c + 0.2*(n+s+e+w)... actually use standard:
  return (n + s + e + w) - 4.0 * c;
}

// ─── Color mapping ───────────────────────────────────────────────────────────

fn hue2rgb(h: f32) -> vec3f {
  let r = abs(h * 6.0 - 3.0) - 1.0;
  let g = 2.0 - abs(h * 6.0 - 2.0);
  let b = 2.0 - abs(h * 6.0 - 4.0);
  return clamp(vec3f(r, g, b), vec3f(0.0), vec3f(1.0));
}

fn mapColor(b: f32) -> vec3f {
  let t = clamp(b * P.colorScale, 0.0, 1.0);
  let mode = i32(P.colorMode) % 4;

  if mode == 0 {
    // Classic: dark blue → bright white
    return mix(vec3f(0.0, 0.02, 0.05), vec3f(0.0, 0.96, 1.0), pow(t, 0.5));
  } else if mode == 1 {
    // Hue cycle
    return hue2rgb(t + G.time * 0.05) * t;
  } else if mode == 2 {
    // Fire
    let r = clamp(t * 3.0, 0.0, 1.0);
    let g = clamp(t * 3.0 - 1.0, 0.0, 1.0);
    let bl = clamp(t * 3.0 - 2.0, 0.0, 1.0);
    return vec3f(r, g, bl);
  } else {
    // Ice
    return mix(vec3f(0.0, 0.0, 0.1), vec3f(0.7, 0.95, 1.0), t);
  }
}

// ─── Simulation pass ─────────────────────────────────────────────────────────

@compute @workgroup_size(8, 8)
fn simulate(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(rdWrite);
  if gid.x >= dims.x || gid.y >= dims.y { return; }

  let uv = (vec2f(gid.xy) + 0.5) / vec2f(dims);
  let px = 1.0 / vec2f(dims);

  let current = textureSampleLevel(rdRead, rdSampler, uv, 0.0);
  let A = current.r;
  let B = current.g;

  let lap = laplacian(rdRead, rdSampler, uv, px);
  let lapA = lap.r;
  let lapB = lap.g;

  // Audio modulation
  let bass = G.bass;
  let mid  = G.mid;
  let rms  = G.rms;
  let bph  = G.bpmPhase;

  let feedMod = P.feed + bass * P.audioFeed * 0.015;
  let killMod = P.kill + mid  * P.audioKill * 0.005;
  let dA = P.diffA + rms * P.audioDiff * 0.1;
  let dB = P.diffB + rms * P.audioDiff * 0.05;

  let reaction = A * B * B;
  let speed = P.speed * clamp(G.dt * 60.0, 0.5, 2.0);

  let newA = A + (dA * lapA - reaction + feedMod * (1.0 - A)) * speed;
  let newB = B + (dB * lapB + reaction - (killMod + feedMod) * B) * speed;

  textureStore(rdWrite, vec2i(gid.xy), vec4f(
    clamp(newA, 0.0, 1.0),
    clamp(newB, 0.0, 1.0),
    0.0, 1.0
  ));
}

// ─── Visualization pass ───────────────────────────────────────────────────────

@compute @workgroup_size(8, 8)
fn visualize(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(colorOut);
  if gid.x >= dims.x || gid.y >= dims.y { return; }

  let uv = (vec2f(gid.xy) + 0.5) / vec2f(dims);
  let val = textureSampleLevel(rdRead, rdSampler, uv, 0.0);
  let B = val.g;

  let color = mapColor(B);

  // BPM pulse flash
  let pulse = pow(G.bpmPhase, 8.0) * 0.15 * G.bass;
  let final = color + pulse;

  textureStore(colorOut, vec2i(gid.xy), vec4f(final, 1.0));
}
