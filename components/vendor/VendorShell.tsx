'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Package, CalendarDays,
  BarChart2, LogOut, X, ExternalLink, ShieldCheck, ShieldAlert,
  Menu, ChevronRight,
} from 'lucide-react';

interface VendorProfile {
  id: string;
  store_name: string;
  slug: string;
  is_verified: boolean;
  is_active: boolean;
}

export const VENDOR_NAV = [
  { href: '/vendor/dashboard',    icon: LayoutDashboard, label: 'Dashboard',     badge: null },
  { href: '/vendor/bookings',     icon: CalendarCheck,   label: 'Booking Masuk', badge: null },
  { href: '/vendor/services',     icon: Package,         label: 'Layanan Saya',  badge: null },
  { href: '/vendor/availability', icon: CalendarDays,    label: 'Ketersediaan',  badge: null },
  { href: '/vendor/analytics',    icon: BarChart2,       label: 'Statistik',     badge: null },
];

export function Skeleton({ w = '100%', h = 16, r = 8 }: {
  w?: string | number; h?: number; r?: number;
}) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#f0efeb 25%,#e8e7e3 50%,#f0efeb 75%)',
      backgroundSize: '200% 100%', animation: 'vs-shimmer 1.5s infinite',
    }} />
  );
}

function Sidebar({ vendor, open, onClose, onLogout }: {
  vendor: VendorProfile | null;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            animation: 'vs-fade-in 0.2s ease',
          }}
          className="vs-overlay"
        />
      )}

      <aside
        className="vs-sidebar"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 'var(--vs-sidebar-w)',
          height: '100dvh',
          background: 'var(--forest)',
          display: 'flex', flexDirection: 'column',
          zIndex: 40,
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: open ? '6px 0 32px rgba(0,0,0,0.25)' : 'none',
          overflowY: 'auto',
        }}
      >
        <div style={{
          padding: '20px 18px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/logo_findor.jpg" alt="Findor"
                style={{ height: 28, objectFit: 'contain', borderRadius: 6 }} />
            </Link>
            <button
              onClick={onClose}
              className="vs-close-btn"
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
                padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>

          <p style={{
            fontSize: 9, fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            VENDOR PORTAL
          </p>

          {vendor ? (
            <div>
              <p style={{
                fontSize: 13.5, fontWeight: 700, color: 'white',
                lineHeight: 1.3, marginBottom: 5,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {vendor.store_name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {vendor.is_verified ? (
                  <>
                    <ShieldCheck size={11} color="#34d399" />
                    <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>Terverifikasi</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={11} color="#fbbf24" />
                    <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>Belum Terverifikasi</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Skeleton h={13} r={4} />
              <Skeleton w="55%" h={11} r={4} />
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          <p style={{
            fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '4px 10px 8px',
          }}>
            MENU
          </p>
          {VENDOR_NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/vendor/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 1,
                  textDecoration: 'none', fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(255,255,255,0.11)' : 'transparent',
                  borderLeft: isActive ? '2.5px solid var(--amber, #f5a623)' : '2.5px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.82)';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }
                }}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={13} color="rgba(255,255,255,0.4)" />}
              </Link>
            );
          })}
        </nav>

        <div style={{
          padding: '10px 10px 14px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          {vendor?.slug && (
            <Link
              href={`/vendor/${vendor.slug}`}
              target="_blank"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', borderRadius: 10, marginBottom: 4,
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.55)', fontSize: 12.5,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; }}
            >
              <ExternalLink size={13} />
              Lihat Halaman Toko
            </Link>
          )}
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 10,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.38)', fontSize: 12.5,
              fontFamily: 'inherit', textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.38)'; }}
          >
            <LogOut size={13} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, onOpen }: { title?: string; onOpen: () => void }) {
  const pathname = usePathname();
  const activeLabel = VENDOR_NAV.find(n => pathname === n.href || pathname.startsWith(n.href))?.label ?? title ?? 'Vendor';

  return (
    <header
      className="vs-topbar"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        height: 'var(--vs-topbar-h)',
        background: 'var(--forest)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <button
        onClick={onOpen}
        style={{
          background: 'rgba(255,255,255,0.09)', border: 'none', borderRadius: 8,
          padding: '7px', cursor: 'pointer', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Menu size={18} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeLabel}
        </p>
      </div>

      <Link href="/" style={{ flexShrink: 0 }}>
        <img src="/logo_findor.jpg" alt="Findor" style={{ height: 24, objectFit: 'contain', borderRadius: 5 }} />
      </Link>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="vs-bottom-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'var(--forest)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'stretch',
        height: 'var(--vs-bottom-h)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {VENDOR_NAV.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/vendor/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              textDecoration: 'none', padding: '6px 2px',
              color: isActive ? 'var(--amber, #f5a623)' : 'rgba(255,255,255,0.38)',
              transition: 'color 0.15s',
              position: 'relative',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%',
                height: 2, background: 'var(--amber, #f5a623)', borderRadius: 999,
              }} />
            )}
            <Icon size={20} />
            <span style={{
              fontSize: 9.5, fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.02em', lineHeight: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '100%', textAlign: 'center',
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function VendorShell({
  children,
  pageTitle,
  pageSubtitle,
}: {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  const fetchVendor = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (!data.success) { router.push('/login?redirect=/vendor/dashboard'); return; }
      const { role, vendor: v } = data.data;
      if (role !== 'vendor' && role !== 'admin') { router.push('/profile'); return; }
      if (!v) { router.push('/profile'); return; }
      setVendor(v);
    } catch { router.push('/login'); }
  }, [router]);

  useEffect(() => { fetchVendor(); }, [fetchVendor]);

  const handleLogout = async () => {
    try { await fetch('/api/v1/auth/logout', { method: 'POST' }); } catch { /* silent */ }
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: '#f7f7f5' }}>
      <Topbar title={pageTitle} onOpen={() => setSidebarOpen(true)} />

      <Sidebar
        vendor={vendor}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div
        className="vs-main"
        style={{
          paddingTop: 'var(--vs-topbar-h)',
          paddingBottom: 'var(--vs-bottom-h)',
          minHeight: '100dvh',
          transition: 'margin-left 0.3s',
        }}
      >
        {pageTitle && (
          <div className="vs-page-header" style={{
            padding: '24px 28px 0',
            display: 'none',
          }}>
            <h1 style={{
              fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #0f172a)',
              letterSpacing: '-0.3px', marginBottom: pageSubtitle ? 4 : 0,
            }}>
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #64748b)' }}>{pageSubtitle}</p>
            )}
          </div>
        )}

        {children}
      </div>

      <BottomNav />

      <style>{`
        /* ── CSS Variables ── */
        :root {
          --vs-sidebar-w: 240px;
          --vs-topbar-h: 52px;
          --vs-bottom-h: 0px;
        }

        /* ── Animations ── */
        @keyframes vs-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes vs-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ════ MOBILE — < 640px ════ */
        /* Sidebar: hidden, topbar visible, bottom nav visible */
        .vs-sidebar   { transform: translateX(-100%); }
        .vs-topbar    { display: flex; }
        .vs-bottom-nav { display: flex; }
        .vs-overlay   { display: block; }
        .vs-close-btn { display: flex !important; }
        .vs-main      {
          margin-left: 0 !important;
          padding-bottom: calc(var(--vs-bottom-h) + env(safe-area-inset-bottom, 0px)) !important;
        }
        .vs-page-header { display: none !important; }

        /* Bottom nav height mobile */
        @media (max-width: 639px) {
          :root { --vs-bottom-h: 60px; }
          .vs-bottom-nav { display: flex !important; }
        }

        /* ════ TABLET — 640px–1023px ════ */
        /* Sidebar: drawer, topbar visible, bottom nav hidden */
        @media (min-width: 640px) and (max-width: 1023px) {
          :root {
            --vs-topbar-h: 56px;
            --vs-bottom-h: 0px;
          }
          .vs-sidebar    { transform: translateX(-100%); }
          .vs-topbar     { display: flex !important; }
          .vs-bottom-nav { display: none !important; }
          .vs-main       { margin-left: 0 !important; padding-bottom: 0 !important; }
        }

        /* ════ DESKTOP — ≥ 1024px ════ */
        /* Sidebar: permanent, topbar hidden, bottom nav hidden */
        @media (min-width: 1024px) {
          :root {
            --vs-topbar-h: 0px;
            --vs-bottom-h: 0px;
          }
          .vs-sidebar {
            transform: translateX(0) !important;
            box-shadow: none !important;
          }
          .vs-overlay    { display: none !important; }
          .vs-topbar     { display: none !important; }
          .vs-bottom-nav { display: none !important; }
          .vs-close-btn  { display: none !important; }
          .vs-main       {
            margin-left: var(--vs-sidebar-w) !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .vs-page-header { display: block !important; }
        }

        /* Touch feedback bottom nav */
        .vs-bottom-nav a:active { opacity: 0.6; }

        /* Prevent scroll when sidebar open on mobile */
        body.vs-sidebar-open { overflow: hidden; }
      `}</style>
    </div>
  );
}