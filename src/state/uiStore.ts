import { create } from 'zustand';
import type { AudioFeatures } from '../types/modulation';

type DragModState = {
  active: boolean;
  sourceParam: { layerId: string; paramId: string; label: string } | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type UIState = {
  device: GPUDevice | null;
  adapter: GPUAdapter | null;
  setDevice: (device: GPUDevice, adapter: GPUAdapter) => void;

  selectedLayerId: string | null;
  selectedParamId: string | null;
  setSelectedLayer: (id: string | null) => void;
  setSelectedParam: (id: string | null) => void;

  showLayerStack: boolean;
  showInspector: boolean;
  showAudioAnalyzer: boolean;
  showEngineLibrary: boolean;
  toggleLayerStack: () => void;
  toggleInspector: () => void;
  toggleAudioAnalyzer: () => void;
  toggleEngineLibrary: () => void;

  audioFeatures: AudioFeatures;
  setAudioFeatures: (features: AudioFeatures) => void;
  audioInputActive: boolean;
  setAudioInputActive: (active: boolean) => void;

  dragMod: DragModState;
  beginDragMod: (layerId: string, paramId: string, label: string, x: number, y: number) => void;
  updateDragMod: (x: number, y: number) => void;
  endDragMod: () => void;

  fps: number;
  setFPS: (fps: number) => void;
  frameTime: number;
  setFrameTime: (ms: number) => void;

  isRecording: boolean;
  setRecording: (recording: boolean) => void;
};

const defaultAudioFeatures = (): AudioFeatures => ({
  rms: 0, peak: 0, bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0,
  spectralCentroid: 0, spectralFlux: 0, onset: 0, beatPulse: 0, bpmPhase: 0,
  kickConfidence: 0, snareConfidence: 0, vocalPresence: 0, noiseFloor: 0,
});

export const useUIStore = create<UIState>()((set) => ({
  device: null,
  adapter: null,
  setDevice: (device, adapter) => set({ device, adapter }),

  selectedLayerId: null,
  selectedParamId: null,
  setSelectedLayer: (id) => set({ selectedLayerId: id }),
  setSelectedParam: (id) => set({ selectedParamId: id }),

  showLayerStack: true,
  showInspector: true,
  showAudioAnalyzer: true,
  showEngineLibrary: false,
  toggleLayerStack: () => set(s => ({ showLayerStack: !s.showLayerStack })),
  toggleInspector: () => set(s => ({ showInspector: !s.showInspector })),
  toggleAudioAnalyzer: () => set(s => ({ showAudioAnalyzer: !s.showAudioAnalyzer })),
  toggleEngineLibrary: () => set(s => ({ showEngineLibrary: !s.showEngineLibrary })),

  audioFeatures: defaultAudioFeatures(),
  setAudioFeatures: (features) => set({ audioFeatures: features }),
  audioInputActive: false,
  setAudioInputActive: (active) => set({ audioInputActive: active }),

  dragMod: {
    active: false, sourceParam: null,
    startX: 0, startY: 0, currentX: 0, currentY: 0,
  },
  beginDragMod: (layerId, paramId, label, x, y) => set({
    dragMod: { active: true, sourceParam: { layerId, paramId, label }, startX: x, startY: y, currentX: x, currentY: y },
  }),
  updateDragMod: (x, y) => set(s => ({
    dragMod: { ...s.dragMod, currentX: x, currentY: y },
  })),
  endDragMod: () => set(s => ({
    dragMod: { ...s.dragMod, active: false, sourceParam: null },
  })),

  fps: 0,
  setFPS: (fps) => set({ fps }),
  frameTime: 0,
  setFrameTime: (frameTime) => set({ frameTime }),

  isRecording: false,
  setRecording: (isRecording) => set({ isRecording }),
}));
