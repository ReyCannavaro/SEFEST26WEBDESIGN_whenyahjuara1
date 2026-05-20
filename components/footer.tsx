import Link from 'next/link'

function IconIG() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="#374151" stroke="none" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#374151">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconTikTok() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#374151">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  )
}

const socials = [
  { label: 'Instagram', icon: <IconIG /> },
  { label: 'Facebook',  icon: <IconFacebook /> },
  { label: 'TikTok',    icon: <IconTikTok /> },
]

const cols = [
  { title: 'Platform', links: [
    { label: 'Cari Vendor',    href: '/search' },
    { label: 'Kategori',       href: '/search' },
    { label: 'Findor Prime',   href: '#' },
  ]},
  { title: 'Perusahaan', links: [
    { label: 'Tentang Kami',   href: '#' },
    { label: 'Karier',         href: '#' },
    { label: 'Kontak',         href: '#' },
  ]},
  { title: 'Dukungan', links: [
    { label: 'Vendor Support', href: '#' },
    { label: 'Pusat Bantuan',  href: '#' },
    { label: 'Keamanan Dana',  href: '#' },
    { label: 'Kebijakan Batal',href: '#' },
  ]},
]

export default function Footer() {
  return (
    <footer>
      <div style={{ height: 60, background: 'linear-gradient(to bottom, #f5f5f0, #ffffff)' }} />

      <div style={{ background: '#ffffff' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 32px) 40px',
          boxSizing: 'border-box',
        }}>
          <div className="footer-grid">
            <div className="footer-brand">
              <img
                src="/logo_findor.jpg"
                alt="Findor"
                style={{ height: 44, width: 'auto', objectFit: 'contain', marginBottom: 12 }}
              />
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.8, margin: '0 0 18px', maxWidth: 240 }}>
                Pasar kurasi untuk vendor event premium. Menghubungkan penyelenggara dengan vendor terpercaya, suara, dan destinasi terbaik.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {socials.map(s => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: '1px solid #e5e7eb', background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none', flexShrink: 0,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1C3D2E'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(28,61,46,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-links-grid">
              {cols.map(col => (
                <div key={col.title}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {col.title}
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.links.map(l => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1C3D2E'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'; }}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #e5e7eb',
            marginTop: 40, paddingTop: 20,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
              © 2024 Findor Marketplace · The Curated Gallery for Premium Events.
            </p>
            <div className="footer-legal">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <Link
                  key={l}
                  href="#"
                  style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9ca3af'; }}
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 48px;
          align-items: flex-start;
        }
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .footer-legal {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-brand { max-width: 320px; }
          .footer-links-grid { gap: 24px; }
        }

        @media (max-width: 480px) {
          .footer-links-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .footer-legal {
            gap: 12px;
          }
        }

        @media (max-width: 360px) {
          .footer-links-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  )
}