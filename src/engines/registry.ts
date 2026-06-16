import type { EngineFactory, EngineManifest } from '../types/engine';
import { SDF_MANIFEST, createSdfEngine } from './sdf/sdfEngine';

const registry = new Map<string, EngineFactory>();

function register(manifest: EngineManifest, create: EngineFactory['create']): void {
  registry.set(manifest.type, { manifest, create });
}

register(SDF_MANIFEST, (device, w, h) => createSdfEngine(device, w, h));

export function getEngineFactory(type: string): EngineFactory | undefined {
  return registry.get(type);
}

export function getAllManifests(): EngineManifest[] {
  return Array.from(registry.values()).map(f => f.manifest);
}

export function isRegistered(type: string): boolean {
  return registry.has(type);
}
