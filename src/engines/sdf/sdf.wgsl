// Global uniforms
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
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
  _pad3: f32,
  _pad4: f32,
  _pad5: f32,
}

struct SdfParams {
  sceneId: f32,
  isoValue: f32,
  roughness: f32,
  metallic: f32,
  colorR: f32,
  colorG: f32,
  colorB: f32,
  glowIntensity: f32,
  glowRadius: f32,
  rimPower: f32,
  aoStrength: f32,
  shadowSoftness: f32,
  camDist: f32,
  camFov: f32,
  audioReact: f32,
  morphSpeed: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
  _pad3: f32,
}

@group(0) @binding(0) var<uniform> G: Globals;
@group(0) @binding(1) var<uniform> P: SdfParams;
@group(0) @binding(2) var outTex: texture_storage_2d<rgba16float, write>;

// ─── SDF primitives ───────────────────────────────────────────────────────────

fn sdSphere(p: vec3f, r: f32) -> f32 {
  return length(p) - r;
}

fn sdBox(p: vec3f, b: vec3f) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

fn sdTorus(p: vec3f, t: vec2f) -> f32 {
  let q = vec2f(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

fn sdCapsule(p: vec3f, a: vec3f, b: vec3f, r: f32) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

fn sdOctahedron(p: vec3f, s: f32) -> f32 {
  let q = abs(p);
  return (q.x + q.y + q.z - s) * 0.57735027;
}

fn sdMandelbulb(p: vec3f, power: f32) -> f32 {
  var z = p;
  var dr = 1.0;
  var r = 0.0;
  for (var i = 0; i < 8; i++) {
    r = length(z);
    if r > 4.0 { break; }
    let theta = acos(z.z / r) * power;
    let phi = atan2(z.y, z.x) * power;
    let zr = pow(r, power);
    dr = pow(r, power - 1.0) * power * dr + 1.0;
    z = zr * vec3f(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)) + p;
  }
  return 0.5 * log(r) * r / dr;
}

fn sdGyroid(p: vec3f, thickness: f32) -> f32 {
  return abs(dot(sin(p), cos(p.zxy))) - thickness;
}

// ─── Smooth operations ────────────────────────────────────────────────────────

fn opSmoothUnion(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

fn opSmoothSub(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
  return mix(d2, -d1, h) + k * h * (1.0 - h);
}

// ─── Scene SDF ───────────────────────────────────────────────────────────────

fn scene(p: vec3f) -> f32 {
  let t = G.time * P.morphSpeed;
  let audio = P.audioReact;
  let bass = G.bass;
  let mid = G.mid;
  let bph = G.bpmPhase;
  let sid = i32(P.sceneId) % 6;

  if sid == 0 {
    // Morphing sphere + torus
    let s1 = sdSphere(p, 0.8 + bass * 0.3 * audio);
    let t1 = sdTorus(p, vec2f(1.2 + mid * 0.2 * audio, 0.15 + bph * 0.05));
    return opSmoothUnion(s1, t1, 0.3 + bass * 0.2);
  } else if sid == 1 {
    // Mandelbulb
    let power = 8.0 + sin(t * 0.1) * 2.0 + mid * 2.0 * audio;
    return sdMandelbulb(p, power);
  } else if sid == 2 {
    // Gyroid
    let scale = 3.14159 * (1.5 + bass * 0.5 * audio);
    return sdGyroid(p * scale, P.isoValue + mid * 0.1 * audio) / scale;
  } else if sid == 3 {
    // Box + sphere morph
    let box = sdBox(p, vec3f(0.7 + bass * 0.2 * audio));
    let sph = sdSphere(p, 1.0 + mid * 0.2 * audio);
    return mix(box, sph, sin(t) * 0.5 + 0.5);
  } else if sid == 4 {
    // Octahedron + gyroid intersection
    let oct = sdOctahedron(p, 1.2 + bass * 0.3 * audio);
    let gyr = sdGyroid(p * 2.5, 0.4 + mid * 0.1 * audio) / 2.5;
    return opSmoothUnion(oct, gyr * 0.3, 0.4);
  } else {
    // Capsule cluster
    let c1 = sdCapsule(p, vec3f(-0.5, -0.5, 0.0), vec3f(0.5, 0.5, 0.0), 0.2 + bass * 0.15 * audio);
    let c2 = sdCapsule(p, vec3f(-0.5, 0.5, 0.0), vec3f(0.5, -0.5, 0.0), 0.2 + mid * 0.1 * audio);
    return opSmoothUnion(c1, c2, 0.3);
  }
}

// ─── Normal estimation ────────────────────────────────────────────────────────

fn normal(p: vec3f) -> vec3f {
  let e = vec2f(0.001, 0.0);
  return normalize(vec3f(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx),
  ));
}

// ─── AO ──────────────────────────────────────────────────────────────────────

fn ao(p: vec3f, n: vec3f) -> f32 {
  var occ = 0.0;
  var sca = 1.0;
  for (var i = 1; i <= 5; i++) {
    let h = 0.01 + 0.12 * f32(i) / 4.0;
    let d = scene(p + n * h);
    occ += (h - d) * sca;
    sca *= 0.95;
    if occ > 0.35 { break; }
  }
  return clamp(1.0 - 3.0 * occ * P.aoStrength, 0.0, 1.0);
}

// ─── Soft shadow ─────────────────────────────────────────────────────────────

fn softShadow(ro: vec3f, rd: vec3f, mint: f32, maxt: f32) -> f32 {
  var res = 1.0;
  var t = mint;
  for (var i = 0; i < 16; i++) {
    let h = scene(ro + rd * t);
    res = min(res, P.shadowSoftness * h / t);
    t += clamp(h, 0.02, 0.2);
    if res < 0.005 || t > maxt { break; }
  }
  return clamp(res, 0.0, 1.0);
}

// ─── Raymarcher ──────────────────────────────────────────────────────────────

struct RayHit {
  t: f32,
  hit: bool,
}

fn raymarch(ro: vec3f, rd: vec3f) -> RayHit {
  var t = 0.01;
  for (var i = 0; i < 128; i++) {
    let d = scene(ro + rd * t);
    if d < 0.0005 { return RayHit(t, true); }
    if t > 20.0 { break; }
    t += d;
  }
  return RayHit(t, false);
}

// ─── Shading ─────────────────────────────────────────────────────────────────

fn shade(ro: vec3f, rd: vec3f, hit: RayHit) -> vec4f {
  if !hit.hit {
    // background gradient + glow haze
    let bg = mix(
      vec3f(0.01, 0.02, 0.04),
      vec3f(0.0, 0.05, 0.08),
      clamp(-rd.y * 0.5 + 0.5, 0.0, 1.0)
    );
    return vec4f(bg, 1.0);
  }

  let p = ro + rd * hit.t;
  let n = normal(p);
  let baseColor = vec3f(P.colorR, P.colorG, P.colorB);

  // Light setup
  let lightDir = normalize(vec3f(0.8, 1.2, 0.6));
  let lightColor = vec3f(1.0, 0.95, 0.9);

  let diff = max(dot(n, lightDir), 0.0);
  let refl = reflect(rd, n);
  let spec = pow(max(dot(refl, lightDir), 0.0), mix(8.0, 64.0, 1.0 - P.roughness));

  let occ = ao(p, n);
  let sha = softShadow(p + n * 0.002, lightDir, 0.02, 6.0);

  // Rim light
  let rim = pow(1.0 - max(dot(-rd, n), 0.0), P.rimPower);
  let rimColor = vec3f(0.0, 0.96, 1.0) * rim * (1.0 + G.bass * 2.0);

  // PBR approximation
  let ambient = baseColor * 0.08 * occ;
  let diffuse = baseColor * diff * sha * lightColor * occ;
  let specular = mix(vec3f(0.04), baseColor, P.metallic) * spec * sha;

  var color = ambient + diffuse + specular + rimColor * P.glowIntensity;

  // Glow halo around surface
  let glowMag = exp(-hit.t * P.glowRadius * 0.1) * P.glowIntensity;
  color += baseColor * glowMag * G.rms;

  // BPM pulse
  let pulse = pow(G.bpmPhase, 4.0) * 0.3;
  color *= 1.0 + pulse;

  return vec4f(color, 1.0);
}

// ─── Main compute entry ───────────────────────────────────────────────────────

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let dims = textureDimensions(outTex);
  if gid.x >= dims.x || gid.y >= dims.y { return; }

  let uv = (vec2f(gid.xy) + 0.5) / vec2f(dims);
  let aspect = G.width / G.height;

  // Camera
  let fov = tan(radians(P.camFov * 0.5));
  let ndc = (uv * 2.0 - 1.0) * vec2f(aspect, -1.0) * fov;
  let rd = normalize(vec3f(ndc, -P.camDist));

  // Camera rotation (slow orbit)
  let theta = G.time * 0.15;
  let ct = cos(theta); let st = sin(theta);
  let ro = vec3f(ct * 3.5, 1.5, st * 3.5);
  let fwd = normalize(-ro);
  let right = normalize(cross(fwd, vec3f(0, 1, 0)));
  let up = cross(right, fwd);
  let rayDir = normalize(rd.x * right + rd.y * up + fwd);

  let hit = raymarch(ro, rayDir);
  let color = shade(ro, rayDir, hit);

  textureStore(outTex, vec2i(gid.xy), color);
}
