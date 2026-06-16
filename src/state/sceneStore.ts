import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  AetherScene, AetherLayer, Modulator, ModMapping,
  PostEffect, EngineInstance,
} from '../types/scene';

function defaultScene(): AetherScene {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Scene',
    bpm: 120,
    masterClock: { bpm: 120, phase: 0, beat: 0, bar: 0, running: false },
    viewport: { width: 1920, height: 1080, pixelRatio: 1, fullscreen: false },
    layers: [],
    fusionGraph: [],
    globalModulators: [],
    modMappings: [],
    postChain: [],
    audioConfig: {
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      sampleRate: 48000,
      inputDeviceId: null,
    },
    midiMappings: [],
    oscMappings: [],
    thumbnails: { preview: null, lastUpdated: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

type SceneState = {
  scene: AetherScene;
  isDirty: boolean;

  setSceneName: (name: string) => void;
  setBPM: (bpm: number) => void;
  setClockRunning: (running: boolean) => void;
  tickClock: (dt: number) => void;

  addLayer: (layer: AetherLayer) => void;
  removeLayer: (id: string) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  setLayerEnabled: (id: string, enabled: boolean) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, blendMode: string) => void;
  setLayerParam: (layerId: string, paramId: string, value: unknown) => void;
  setLayerEngine: (layerId: string, engine: EngineInstance) => void;

  addModulator: (mod: Modulator) => void;
  removeModulator: (id: string) => void;
  updateModulator: (id: string, partial: Partial<Modulator>) => void;

  addModMapping: (mapping: ModMapping) => void;
  removeModMapping: (id: string) => void;
  updateModMapping: (id: string, partial: Partial<ModMapping>) => void;

  addPostEffect: (effect: PostEffect) => void;
  removePostEffect: (id: string) => void;
  setPostEffectEnabled: (id: string, enabled: boolean) => void;
  setPostEffectParam: (effectId: string, paramId: string, value: unknown) => void;

  loadScene: (scene: AetherScene) => void;
  newScene: () => void;
  markClean: () => void;
};

export const useSceneStore = create<SceneState>()(
  immer((set) => ({
    scene: defaultScene(),
    isDirty: false,

    setSceneName: (name) => set(s => { s.scene.name = name; s.isDirty = true; }),
    setBPM: (bpm) => set(s => { s.scene.bpm = bpm; s.scene.masterClock.bpm = bpm; s.isDirty = true; }),
    setClockRunning: (running) => set(s => { s.scene.masterClock.running = running; }),
    tickClock: (dt) => set(s => {
      if (!s.scene.masterClock.running) return;
      const beatsPerSec = s.scene.masterClock.bpm / 60;
      s.scene.masterClock.phase = (s.scene.masterClock.phase + dt * beatsPerSec) % 1;
      s.scene.masterClock.beat += dt * beatsPerSec;
      s.scene.masterClock.bar = Math.floor(s.scene.masterClock.beat / 4);
    }),

    addLayer: (layer) => set(s => { s.scene.layers.push(layer); s.isDirty = true; }),
    removeLayer: (id) => set(s => {
      s.scene.layers = s.scene.layers.filter(l => l.id !== id);
      s.isDirty = true;
    }),
    moveLayer: (from, to) => set(s => {
      const [layer] = s.scene.layers.splice(from, 1);
      s.scene.layers.splice(to, 0, layer);
      s.isDirty = true;
    }),
    setLayerEnabled: (id, enabled) => set(s => {
      const l = s.scene.layers.find(l => l.id === id);
      if (l) { l.enabled = enabled; s.isDirty = true; }
    }),
    setLayerOpacity: (id, opacity) => set(s => {
      const l = s.scene.layers.find(l => l.id === id);
      if (l) { l.opacity = Math.max(0, Math.min(1, opacity)); s.isDirty = true; }
    }),
    setLayerBlendMode: (id, blendMode) => set(s => {
      const l = s.scene.layers.find(l => l.id === id);
      if (l) { l.blendMode = blendMode as never; s.isDirty = true; }
    }),
    setLayerParam: (layerId, paramId, value) => set(s => {
      const l = s.scene.layers.find(l => l.id === layerId);
      if (l && l.engine.parameters[paramId]) {
        l.engine.parameters[paramId].value = value;
        s.isDirty = true;
      }
    }),
    setLayerEngine: (layerId, engine) => set(s => {
      const l = s.scene.layers.find(l => l.id === layerId);
      if (l) { l.engine = engine; s.isDirty = true; }
    }),

    addModulator: (mod) => set(s => { s.scene.globalModulators.push(mod); s.isDirty = true; }),
    removeModulator: (id) => set(s => {
      s.scene.globalModulators = s.scene.globalModulators.filter(m => m.id !== id);
      s.isDirty = true;
    }),
    updateModulator: (id, partial) => set(s => {
      const m = s.scene.globalModulators.find(m => m.id === id);
      if (m) { Object.assign(m, partial); s.isDirty = true; }
    }),

    addModMapping: (mapping) => set(s => { s.scene.modMappings.push(mapping); s.isDirty = true; }),
    removeModMapping: (id) => set(s => {
      s.scene.modMappings = s.scene.modMappings.filter(m => m.id !== id);
      s.isDirty = true;
    }),
    updateModMapping: (id, partial) => set(s => {
      const m = s.scene.modMappings.find(m => m.id === id);
      if (m) { Object.assign(m, partial); s.isDirty = true; }
    }),

    addPostEffect: (effect) => set(s => { s.scene.postChain.push(effect); s.isDirty = true; }),
    removePostEffect: (id) => set(s => {
      s.scene.postChain = s.scene.postChain.filter(e => e.id !== id);
      s.isDirty = true;
    }),
    setPostEffectEnabled: (id, enabled) => set(s => {
      const e = s.scene.postChain.find(e => e.id === id);
      if (e) { e.enabled = enabled; s.isDirty = true; }
    }),
    setPostEffectParam: (effectId, paramId, value) => set(s => {
      const e = s.scene.postChain.find(e => e.id === effectId);
      if (e) { e.parameters[paramId] = value as never; s.isDirty = true; }
    }),

    loadScene: (scene) => set(s => { s.scene = scene; s.isDirty = false; }),
    newScene: () => set(s => { s.scene = defaultScene(); s.isDirty = false; }),
    markClean: () => set(s => { s.isDirty = false; }),
  }))
);
