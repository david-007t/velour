import { MeshGradient } from '@paper-design/shaders-react';
import { debugFlags } from '../lib/debugFlags';
import MeshBackgroundCSS from './MeshBackgroundCSS';

/**
 * Liquid-silk WebGL background. Pure background.
 *
 * Variants chosen via ?mesh= URL param:
 *   full   (default) — original WebGL MeshGradient (~900MB GPU)
 *   css              — pure CSS gradient mock (~5MB GPU)
 *   loader           — full Mesh in loader only; nothing on Home
 *   off              — render nothing
 *
 * The `context` prop says where this is being rendered ('loader'
 * or 'home') so `loader`-variant can suppress on Home.
 */
export default function MeshBackground({ speed = 1.0, context = 'home' }) {
  const variant = debugFlags.noMesh ? 'off' : debugFlags.meshVariant;

  if (variant === 'off') return <div style={{ position: 'absolute', inset: 0, background: '#000' }} />;
  if (variant === 'css') return <MeshBackgroundCSS />;
  if (variant === 'loader' && context !== 'loader') {
    return <div style={{ position: 'absolute', inset: 0, background: '#000' }} />;
  }

  // 'full' (default) and 'loader' on loader context
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <MeshGradient
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        colors={['#000000', '#1a1a1a', '#333333', '#ffffff']}
        speed={speed}
        backgroundColor="#000000"
        maxPixelCount={1280 * 960}
      />
    </div>
  );
}
