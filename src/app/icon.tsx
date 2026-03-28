import { ImageResponse } from 'next/og';
 
// Route segment config
export const runtime = 'edge';
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#eab308',
          borderRadius: '8px',
          border: '2px solid #eab308',
          fontWeight: 900,
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        V
      </div>
    ),
    { ...size }
  );
}
