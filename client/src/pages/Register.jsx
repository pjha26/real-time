import { SignUp } from '@clerk/clerk-react';

export default function Register() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                {/* Logo */}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                    ⚡ Match & Flow
                </div>

                {/* Clerk's pre-built SignUp UI */}
                <SignUp
                    routing="hash"
                    signInUrl="/login"
                    appearance={{
                        variables: {
                            colorPrimary: '#8f00ff',
                            colorBackground: '#0e0a1a',
                            colorText: '#e8deff',
                            colorTextSecondary: '#a394c8',
                            colorInputBackground: '#1a1230',
                            colorInputText: '#e8deff',
                            borderRadius: '12px',
                            fontFamily: 'Inter, sans-serif',
                        },
                        elements: {
                            card: { boxShadow: '0 0 40px rgba(143,0,255,0.15)', border: '1px solid rgba(218,185,255,0.1)' },
                            headerTitle: { fontFamily: 'Manrope, sans-serif', fontWeight: 800 },
                            formButtonPrimary: { background: 'linear-gradient(135deg, #8f00ff, #b96aff)', transition: 'opacity 0.2s' },
                        }
                    }}
                />
            </div>
        </div>
    );
}
