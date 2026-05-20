'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays, Heart, Star, ChevronRight, MapPin,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
  User, Store, ArrowRight, Package, Receipt, Menu, X,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import type { BookingStatus } from '@/types';

interface UserProfile {
  id: string; email: string; full_name: string | null;
  avatar_url: string | null; phone: string | null;
  role: string; created_at: string;
  vendor?: {
    id: string; store_name: string; slug: string;
    category: string; city: string;
    is_verified: boolean; is_active: boolean;
    rating_avg: number; review_count: number;
  } | null;
}

interface BookingItem {
  id: string; event_date: string; event_name: string;
  event_location: string; status: BookingStatus; created_at: string;
  service: { id: string; name: string; category: string };
  vendor: { id: string; store_name: string; slug: string; whatsapp_number: string; city: string };
}

interface BookmarkItem {
  id: string; created_at: string;
  vendor: {
    id: string; store_name: string; slug: string;
    category: string; city: string;
    rating_avg: number; review_count: number; is_verified: boolean;
  };
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:         { label: 'Menunggu',         color: '#92400E', bg: '#FEF3C7', icon: <Clock size={11} /> },
  confirmed:       { label: 'Dikonfirmasi',     color: '#1E40AF', bg: '#DBEAFE', icon: <CheckCircle2 size={11} /> },
  waiting_payment: { label: 'Bayar DP',         color: '#7C3AED', bg: '#EDE9FE', icon: <AlertCircle size={11} /> },
  dp_verified:     { label: 'DP Terverifikasi', color: '#065F46', bg: '#D1FAE5', icon: <CheckCircle2 size={11} /> },
  completed:       { label: 'Selesai',          color: '#064E3B', bg: '#D1FAE5', icon: <CheckCircle2 size={11} /> },
  rejected:        { label: 'Ditolak',          color: '#991B1B', bg: '#FEE2E2', icon: <XCircle size={11} /> },
  cancelled:       { label: 'Dibatalkan',       color: '#374151', bg: '#F3F4F6', icon: <XCircle size={11} /> },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  return formatDate(dateStr);
}

function Skeleton({ w = '100%', h = 16, radius = 8 }: { w?: string | number; h?: number; radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, bookingsRes, bookmarksRes] = await Promise.all([
          fetch('/api/v1/auth/me'),
          fetch('/api/v1/bookings?per_page=5'),
          fetch('/api/v1/bookmarks?per_page=3'),
        ]);
        if (meRes.status === 401) { router.push('/login'); return; }
        const [meData, bookingsData, bookmarksData] = await Promise.all([meRes.json(), bookingsRes.json(), bookmarksRes.json()]);
        if (!meData.success) throw new Error(meData.error ?? 'Gagal memuat profil');
        setUser(meData.data);
        setBookings(bookingsData.data?.bookings ?? []);
        setBookmarks(bookmarksData.data?.bookmarks ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const stats = bookings.reduce(
    (acc, b) => {
      acc.total++;
      if (b.status === 'completed') acc.completed++;
      if (['pending','confirmed','waiting_payment','dp_verified'].includes(b.status)) acc.active++;
      return acc;
    },
    { total: 0, completed: 0, active: 0 }
  );

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? '?';

  const quickLinks = [
    { icon: <CalendarDays size={16} />, label: 'Semua Booking', sub: 'Kelola jadwal event', href: '/bookings' },
    { icon: <Heart size={16} />, label: 'Wishlist Vendor', sub: 'Vendor tersimpan', href: '/bookmarks' },
    { icon: <User size={16} />, label: 'Profil Saya', sub: 'Edit info akun', href: '/profile' },
    { icon: <Store size={16} />, label: 'Daftar Vendor', sub: 'Kelola toko kamu', href: '/vendor/dashboard' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,300&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .dash-card { background:#fff; border-radius:20px; border:1px solid #EBEBEB; }
        .stat-card  { background:#fff; border-radius:16px; border:1px solid #EBEBEB; padding:18px 20px; display:flex; align-items:center; gap:14px; transition:all 0.22s; cursor:pointer; text-decoration:none; }
        .stat-card:hover { border-color:#C7DDD1; box-shadow:0 4px 20px rgba(28,61,46,0.09); transform:translateY(-2px); }
        .booking-row { display:flex; align-items:center; gap:12px; padding:13px 20px; transition:background 0.15s; cursor:pointer; }
        .booking-row:hover { background:#FAFAF8; }
        .quick-link { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; transition:background 0.15s; cursor:pointer; text-decoration:none; }
        .quick-link:hover { background:#F7F7F4; }
        .bookmark-item { display:flex; align-items:center; gap:12px; padding:10px; border-radius:12px; border:1px solid transparent; transition:all 0.2s; cursor:pointer; text-decoration:none; }
        .bookmark-item:hover { border-color:#C7DDD1; box-shadow:0 2px 12px rgba(28,61,46,0.07); }
        .section-anim { animation:fadeUp 0.5s ease both; }
        .dash-wrapper { max-width:1100px; margin:0 auto; padding:0 clamp(16px,4vw,24px) 80px; }
        .profile-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; padding-top:12px; gap:12px; flex-wrap:wrap; }
        .profile-left   { display:flex; align-items:center; gap:14px; }
        .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:28px; }
        .main-grid { display:grid; grid-template-columns:1fr 320px; gap:22px; align-items:start; }

        .cta-banner {
          margin-top:28px;
          background:linear-gradient(115deg,#1C3D2E 0%,#2D6A4F 100%);
          border-radius:20px; padding:clamp(20px,4vw,28px) clamp(20px,4vw,32px);
          display:flex; align-items:center; justify-content:space-between;
          gap:16px; flex-wrap:wrap;
        }

        .vendor-banner {
          background:linear-gradient(115deg,#1C3D2E 0%,#2D6A4F 100%);
          border-radius:16px; padding:18px 22px; margin-bottom:28px;
          display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;
        }

        @media (max-width: 900px) {
          .main-grid { grid-template-columns:1fr; }
          .sidebar-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns:1fr; gap:10px; }
          .sidebar-col { grid-template-columns:1fr; }
          .profile-header { flex-direction:column; align-items:flex-start; }
          .edit-btn-desktop { display:none; }
          .cta-banner { flex-direction:column; align-items:flex-start; }
          .cta-banner a { width:100%; justify-content:center; }
          .vendor-banner { flex-direction:column; align-items:flex-start; }
          .vendor-banner a { width:100%; justify-content:center; }
          .booking-row { padding:12px 14px; }
          .stat-card { padding:14px 16px; }
        }

        /* ── Very small ≤380px ── */
        @media (max-width: 380px) {
          .stat-icon { display:none; }
        }
      `}</style>

      <Navbar />

      <main style={{ minHeight: '100vh', background: '#F7F7F4', paddingTop: 'clamp(80px,10vw,100px)' }}>
        <div className="dash-wrapper">

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#991B1B', fontSize: 14 }}>
              {error}
            </div>
          )}

          <div className="profile-header section-anim">
            <div className="profile-left">
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#1C3D2E 0%,#2D6A4F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: '0 2px 12px rgba(28,61,46,0.25)' }}>
                {loading ? '?' : initials}
              </div>
              <div>
                {loading ? (
                  <><Skeleton w={150} h={20} /><div style={{ marginTop: 6 }}><Skeleton w={110} h={13} /></div></>
                ) : (
                  <>
                    <h1 style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif' }}>
                      Halo, {user?.full_name?.split(' ')[0] ?? 'Pengguna'} 👋
                    </h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '2px 0 0' }}>{user?.email}</p>
                  </>
                )}
              </div>
            </div>
            <Link href="/profile" className="edit-btn-desktop" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#1C3D2E', background: '#fff', border: '1px solid #EBEBEB', borderRadius: 100, padding: '9px 18px', textDecoration: 'none' }}>
              <User size={14} /> Edit Profil
            </Link>
          </div>

          <div className="stats-grid section-anim">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '18px 20px' }}>
                  <Skeleton w={40} h={40} radius={10} />
                  <div style={{ marginTop: 10 }}><Skeleton w="55%" h={13} /></div>
                  <div style={{ marginTop: 6 }}><Skeleton w="35%" h={22} /></div>
                </div>
              ))
            ) : (
              <>
                {[
                  { icon: <Receipt size={19} />, label: 'Total Booking', value: stats.total, sub: 'Sepanjang waktu', href: '/bookings' },
                  { icon: <CalendarDays size={19} />, label: 'Booking Aktif', value: stats.active, sub: 'Sedang berjalan', href: '/bookings' },
                  { icon: <Heart size={19} />, label: 'Tersimpan', value: bookmarks.length, sub: 'Vendor favorit', href: '/bookmarks' },
                ].map(s => (
                  <Link key={s.label} href={s.href} className="stat-card">
                    <div className="stat-icon" style={{ width: 42, height: 42, borderRadius: 11, background: '#F3F9F5', display: 'grid', placeItems: 'center', color: '#1C3D2E', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 'clamp(20px,3vw,24px)', fontWeight: 800, color: '#111827', lineHeight: 1, fontFamily: 'Fraunces, serif' }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.sub}</div>
                    </div>
                    <ChevronRight size={15} color="#D1D5DB" />
                  </Link>
                ))}
              </>
            )}
          </div>

          {!loading && user?.vendor && (
            <div className="vendor-banner section-anim">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Store size={19} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{user.vendor.store_name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} fill="#F5A623" color="#F5A623" /> {user.vendor.rating_avg.toFixed(1)}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{user.vendor.review_count} ulasan</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{user.vendor.city}</span>
                    {user.vendor.is_verified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 100, padding: '2px 8px', fontSize: 11, color: '#86EFAC' }}>
                        <CheckCircle2 size={10} /> Terverifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link href="/vendor/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F5A623', color: '#1C3D2E', fontWeight: 700, fontSize: 13, borderRadius: 100, padding: '10px 18px', textDecoration: 'none', flexShrink: 0 }}>
                Dashboard Vendor <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <div className="main-grid">
            <div className="dash-card section-anim" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif' }}>Booking Terbaru</h2>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>5 booking terakhir kamu</p>
                </div>
                <Link href="/bookings" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#1C3D2E', textDecoration: 'none', flexShrink: 0 }}>
                  Lihat Semua <ChevronRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Skeleton w={38} h={38} radius={10} />
                      <div style={{ flex: 1 }}><Skeleton w="70%" h={13} /><div style={{ marginTop: 5 }}><Skeleton w="45%" h={11} /></div></div>
                      <Skeleton w={76} h={24} radius={100} />
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div style={{ padding: '52px 20px', textAlign: 'center' }}>
                  <Package size={30} color="#D1D5DB" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Belum ada booking</div>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Temukan vendor event terbaik dan mulai pesan sekarang.</p>
                  <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1C3D2E', background: '#F3F9F5', borderRadius: 100, padding: '9px 18px', textDecoration: 'none' }}>
                    Cari Vendor <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                bookings.map((b, i) => (
                  <Link key={b.id} href="/bookings" style={{ textDecoration: 'none' }}>
                    <div className="booking-row" style={{ borderBottom: i < bookings.length - 1 ? '1px solid #F9F9F7' : 'none' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: '#F3F9F5', display: 'grid', placeItems: 'center', color: '#1C3D2E' }}>
                        <CalendarDays size={17} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.event_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: '#6B7280' }}>{b.vendor?.store_name}</span>
                          <span style={{ fontSize: 10, color: '#D1D5DB' }}>·</span>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{formatDate(b.event_date)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                        <StatusBadge status={b.status} />
                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>{timeAgo(b.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="sidebar-col">
              <div className="dash-card section-anim" style={{ padding: '18px 20px' }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 12px', fontFamily: 'Fraunces, serif' }}>Akses Cepat</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {quickLinks.map(item => (
                    <Link key={item.href} href={item.href} className="quick-link">
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F3F9F5', display: 'grid', placeItems: 'center', color: '#1C3D2E', flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.sub}</div>
                      </div>
                      <ChevronRight size={13} color="#D1D5DB" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="dash-card section-anim" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #F3F4F6' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif' }}>Vendor Tersimpan</h2>
                  <Link href="/bookmarks" style={{ fontSize: 12, fontWeight: 600, color: '#1C3D2E', textDecoration: 'none' }}>Lihat Semua</Link>
                </div>

                {loading ? (
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10 }}>
                        <Skeleton w={38} h={38} radius={10} />
                        <div style={{ flex: 1 }}><Skeleton w="80%" h={12} /><div style={{ marginTop: 5 }}><Skeleton w="55%" h={10} /></div></div>
                      </div>
                    ))}
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                    <Heart size={22} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Belum ada vendor tersimpan.</p>
                  </div>
                ) : (
                  <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {bookmarks.map(bm => (
                      <Link key={bm.id} href={`/vendor/${bm.vendor.slug}`} className="bookmark-item">
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F3F9F5', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 15, fontWeight: 700, color: '#1C3D2E', fontFamily: 'Fraunces, serif' }}>
                          {bm.vendor.store_name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {bm.vendor.store_name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <MapPin size={10} color="#9CA3AF" />
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{bm.vendor.city}</span>
                            <span style={{ fontSize: 10, color: '#D1D5DB' }}>·</span>
                            <Star size={10} fill="#F5A623" color="#F5A623" />
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{bm.vendor.rating_avg.toFixed(1)}</span>
                          </div>
                        </div>
                        <ChevronRight size={13} color="#D1D5DB" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="cta-banner section-anim">
            <div>
              <h3 style={{ fontSize: 'clamp(16px,2.5vw,18px)', fontWeight: 800, color: 'white', margin: '0 0 5px', fontFamily: 'Fraunces, serif' }}>
                Cari vendor untuk event selanjutnya?
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                Temukan ratusan vendor terverifikasi dari seluruh Indonesia.
              </p>
            </div>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F5A623', color: '#1C3D2E', fontWeight: 700, fontSize: 14, borderRadius: 100, padding: '12px 24px', textDecoration: 'none', flexShrink: 0, boxShadow: '0 4px 16px rgba(245,166,35,0.35)' }}>
              Jelajahi Vendor <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}