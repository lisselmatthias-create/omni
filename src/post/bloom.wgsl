// Two-pass bloom: threshold + downsample, then blur + upsample

struct BloomParams {
  threshold: f32,
  intensity: f32,
  radius: f32,
  audioBoost: f32,
  _pad0: f32, _pad1: f32, _pad2: f32, _pad3: f32,
}

struct Globals {
  time: f32, dt: f32, width: f32, height: f32,
  bpm: f32, bpmPhase: f32, bass: f32, mid: f32,
  treble: f32, rms: f32,
  _pad0: f32, _pad1: f32, _pad2: f32, _pad3: f32, _pad4: f32, _pad5: f32,
}

@group(0) @binding(0) var<uniform> G: Globals;
@group(0) @binding(1) var<uniform> B: BloomParams;
@group(0) @binding(2) var srcSampler: sampler;
@group(0) @binding(3) var srcTex: texture_2d<f32>;
@group(0) @binding(4) var outTex: texture_storage_2d<rgba16float, write>;

// Luminance
fn luma(c: vec3f) -> f32 {
  return dot(c, vec3f(0.2126, 0.7152, 0.0722));
}

// Threshold pass: keep only bright pixels
@compute @workgroup_size(8, 8)
fn threshold(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(outTex);
  if gid.x >= dims.x || gid.y >= dims.y { return; }
  let uv = (vec2f(gid.xy) + 0.5) / vec2f(dims);
  let color = textureSampleLevel(srcTex, srcSampler, uv, 0.0).rgb;
  let thresh = B.threshold - G.bass * B.audioBoost * 0.3;
  let l = luma(color);
  let factor = smoothstep(thresh, thresh + 0.2, l);
  textureStore(outTex, vec2i(gid.xy), vec4f(color * factor, 1.0));
}

// Gaussian blur (horizontal)
@compute @workgroup_size(8, 8)
fn blurH(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(outTex);
  if gid.x >= dims.x || gid.y >= dims.y { return; }
  let uv = (vec2f(gid.xy) + 0.5) / vec2f(dims);
  let px = 1.0 / f32(dims.x);
  let r = B.radius + G.rms * B.audioBoost * 2.0;

  var color = vec3f(0.0);
  let weights = array<f32, 9>(0.0625, 0.125, 0.125, 0.1875, 0.125, 0.1875, 0.125, 0.125, 0.0625);
  let offsets = array<f32, 9>(-4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0);
  for (var i = 0; i < 9; i++) {
    let s = textureSampleLevel(srcTex, srcSampler, uv + vec2f(offsets[i] * px * r, 0.0), 0.0);
    color += s.rgb * weights[i];
  }
  textureStore(outTex, vec2i(gid.xy), vec4f(color, 1.0));
}

// Gaussian blur (vertical)
@compute @workgroup_size(8, 8)
fn blurV(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(outTex);
  if gid.x >= dims.x || gid.y >= dims.y { return; }
  let uv = (vec2f(gid.xy) + 0.5) / vec2f(dims);
  let px = 1.0 / f32(dims.y);
  let r = B.radius + G.rms * B.audioBoost * 2.0;

  var color = vec3f(0.0);
  let weights = array<f32, 9>(0.0625, 0.125, 0.125, 0.1875, 0.125, 0.1875, 0.125, 0.125, 0.0625);
  let offsets = array<f32, 9>(-4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0);
  for (var i = 0; i < 9; i++) {
    let s = textureSampleLevel(srcTex, srcSampler, uv + vec2f(0.0, offsets[i] * px * r), 0.0);
    color += s.rgb * weights[i];
  }
  textureStore(outTex, vec2i(gid.xy), vec4f(color, 1.0));
}
