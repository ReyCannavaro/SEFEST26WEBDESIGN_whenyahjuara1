'use client';
import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, MapPin, Star, CheckCircle, ArrowRight, X,
  ChevronDown, SlidersHorizontal, Navigation,
  Music2, Volume2, Construction, Flower2, UtensilsCrossed,
  Clapperboard, Camera, Lightbulb, Mic2, Tent, Car,
  Sparkles, Mail, LayoutGrid, Heart, Award, Loader2, Filter,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const KOTA = [
  'Semua Kota',
  'Jakarta', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur',
  'Surabaya', 'Bandung', 'Yogyakarta', 'Bali', 'Denpasar',
  'Malang', 'Semarang', 'Medan', 'Makassar', 'Palembang',
  'Tangerang', 'Tangerang Selatan', 'Bekasi', 'Depok', 'Bogor',
  'Sidoarjo', 'Balikpapan', 'Manado', 'Batam', 'Pekanbaru',
];

const KATEGORI = [
  { label: 'Semua Kategori', Icon: LayoutGrid },
  { label: 'Wedding Organizer', Icon: Heart },
  { label: 'Sound System', Icon: Volume2 },
  { label: 'Stage & Rigging', Icon: Construction },
  { label: 'Dekorasi & Florist', Icon: Flower2 },
  { label: 'Catering', Icon: UtensilsCrossed },
  { label: 'Dokumentasi', Icon: Clapperboard },
  { label: 'Photography', Icon: Camera },
  { label: 'Lighting Design', Icon: Lightbulb },
  { label: 'Hiburan & Musik', Icon: Music2 },
  { label: 'MC & Host', Icon: Mic2 },
  { label: 'Tenda & Venue', Icon: Tent },
  { label: 'Transportasi', Icon: Car },
  { label: 'Makeup & Salon', Icon: Sparkles },
  { label: 'Undangan Digital', Icon: Mail },
];

interface ServiceInfo {
  id: string; name: string; category: string;
  price_min: number; price_max: number | null; unit: string | null;
}
interface Vendor {
  id: string; store_name: string; slug: string;
  category: string; description: string | null; city: string;
  rating_avg: number; review_count: number; is_verified: boolean;
  services: ServiceInfo[];
}

function formatHarga(services: ServiceInfo[]): string {
  if (!services || services.length === 0) return 'Hubungi vendor';
  const minPrice = Math.min(...services.map(s => s.price_min));
  if (minPrice >= 1_000_000) return `Rp ${(minPrice / 1_000_000).toFixed(0)}jt`;
  if (minPrice >= 1_000) return `Rp ${(minPrice / 1_000).toFixed(0)}rb`;
  return `Rp ${minPrice.toLocaleString('id-ID')}`;
}

const AVATAR_COLORS = ['#1C3D2E','#2D6A4F','#40916C','#1B4332','#0D3B2E'];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function CustomDropdown({ value, onChange, options, icon: TriggerIcon }: {
  value: string; onChange: (v: string) => void;
  options: { label: string; Icon?: React.ComponentType<{ size?: number; color?: string }> }[];
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find(o => o.label === value);
  const SelectedIcon = selected?.Icon;
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button onClick={() => setOpen(p => !p)} className="dd-trigger" style={{ borderColor: open ? '#0d3b2e' : '#e5e7eb', background: open ? '#f0fdf4' : 'white', boxShadow: open ? '0 0 0 3px rgba(13,59,46,0.08)' : '0 1px 4px rgba(0,0,0,0.06)' }}>
        <TriggerIcon size={15} color={open ? '#0d3b2e' : '#9ca3af'} />
        <span className="dd-value" style={{ color: value === options[0].label ? '#9ca3af' : '#111827' }}>
          {SelectedIcon ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><SelectedIcon size={14} color="#0d3b2e" /> {value}</span> : value}
        </span>
        <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="dd-menu">
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {options.map((opt, i) => {
              const OptIcon = opt.Icon;
              const isActive = opt.label === value;
              return (
                <button key={opt.label} onClick={() => { onChange(opt.label); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: isActive ? '#f0fdf4' : 'transparent', border: 'none', borderBottom: i < options.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? '#0d3b2e' : '#374151', textAlign: 'left' }}>
                  {OptIcon && <OptIcon size={15} color={isActive ? '#0d3b2e' : '#9ca3af'} />}
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {isActive && <CheckCircle size={14} color="#0d3b2e" fill="#0d3b2e" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KotaDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const handleDekatSaya = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      () => { onChange('Sidoarjo'); setLocLoading(false); setOpen(false); },
      () => setLocLoading(false)
    );
  };
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button onClick={() => setOpen(p => !p)} className="dd-trigger" style={{ borderColor: open ? '#0d3b2e' : '#e5e7eb', background: open ? '#f0fdf4' : 'white', boxShadow: open ? '0 0 0 3px rgba(13,59,46,0.08)' : '0 1px 4px rgba(0,0,0,0.06)' }}>
        <MapPin size={15} color={open ? '#0d3b2e' : '#9ca3af'} />
        <span className="dd-value" style={{ color: value === 'Semua Kota' ? '#9ca3af' : '#111827' }}>{value}</span>
        <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="dd-menu">
          <button onClick={handleDekatSaya} disabled={locLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f0fdf4', border: 'none', borderBottom: '1.5px solid #e5e7eb', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, color: '#0d3b2e', textAlign: 'left' }}>
            <Navigation size={15} color="#0d3b2e" />
            {locLoading ? 'Mendeteksi lokasi...' : 'Gunakan Lokasi Saya'}
          </button>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {KOTA.map((kota, i) => {
              const isActive = kota === value;
              return (
                <button key={kota} onClick={() => { onChange(kota); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 14px', background: isActive ? '#f0fdf4' : 'transparent', border: 'none', borderBottom: i < KOTA.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? '#0d3b2e' : '#374151', textAlign: 'left' }}>
                  {kota}
                  {isActive && <CheckCircle size={13} color="#0d3b2e" fill="#0d3b2e" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function VendorCard({ v, isHighlighting, idx }: { v: Vendor; isHighlighting: boolean; idx: number }) {
  return (
    <Link href={`/vendor/${v.slug}`} style={{ textDecoration: 'none' }}>
      <div className={`browse-card${isHighlighting ? ' card-pop' : ''}`} style={{ animationDelay: isHighlighting ? `${idx * 60}ms` : '0ms' }}>
        <div style={{ position: 'relative', height: 190, overflow: 'hidden', background: avatarColor(v.store_name) }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.25)', fontFamily: 'Fraunces, serif' }}>
            {v.store_name[0].toUpperCase()}
          </div>
          {v.is_verified && (
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '4px 10px', backdropFilter: 'blur(6px)', zIndex: 2 }}>
              <CheckCircle size={11} color="#16a34a" fill="#16a34a" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>TERVERIFIKASI</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '4px 10px', backdropFilter: 'blur(6px)', zIndex: 2 }}>
            <Star size={11} fill="#f97316" color="#f97316" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{v.rating_avg > 0 ? v.rating_avg.toFixed(1) : '—'}</span>
            {v.review_count > 0 && <span style={{ fontSize: 11, color: '#6b7280' }}>({v.review_count})</span>}
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(13,59,46,0.88)', borderRadius: 999, padding: '4px 12px', zIndex: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{v.category}</span>
          </div>
        </div>
        <div style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>{v.store_name}</p>
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {v.description ?? `${v.category} profesional di ${v.city}`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
            <MapPin size={11} color="#94a3b8" />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{v.city}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Mulai dari</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0d3b2e' }}>{formatHarga(v.services)}</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0d3b2e', display: 'flex', alignItems: 'center', gap: 4 }}>
              Lihat Portfolio <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 18, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
      <div style={{ height: 190, background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 17, width: '70%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 12, width: '100%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 12, width: '60%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: 18, width: 80, borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ height: 18, width: 100, borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  pendingKategori, setPendingKategori,
  pendingKota, setPendingKota,
  pendingKategoriPill, setPendingKategoriPill,
  handleCari, handleReset,
  hasAppliedFilter, appliedKategori, appliedKota,
  onClose,
}: {
  pendingKategori: string; setPendingKategori: (v: string) => void;
  pendingKota: string; setPendingKota: (v: string) => void;
  pendingKategoriPill: string; setPendingKategoriPill: (v: string) => void;
  handleCari: () => void; handleReset: () => void;
  hasAppliedFilter: boolean; appliedKategori: string; appliedKota: string;
  onClose?: () => void;
}) {
  const activeCount = [appliedKategori !== 'Semua Kategori', appliedKota !== 'Semua Kota'].filter(Boolean).length;

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#0d3b2e" />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Filter</span>
          {activeCount > 0 && (
            <span style={{ background: '#0d3b2e', color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              {activeCount}
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

      <div className="filter-section">
        <p className="filter-label">Kategori</p>
        <div className="filter-kategori-list">
          {KATEGORI.map(({ label, Icon }) => {
            const isActive = pendingKategoriPill === label;
            return (
              <button
                key={label}
                onClick={() => { setPendingKategoriPill(label); setPendingKategori(label); }}
                className={`filter-cat-item${isActive ? ' active' : ''}`}
              >
                <Icon size={14} color={isActive ? '#0d3b2e' : '#9ca3af'} />
                <span>{label}</span>
                {isActive && <CheckCircle size={13} color="#0d3b2e" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-label">Kota</p>
        <KotaDropdown value={pendingKota} onChange={setPendingKota} />
      </div>

      <div className="filter-actions">
        <button onClick={handleCari} className="filter-btn-apply">
          <Search size={14} /> Terapkan Filter
        </button>
        {hasAppliedFilter && (
          <button onClick={() => { handleReset(); onClose?.(); }} className="filter-btn-reset">
            <X size={13} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

function SearchContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [pendingQuery,    setPendingQuery]    = useState(searchParams.get('q') ?? '');
  const [pendingKota,     setPendingKota]     = useState(searchParams.get('city') ?? 'Semua Kota');
  const [pendingKategori, setPendingKategori] = useState(searchParams.get('category') ?? 'Semua Kategori');
  const [pendingKategoriPill, setPendingKategoriPill] = useState(searchParams.get('category') ?? 'Semua Kategori');
  const [appliedQuery,    setAppliedQuery]    = useState(searchParams.get('q') ?? '');
  const [appliedKota,     setAppliedKota]     = useState(searchParams.get('city') ?? 'Semua Kota');
  const [appliedKategori, setAppliedKategori] = useState(searchParams.get('category') ?? 'Semua Kategori');
  const [vendors,    setVendors]    = useState<Vendor[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const resultsRef = useRef<HTMLElement>(null);

  const hasPendingChange =
    pendingQuery !== appliedQuery ||
    pendingKota  !== appliedKota  ||
    pendingKategori !== appliedKategori;

  const hasAppliedFilter =
    !!(appliedQuery ||
    appliedKota     !== 'Semua Kota' ||
    appliedKategori !== 'Semua Kategori');

  const activeFilterCount = [
    !!appliedQuery,
    appliedKota !== 'Semua Kota',
    appliedKategori !== 'Semua Kategori',
  ].filter(Boolean).length;

  const fetchVendors = useCallback(async (q: string, city: string, category: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: '12', sort: 'rating' });
      if (q && q.trim())                             params.set('q', q.trim());
      if (city && city !== 'Semua Kota')             params.set('city', city);
      if (category && category !== 'Semua Kategori') params.set('category', category);
      const res  = await fetch(`/api/v1/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.data.vendors ?? []);
        setTotal(data.data.total ?? 0);
        setTotalPages(data.data.total_pages ?? 1);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVendors(appliedQuery, appliedKota, appliedKategori, page); }, [appliedQuery, appliedKota, appliedKategori, page, fetchVendors]);
  useEffect(() => { fetchVendors(appliedQuery, appliedKota, appliedKategori, 1); }, []);

  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleCari = () => {
    setPage(1);
    setAppliedQuery(pendingQuery);
    setAppliedKota(pendingKota);
    setAppliedKategori(pendingKategori);
    const params = new URLSearchParams();
    if (pendingQuery)                          params.set('q',        pendingQuery);
    if (pendingKota !== 'Semua Kota')          params.set('city',     pendingKota);
    if (pendingKategori !== 'Semua Kategori')  params.set('category', pendingKategori);
    router.replace(`/search${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
    setDrawerOpen(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { setIsHighlighting(true); setTimeout(() => setIsHighlighting(false), 900); }, 650);
    }, 80);
  };

  const handlePillClick = (label: string) => {
    setPendingKategoriPill(label);
    setPendingKategori(label);
  };

  const handleReset = () => {
    setPendingQuery(''); setPendingKota('Semua Kota'); setPendingKategori('Semua Kategori'); setPendingKategoriPill('Semua Kategori');
    setAppliedQuery(''); setAppliedKota('Semua Kota'); setAppliedKategori('Semua Kategori');
    setPage(1);
    router.replace('/search', { scroll: false });
  };

  const removeFilter = (type: 'q' | 'city' | 'category') => {
    const newQ    = type === 'q'        ? '' : appliedQuery;
    const newCity = type === 'city'     ? 'Semua Kota' : appliedKota;
    const newCat  = type === 'category' ? 'Semua Kategori' : appliedKategori;
    if (type === 'q')        { setPendingQuery(''); setAppliedQuery(''); }
    if (type === 'city')     { setPendingKota('Semua Kota'); setAppliedKota('Semua Kota'); }
    if (type === 'category') { setPendingKategori('Semua Kategori'); setPendingKategoriPill('Semua Kategori'); setAppliedKategori('Semua Kategori'); }
    setPage(1);
    const params = new URLSearchParams();
    if (newQ)                         params.set('q',        newQ);
    if (newCity !== 'Semua Kota')     params.set('city',     newCity);
    if (newCat  !== 'Semua Kategori') params.set('category', newCat);
    router.replace(`/search${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Navbar />

      <section style={{ position: 'relative', paddingTop: 'clamp(100px, 14vw, 140px)', paddingBottom: 'clamp(48px, 8vw, 80px)', overflow: 'hidden', minHeight: 420 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 40%', filter: 'brightness(0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(13,59,46,0.82) 40%, rgba(13,59,46,0.3) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,59,46,0.9) 0%, transparent 55%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
          <div style={{ marginBottom: 28, animation: 'fadeUp 0.7s 0.1s both' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10, letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>✦ Jelajahi Vendor</p>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 54px)', fontWeight: 900, color: 'white', marginBottom: 10, letterSpacing: '-1.5px', lineHeight: 1.08 }}>
              Temukan Vendor Terbaik<br />
              <em style={{ fontStyle: 'italic', color: '#f5a623', fontWeight: 300 }}>untuk Acara Anda</em>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 460 }}>
              {loading ? '...' : `${total}+`} vendor terverifikasi siap membantu mewujudkan acara impian Anda di seluruh Indonesia.
            </p>
          </div>

          <div style={{ animation: 'fadeUp 0.7s 0.22s both' }}>
            <div className="search-bar-box">
              <div
                className="search-input-wrap"
                onFocusCapture={e => (e.currentTarget.style.borderColor = '#0d3b2e')}
                onBlurCapture={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <Search size={15} color="#9ca3af" strokeWidth={2} />
                <input
                  value={pendingQuery}
                  onChange={e => setPendingQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCari()}
                  placeholder="Cari nama vendor atau layanan..."
                  className="search-input"
                />
                {pendingQuery && (
                  <button onClick={() => setPendingQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9ca3af' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="search-bar-dropdowns">
                <CustomDropdown value={pendingKategori} onChange={v => { setPendingKategori(v); setPendingKategoriPill(v); }} options={KATEGORI} icon={SlidersHorizontal} />
                <KotaDropdown value={pendingKota} onChange={setPendingKota} />
              </div>

              <button onClick={handleCari} className="search-btn-cari" style={{ background: hasPendingChange ? '#0d3b2e' : '#1a5c44', boxShadow: hasPendingChange ? '0 4px 14px rgba(13,59,46,0.35)' : 'none', transform: hasPendingChange ? 'scale(1.02)' : 'scale(1)' }}>
                <Search size={15} /> <span>Cari Vendor</span>
              </button>
            </div>
          </div>

          <div className="hero-pills" style={{ animation: 'fadeUp 0.7s 0.35s both' }}>
            {KATEGORI.slice(0, 8).map(({ label, Icon }) => {
              const isActive = pendingKategoriPill === label;
              return (
                <button key={label} onClick={() => handlePillClick(label)}
                  className={`hero-pill${isActive ? ' active' : ''}`}>
                  <Icon size={12} /> {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={resultsRef} className={isHighlighting ? 'results-highlight' : ''} style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px) 80px', transition: 'background 0.3s' }}>
        <div className="mobile-filter-fab-row">
          <button onClick={() => setDrawerOpen(true)} className="mobile-filter-btn">
            <Filter size={16} />
            Filter
            {activeFilterCount > 0 && <span className="fab-badge">{activeFilterCount}</span>}
          </button>

          <div className="mobile-chips">
            {appliedQuery && (
              <span className="chip"><Search size={10} /> &quot;{appliedQuery}&quot;<button onClick={() => removeFilter('q')} className="chip-x"><X size={9} /></button></span>
            )}
            {appliedKategori !== 'Semua Kategori' && (
              <span className="chip"><SlidersHorizontal size={10} /> {appliedKategori}<button onClick={() => removeFilter('category')} className="chip-x"><X size={9} /></button></span>
            )}
            {appliedKota !== 'Semua Kota' && (
              <span className="chip"><MapPin size={10} /> {appliedKota}<button onClick={() => removeFilter('city')} className="chip-x"><X size={9} /></button></span>
            )}
          </div>
        </div>

        <div className="results-layout">
          <aside className="sidebar-desktop">
            <FilterPanel
              pendingKategori={pendingKategori} setPendingKategori={setPendingKategori}
              pendingKota={pendingKota} setPendingKota={setPendingKota}
              pendingKategoriPill={pendingKategoriPill} setPendingKategoriPill={setPendingKategoriPill}
              handleCari={handleCari} handleReset={handleReset}
              hasAppliedFilter={hasAppliedFilter}
              appliedKategori={appliedKategori} appliedKota={appliedKota}
            />
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {loading
                    ? <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Mencari vendor...</>
                    : <>{total} vendor ditemukan{hasAppliedFilter && <span style={{ fontWeight: 400, color: '#64748b', fontSize: 13 }}> — dari filter</span>}</>
                  }
                </p>
                {hasAppliedFilter && (
                  <div className="desktop-chips">
                    {appliedQuery && (
                      <span className="chip"><Search size={10} /> &quot;{appliedQuery}&quot;<button onClick={() => removeFilter('q')} className="chip-x"><X size={9} /></button></span>
                    )}
                    {appliedKategori !== 'Semua Kategori' && (
                      <span className="chip"><SlidersHorizontal size={10} /> {appliedKategori}<button onClick={() => removeFilter('category')} className="chip-x"><X size={9} /></button></span>
                    )}
                    {appliedKota !== 'Semua Kota' && (
                      <span className="chip"><MapPin size={10} /> {appliedKota}<button onClick={() => removeFilter('city')} className="chip-x"><X size={9} /></button></span>
                    )}
                    <button onClick={handleReset} className="chip chip-reset"><X size={10} /> Reset semua</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                <Award size={13} /> Rating Tertinggi
              </div>
            </div>

            {loading ? (
              <div className="browse-grid">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : vendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: 56, height: 56, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Search size={24} color="#94a3b8" />
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Vendor tidak ditemukan</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Coba ubah kata kunci, kategori, atau kota yang Anda cari.</p>
                <button onClick={handleReset} style={{ padding: '11px 28px', borderRadius: 999, background: '#0d3b2e', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Tampilkan Semua Vendor
                </button>
              </div>
            ) : (
              <>
                <div className="browse-grid">
                  {vendors.map((v, idx) => (
                    <VendorCard key={v.id} v={v} isHighlighting={isHighlighting} idx={idx} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn" style={{ color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                      ← Sebelumnya
                    </button>
                    <span style={{ fontSize: 13, color: '#94a3b8', padding: '0 8px' }}>{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn" style={{ color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                      Berikutnya →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" />
            <FilterPanel
              pendingKategori={pendingKategori} setPendingKategori={setPendingKategori}
              pendingKota={pendingKota} setPendingKota={setPendingKota}
              pendingKategoriPill={pendingKategoriPill} setPendingKategoriPill={setPendingKategoriPill}
              handleCari={handleCari} handleReset={handleReset}
              hasAppliedFilter={hasAppliedFilter}
              appliedKategori={appliedKategori} appliedKota={appliedKota}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,300&display=swap');

        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes sectionFlash { 0%{background:transparent} 30%{background:rgba(13,59,46,0.06)} 100%{background:transparent} }
        @keyframes cardPop  { 0%{transform:translateY(10px) scale(0.98);opacity:0.6} 60%{transform:translateY(-3px) scale(1.01);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }
        @keyframes slideUp  { from{transform:translateY(100%)} to{transform:translateY(0)} }

        .search-bar-box {
          background: white; border-radius: 18px;
          padding: 14px 16px;
          display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
          box-shadow: 0 20px 60px rgba(0,0,0,0.22); max-width: 900px;
        }
        .search-input-wrap {
          display: flex; align-items: center; gap: 10;
          flex: 1 1 200px; padding: 9px 14px;
          border-radius: 12px; border: 1.5px solid #e5e7eb; background: #fafafa;
          transition: border-color 0.18s;
          min-width: 0;
        }
        .search-input {
          border: none; outline: none; flex: 1; font-size: 14px;
          color: #111827; background: transparent; font-family: inherit;
          min-width: 0;
        }
        .search-bar-dropdowns {
          display: flex; gap: 10px; flex: 0 1 420px; flex-wrap: wrap;
        }
        .search-bar-dropdowns > * { flex: 1 1 180px; min-width: 0; }
        .search-btn-cari {
          flex-shrink: 0; display: flex; align-items: center; gap: 8px;
          padding: 12px 20px; border-radius: 12px;
          color: white; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; font-family: inherit;
          white-space: nowrap; transition: all 0.2s;
        }
        .search-btn-cari span { display: inline; }

        .hero-pills {
          margin-top: 18px; display: flex; gap: 8px; flex-wrap: wrap;
        }
        .hero-pill {
          padding: 6px 13px; border-radius: 100px;
          border: 1.5px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.78);
          font-size: 12px; font-weight: 600; cursor: pointer;
          backdrop-filter: blur(8px); transition: all 0.18s;
          font-family: inherit; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
        }
        .hero-pill.active {
          border-color: #f5a623; background: #f5a623; color: #0d3b2e;
        }

        .results-layout {
          display: flex; gap: 28px; align-items: flex-start;
        }

        .sidebar-desktop {
          width: 260px; flex-shrink: 0;
          position: sticky; top: 90px;
        }
        .filter-panel {
          background: white; border-radius: 18px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }
        .filter-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px; border-bottom: 1px solid #f1f5f9;
        }
        .filter-section {
          padding: 16px 18px; border-bottom: 1px solid #f1f5f9;
        }
        .filter-label {
          font-size: 11px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 10px;
        }
        .filter-kategori-list {
          display: flex; flex-direction: column; gap: 2px;
          max-height: 320px; overflow-y: auto;
        }
        .filter-cat-item {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 10px;
          border: none; background: transparent;
          font-size: 13px; font-weight: 400; color: #374151;
          cursor: pointer; font-family: inherit; text-align: left;
          transition: background 0.15s;
        }
        .filter-cat-item:hover { background: #f9fafb; }
        .filter-cat-item.active { background: #f0fdf4; color: #0d3b2e; font-weight: 600; }
        .filter-actions {
          padding: 14px 18px; display: flex; flex-direction: column; gap: 8px;
        }
        .filter-btn-apply {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px; border-radius: 12px;
          background: #0d3b2e; color: white;
          font-size: 13px; font-weight: 700; border: none; cursor: pointer;
          font-family: inherit; transition: background 0.2s;
        }
        .filter-btn-apply:hover { background: #1a5c44; }
        .filter-btn-reset {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 9px; border-radius: 12px;
          background: #fff1f2; color: #ef4444;
          font-size: 12px; font-weight: 600; border: none; cursor: pointer;
          font-family: inherit;
        }

        .dd-trigger {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-radius: 12px; border: 1.5px solid;
          cursor: pointer; font-family: inherit; font-size: 13px;
          font-weight: 500; color: #111827; transition: all 0.18s; text-align: left;
        }
        .dd-value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dd-menu {
          position: absolute; top: calc(100% + 6px); left: 0; width: 100%;
          min-width: 220px; background: white; border-radius: 14px;
          border: 1px solid #e5e7eb; box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          z-index: 50; overflow: hidden;
        }

        .chip {
          font-size: 11px; background: #f0fdf4; color: #16a34a;
          padding: 3px 8px 3px 10px; border-radius: 999px;
          font-weight: 600; border: 1px solid #bbf7d0;
          display: inline-flex; align-items: center; gap: 4px;
          white-space: nowrap;
        }
        .chip-reset {
          background: #fff1f2; color: #ef4444; border-color: #fecaca;
        }
        .chip-x {
          background: none; border: none; cursor: pointer;
          padding: 0 2px; display: flex; color: inherit; opacity: 0.7;
          line-height: 1;
        }
        .chip-x:hover { opacity: 1; }

        .desktop-chips { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; align-items: center; }
        .mobile-chips  { display: flex; gap: 6px; flex-wrap: wrap; overflow-x: auto; }

        .mobile-filter-fab-row {
          display: none;
          align-items: center; gap: 10px;
          margin-bottom: 16px; flex-wrap: wrap;
        }
        .mobile-filter-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 100px;
          background: white; border: 1.5px solid #e5e7eb;
          font-size: 13px; font-weight: 700; color: #0d3b2e;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          position: relative; flex-shrink: 0;
        }
        .fab-badge {
          position: absolute; top: -5px; right: -5px;
          background: #0d3b2e; color: white;
          width: 18px; height: 18px; border-radius: 50%;
          font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }

        .drawer-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 9999; display: flex; align-items: flex-end;
          backdrop-filter: blur(2px);
        }
        .drawer-panel {
          background: white; border-radius: 24px 24px 0 0;
          width: 100%; max-height: 88vh;
          overflow-y: auto; animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1);
          padding-bottom: 32px;
        }
        .drawer-handle {
          width: 40px; height: 4px; background: #e5e7eb;
          border-radius: 2px; margin: 14px auto 6px;
        }

        .browse-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .browse-card { background: white; border-radius: 18px; overflow: hidden;
          border: 1px solid #f1f5f9;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer; }
        .browse-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.10); }
        @media screen and (max-width: 640px) {
          .browse-card:hover { transform: none; box-shadow: none; }
        }

        .results-highlight { animation: sectionFlash 0.9s ease forwards; }
        .card-pop { animation: cardPop 0.4s ease both; }

        .page-btn {
          padding: 9px 18px; border-radius: 100px;
          border: 1px solid #e5e7eb; background: white;
          font-size: 13px; font-weight: 600;
          transition: all 0.15s; font-family: inherit;
        }

        .sidebar-desktop { display: block; }
        .mobile-filter-fab-row { display: none; }
        .desktop-chips { display: flex; }
        .search-bar-dropdowns { display: flex; }

        @media screen and (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .mobile-filter-fab-row { display: flex !important; }
          .desktop-chips { display: none !important; }
          .browse-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
          .search-bar-dropdowns { display: none !important; }
        }

        @media screen and (max-width: 640px) {
          .browse-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .search-btn-cari span { display: none !important; }
          .search-btn-cari { padding: 12px 14px !important; }
          .hero-pills { display: none !important; }
          .mobile-filter-fab-row { flex-wrap: wrap !important; }
          .search-bar-box { padding: 10px 12px !important; border-radius: 14px !important; }
          .search-input-wrap { flex: 1 1 100% !important; }
          .mobile-chips { flex-wrap: wrap !important; overflow-x: visible !important; }
          .results-layout { gap: 0 !important; }
        }
      `}</style>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f7f7f5' }} />}>
      <SearchContent />
    </Suspense>
  );
}