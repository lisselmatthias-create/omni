import { useEffect, useState } from 'react'
import Layout from './ui/shell/Layout'
import { initGPU } from './gpu/device'
import { useUIStore } from './state/uiStore'

export default function App() {
  const [gpuReady, setGpuReady] = useState(false)
  const [gpuError, setGpuError] = useState<string | null>(null)
  const setDevice = useUIStore(s => s.setDevice)

  useEffect(() => {
    initGPU().then(({ device, adapter }) => {
      setDevice(device, adapter)
      setGpuReady(true)
    }).catch(err => {
      setGpuError(err.message ?? 'WebGPU not available')
    })
  }, [setDevice])

  if (gpuError) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#03050a', color: '#ff3158',
        fontFamily: 'monospace', flexDirection: 'column', gap: 12
      }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>AETHERVJ</div>
        <div style={{ color: '#ffb000' }}>WebGPU Initialization Failed</div>
        <div style={{ fontSize: 12, color: '#162331', maxWidth: 400, textAlign: 'center' }}>{gpuError}</div>
        <div style={{ fontSize: 11, color: '#162331' }}>Requires Chrome 113+ or Firefox Nightly with WebGPU enabled</div>
      </div>
    )
  }

  if (!gpuReady) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#03050a', color: '#00f5ff',
        fontFamily: 'monospace', flexDirection: 'column', gap: 12
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4 }}>AETHERVJ</div>
        <div style={{ fontSize: 12, color: '#162331' }}>Initializing WebGPU...</div>
      </div>
    )
  }

  return <Layout />
}
