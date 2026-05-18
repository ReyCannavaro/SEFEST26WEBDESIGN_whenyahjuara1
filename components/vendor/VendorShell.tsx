'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Package, CalendarDays,
  BarChart2, LogOut, X, ExternalLink, ShieldCheck, ShieldAlert,
  Menu,
} from 'lucide-react';

interface VendorProfile {
  id: string;
  store_name: string;
  slug: string;
  is_verified: boolean;
  is_active: boolean;
}

export const VENDOR_NAV = [
  { href: '/vendor/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/vendor/bookings',     icon: <CalendarCheck size={18} />,   label: 'Booking Masuk' },
  { href: '/vendor/services',     icon: <Package size={18} />,         label: 'Layanan Saya' },
  { href: '/vendor/availability', icon: <CalendarDays size={18} />,    label: 'Ketersediaan' },
  { href: '/vendor/analytics',    icon: <BarChart2 size={18} />,       label: 'Statistik' },
];

export function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #f0efeb 25%, #e8e7e3 50%, #f0efeb 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  );
}

function Sidebar({ vendor, sidebarOpen, setSidebarOpen, onLogout }: {
  vendor: VendorProfile | null;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30, backdropFilter: 'blur(2px)' }} />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: 240,
        background: 'var(--forest)', display: 'flex', flexDirection: 'column',
        zIndex: 40, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
      }} className="vendor-sidebar">

        {/* Header */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <img src="/logo_findor.jpg" alt="Findor" style={{ height: 30, objectFit: 'contain', borderRadius: 6 }} />
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            VENDOR PORTAL
          </div>
          {vendor ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {vendor.store_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {vendor.is_verified
                  ? <><ShieldCheck size={12} color="#34d399" /><span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>Terverifikasi</span></>
                  : <><ShieldAlert size={12} color="#fbbf24" /><span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>Belum Terverifikasi</span></>
                }
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton h={14} r={4} />
              <Skeleton w="60%" h={12} r={4} />
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {VENDOR_NAV.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                  textDecoration: 'none',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                  fontWeight: isActive ? 600 : 400, fontSize: 14,
                  transition: 'all 0.15s',
                  borderLeft: isActive ? '3px solid var(--amber)' : '3px solid transparent',
                }}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {vendor?.slug && (
            <Link href={`/vendor/${vendor.slug}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', marginBottom: 6 }}>
              <ExternalLink size={14} /> Lihat Halaman Toko
            </Link>
          )}
          <button onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 13, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @media (min-width: 1024px) {
          .vendor-sidebar { transform: translateX(0) !important; box-shadow: none !important; }
          .vendor-main { margin-left: 240px !important; }
        }
      `}</style>
    </>
  );
}

function Topbar({ onOpen }: { onOpen: () => void }) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
      height: 56, background: 'var(--forest)',
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }} className="vendor-topbar">
      <button onClick={onOpen}
        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: 'white', display: 'flex' }}>
        <Menu size={18} />
      </button>
      <Link href="/">
        <img src="/logo_findor.jpg" alt="Findor" style={{ height: 26, objectFit: 'contain', borderRadius: 5 }} />
      </Link>
      <style>{`
        @media (min-width: 1024px) { .vendor-topbar { display: none !important; } }
      `}</style>
    </header>
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

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Topbar onOpen={() => setSidebarOpen(true)} />
      <Sidebar
        vendor={vendor}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />
      <div className="vendor-main" style={{ marginLeft: 0, paddingTop: 56, transition: 'margin-left 0.3s' }}>
        {pageTitle && (
          <div style={{ padding: '28px 28px 0' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: pageSubtitle ? 4 : 0 }}>
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{pageSubtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}