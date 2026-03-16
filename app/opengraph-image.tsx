import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MOBB - Map of Black Businesses'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B0B0E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '40px',
        }}
      >
        {/* Background Grid Accent */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #FF5A00 1.5px, transparent 0)',
            backgroundSize: '48px 48px',
          }}
        />
        
        {/* Glowing Radar Pulse Effect */}
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '800px',
                height: '800px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 90, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
             <div
                style={{
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 90, 0, 0.1)',
                }}
            />
        </div>

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Brand Mark */}
          <div style={{ display: 'flex', position: 'relative', marginBottom: '20px' }}>
              <div style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '40px', 
                  background: 'linear-gradient(135deg, #FF5A00 0%, #D94A00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(255, 90, 0, 0.4)'
              }}>
                   <span style={{ fontSize: '100px', color: 'white', fontWeight: 'bold' }}>M</span>
              </div>
          </div>

          <h1
            style={{
              fontSize: '110px',
              fontWeight: 900,
              color: 'white',
              margin: 0,
              padding: 0,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            MOBB
          </h1>

          <p
            style={{
              fontSize: '34px',
              color: '#FF5A00',
              fontWeight: 600,
              margin: '10px 0 0 0',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Map of Black Businesses
          </p>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '50px',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5A00' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '22px' }}>Locate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5A00' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '22px' }}>Support</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5A00' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '22px' }}>Build</span>
            </div>
          </div>
        </div>
        
        {/* Footer Branding */}
        <div style={{ 
            position: 'absolute', 
            bottom: '40px', 
            right: '40px', 
            display: 'flex', 
            alignItems: 'center',
            opacity: 0.5
        }}>
            <span style={{ color: 'white', fontSize: '18px' }}>the-mobb.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
