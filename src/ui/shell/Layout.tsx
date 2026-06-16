import { useUIStore } from '../../state/uiStore';
import { TopBar } from './TopBar';
import { LayerStack } from '../panels/LayerStack';
import { Viewport } from '../panels/Viewport';
import { Inspector } from '../panels/Inspector';
import { AudioAnalyzer } from '../panels/AudioAnalyzer';

export default function Layout() {
  const { showLayerStack, showInspector, showAudioAnalyzer } = useUIStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', background: '#03050a', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {showLayerStack && <LayerStack />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Viewport />
          {showAudioAnalyzer && <AudioAnalyzer />}
        </div>
        {showInspector && <Inspector />}
      </div>
    </div>
  );
}
