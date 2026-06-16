// Final composite: scene + bloom + chromatic aberration + vignette + tonemapping

struct Globals {
  time: f32, dt: f32, width: f32, height: f32,
  bpm: f32, bpmPhase: f32, bass: f32, mid: f32,
  treble: f32, rms: f32,
  _pad0: f32, _pad1: f32, _pad2: f32, _pad3: f32, _pad4: f32, _pad5: f32,
}

struct CompositeParams {
  bloomIntensity: f32,
  chromaShift: f32,
  vignetteStrength: f32,
  vignetteRadius: f32,
  exposure: f32,
  contrast: f32,
  saturation: f32,
  audioChroma: f32,
  _pad0: f32, _pad1: f32, _pad2: f32, _pad3: f32,
}

@group(0) @binding(0) var<uniform> G: Globals;
@group(0) @binding(1) var<uniform> C: CompositeParams;
@group(0) @binding(2) var samp: sampler;
@group(0) @binding(3) var sceneTex: texture_2d<f32>;
@group(0) @binding(4) var bloomTex: texture_2d<f32>;
@group(0) @binding(5) var outTex:   texture_storage_2d<rgba16float, write>;

// ACES filmic tonemapping
fn aces(x: vec3f) -> vec3f {
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), vec3f(0.0), vec3f(1.0));
}

fn luma(c: vec3f) -> f32 {
  return dot(c, vec3f(0.2126, 0.7152, 0.0722));
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(outTex);
  if gid.x >= dims.x || gid.y >= dims.y { return; }

  let uv = (vec2f(gid.xy) + 0.5) / vec2f(dims);

  // Chromatic aberration
  let chromaAmt = C.chromaShift + G.bass * C.audioChroma * 0.005;
  let dir = normalize(uv - 0.5);
  let uvR = uv + dir * chromaAmt * 0.01;
  let uvG = uv;
  let uvB = uv - dir * chromaAmt * 0.01;

  let sceneR = textureSampleLevel(sceneTex, samp, uvR, 0.0).r;
  let sceneG = textureSampleLevel(sceneTex, samp, uvG, 0.0).g;
  let sceneB = textureSampleLevel(sceneTex, samp, uvB, 0.0).b;
  var scene = vec3f(sceneR, sceneG, sceneB);

  // Bloom
  let bloom = textureSampleLevel(bloomTex, samp, uv, 0.0).rgb;
  scene += bloom * C.bloomIntensity * (1.0 + G.rms * 0.5);

  // Exposure
  scene *= C.exposure;

  // Contrast
  scene = (scene - 0.5) * C.contrast + 0.5;

  // Saturation
  let l = luma(scene);
  scene = mix(vec3f(l), scene, C.saturation);

  // Vignette
  let d = length(uv - 0.5) / C.vignetteRadius;
  let vign = 1.0 - smoothstep(0.5, 1.0, d) * C.vignetteStrength;
  scene *= vign;

  // BPM flash
  let flash = pow(G.bpmPhase, 12.0) * G.bass * 0.2;
  scene += flash;

  // ACES tonemap
  scene = aces(scene);

  // Gamma
  scene = pow(max(scene, vec3f(0.0)), vec3f(1.0 / 2.2));

  textureStore(outTex, vec2i(gid.xy), vec4f(scene, 1.0));
}
