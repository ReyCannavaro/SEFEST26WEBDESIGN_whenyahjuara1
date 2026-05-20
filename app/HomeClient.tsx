'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, CheckCircle, Shield,
  ArrowRight, ArrowLeft, ChevronRight, Volume2, Lightbulb,
  Camera, UtensilsCrossed, Tent, Music, MapPin,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const SLIDES = [
  {
    id: 0,
    image: '/hero/wedding.jpg',
    headlinePart1: 'Wujudkan Event',
    headlineItalic: 'Impian',
    headlinePart2: 'Tanpa Hambatan',
    subtext: 'Temukan vendor pernikahan, dekorasi, catering, dan fotografer terbaik — semua di satu platform.',
  },
  {
    id: 1,
    image: '/hero/corporate.jpg',
    headlinePart1: 'Event Korporat',
    headlineItalic: 'Berkesan',
    headlinePart2: '& Profesional',
    subtext: 'Dari seminar hingga gala dinner — vendor pilihan siap menjadikan setiap momen perusahaan Anda luar biasa.',
  },
  {
    id: 2,
    image: '/hero/birthday.jpg',
    headlinePart1: 'Pesta',
    headlineItalic: 'Spesial',
    headlinePart2: 'Layak Dapat Yang Terbaik',
    subtext: 'Birthday, sweet seventeen, atau gathering keluarga — findor hadir memastikan setiap detail sempurna.',
  },
];

const HERO_STATS = [
  { num: '2.400', suffix: '+', desc: 'Vendor Terverifikasi' },
  { num: '18.000', suffix: '+', desc: 'Event Sukses' },
  { num: '99', suffix: '%', desc: 'Kepuasan Klien' },
  { num: '34', suffix: '', desc: 'Kota di Indonesia' },
];

const SLIDE_DURATION = 5500;

const CATEGORIES_SMALL = [
  { icon: <Volume2 size={20} />, label: 'Sound System', count: 87, image: '/categories/sound.jpg' },
  { icon: <Lightbulb size={20} />, label: 'Decoration', count: 203, image: '/categories/decoration.jpg' },
  { icon: <Camera size={20} />, label: 'Documentation', count: 91, image: '/categories/documentation.jpg' },
  { icon: <Music size={20} />, label: 'Entertainment', count: 64, image: '/categories/entertainment.jpg' },
];

interface ApiVendor {
  id: string; store_name: string; slug: string;
  category: string; description: string | null; city: string;
  rating_avg: number; review_count: number; is_verified: boolean;
  services: { id: string; price_min: number; price_max: number | null }[];
}

const TRUST_ITEMS = [
  { icon: <Shield size={18} />, title: 'Garansi Layanan', desc: 'Dana kembali 100% jika vendor tidak hadir di hari H.' },
  { icon: <CheckCircle size={18} />, title: 'Verifikasi 5 Tahap', desc: 'Kami mengecek langsung kualitas fisik peralatan vendor.' },
];

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [active, setActive] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    setActive(false);
    setTimeout(() => {
      setCurrent(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
      setActive(true);
    }, 80);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goTo(current + 1), SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, goTo]);

  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo]);

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) goTo(dx > 0 ? current + 1 : current - 1);
  };

  const slide = SLIDES[current];

  return (
    <section
      className="hero-section"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        key={`bg-${current}`}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${slide.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.55)',
          animation: 'heroZoom 7s ease-out forwards',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(13,59,46,0.75) 38%, rgba(13,59,46,0.15) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,59,46,0.85) 0%, transparent 60%)' }} />

      <div className="hero-content-wrapper">
        {active && (
          <div className="hero-text-block">
            <h1 className="hero-headline">
              {slide.headlinePart1}
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--amber)', fontWeight: 300 }}>
                {slide.headlineItalic}
              </em>{' '}
              {slide.headlinePart2}
              <span style={{ color: 'var(--amber)' }}>.</span>
            </h1>
            <p className="hero-subtext">{slide.subtext}</p>
            <div className="hero-cta-row">
              <Link href="/search" className="btn-primary hero-cta-btn">
                Cari Vendor <ArrowRight size={17} />
              </Link>
              <span className="hero-slide-counter">
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {String(current + 1).padStart(2, '0')}
                </span>{' '}/ {String(SLIDES.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => goTo(current - 1)} aria-label="Sebelumnya" className="hero-arrow hero-arrow-left">
        <ArrowLeft size={20} />
      </button>
      <button onClick={() => goTo(current + 1)} aria-label="Berikutnya" className="hero-arrow hero-arrow-right">
        <ArrowRight size={20} />
      </button>

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? 28 : 8, height: 8,
              borderRadius: 100,
              background: i === current ? 'var(--amber)' : 'rgba(255,255,255,0.25)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'background 0.3s, width 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        ))}
      </div>

      <div className="hero-stats-bar">
        {HERO_STATS.map((s, i) => (
          <div
            key={i}
            className="hero-stat-item"
            style={{
              borderRight: i < HERO_STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
              opacity: statsVisible ? 1 : 0,
              transition: `transform 0.6s ${i * 0.12}s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ${i * 0.12}s ease`,
            }}
          >
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(18px, 2.5vw, 30px)', fontWeight: 700, color: 'var(--white)', lineHeight: 1 }}>
              {s.num}<span style={{ color: 'var(--amber)' }}>{s.suffix}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .hero-section {
          position: relative; width: 100%; height: 100vh;
          min-height: 560px; overflow: hidden; background: var(--forest);
        }
        .hero-content-wrapper {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto;
          padding: 130px clamp(20px, 5vw, 48px) 200px;
          width: 100%; height: 100%; display: flex; align-items: center;
        }
        .hero-text-block { max-width: 620px; }
        .hero-headline {
          font-family: 'Fraunces', serif;
          font-size: clamp(36px, 5.5vw, 78px);
          font-weight: 900; color: var(--white);
          line-height: 1.04; letter-spacing: -2px;
          margin-bottom: 20px;
          animation: heroFadeUp 0.75s 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-subtext {
          font-size: clamp(14px, 1.6vw, 18px);
          color: rgba(255,255,255,0.62); max-width: 480px;
          line-height: 1.7; margin-bottom: 32px; font-weight: 300;
          animation: heroFadeUp 0.75s 0.42s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-cta-row {
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
          animation: heroFadeUp 0.7s 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 15px; padding: 14px 30px; border-radius: 100px;
        }
        .hero-slide-counter {
          color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 300; letter-spacing: 0.05em;
        }
        .hero-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 10; width: 48px; height: 48px; border-radius: 50%;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(12px); display: grid; place-items: center;
          cursor: pointer; color: white; transition: background 0.2s;
        }
        .hero-arrow:hover { background: rgba(255,255,255,0.18); }
        .hero-arrow-left { left: 32px; }
        .hero-arrow-right { right: 32px; }
        .hero-dots {
          position: absolute; left: 50%; bottom: 140px;
          transform: translateX(-50%); z-index: 10;
          display: flex; align-items: center; gap: 10px;
        }
        .hero-stats-bar {
          position: absolute; bottom: 36px; left: 0; right: 0; z-index: 4;
          max-width: 1200px; margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 48px);
          display: flex; align-items: center;
        }
        .hero-stat-item {
          flex: 1;
          padding-right: clamp(12px, 2.5vw, 32px);
          margin-right: clamp(12px, 2.5vw, 32px);
        }
        .hero-stat-item:last-child { padding-right: 0; margin-right: 0; }

        @media (max-width: 768px) {
          .hero-content-wrapper { padding-bottom: 220px; }
          .hero-arrow { display: none; }
          .hero-dots { bottom: 160px; }
          .hero-stats-bar {
            bottom: 20px; flex-wrap: wrap; gap: 8px;
          }
          .hero-stat-item {
            flex: 0 0 calc(50% - 8px);
            padding: 8px 12px; margin: 0;
            border-right: none !important;
            background: rgba(255,255,255,0.07);
            border-radius: 10px;
          }
        }
        @media (max-width: 480px) {
          .hero-section { min-height: 100svh; }
          .hero-headline { letter-spacing: -1px; }
          .hero-content-wrapper { padding-bottom: 80px; align-items: flex-end; padding-top: 100px; }
          .hero-dots { bottom: 24px; }
          .hero-stats-bar { display: none; }
        }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroZoom {
          from { transform: scale(1.08); }
          to   { transform: scale(1.0); }
        }
      `}</style>
    </section>
  );
}

function formatHarga(services: { price_min: number }[]): string {
  if (!services || services.length === 0) return 'Hubungi vendor';
  const min = Math.min(...services.map(s => s.price_min));
  if (min >= 1_000_000) return `Rp ${(min / 1_000_000).toFixed(0)}jt`;
  if (min >= 1_000) return `Rp ${(min / 1_000).toFixed(0)}rb`;
  return `Rp ${min.toLocaleString('id-ID')}`;
}

export default function HomeClient() {
  const router = useRouter();
  const [popularVendors, setPopularVendors] = useState<ApiVendor[]>([]);
  const [vendorLoading, setVendorLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/search?sort=rating&per_page=4')
      .then(r => r.json())
      .then(d => { if (d.success) setPopularVendors(d.data.vendors ?? []); })
      .catch(() => {})
      .finally(() => setVendorLoading(false));
  }, []);

  const handleViewDetail = (slug: string) => router.push(`/vendor/${slug}`);

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <section className="home-section bg-white">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Kategori Utama</h2>
              <p className="section-sub">Temukan spesialis untuk setiap detail acara Anda.</p>
            </div>
            <Link href="/search" className="see-all-link">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>

          <div className="cat-bento">
            <Link href="/search?kategori=Stage+%26+Rigging" className="cat-featured cat-card" style={{ textDecoration: 'none' }}>
              <img src="/categories/stage.jpg" alt="Stage & Rigging" className="cat-img" />
              <div className="cat-overlay-gradient" />
              <div className="cat-info">
                <div className="cat-badge">Terpopuler</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="cat-icon-box"><Tent size={18} /></div>
                  <div className="cat-name-large">Stage &amp; Rigging</div>
                </div>
                <div className="cat-count-text">124 Vendor Terverifikasi</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontSize: 13, fontWeight: 600, flexDirection: 'row-reverse' }}>
                  <ArrowRight size={14} /> Jelajahi
                </div>
              </div>
            </Link>

            <div className="cat-small-grid">
              {CATEGORIES_SMALL.map(cat => (
                <Link key={cat.label} href={`/search?kategori=${encodeURIComponent(cat.label)}`} className="cat-card cat-small" style={{ textDecoration: 'none' }}>
                  <img src={cat.image} alt={cat.label} className="cat-img" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)' }} />
                  <div style={{ position: 'relative', padding: '14px 16px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="cat-icon-box" style={{ width: 32, height: 32, borderRadius: 8 }}>{cat.icon}</div>
                      <div>
                        <div className="cat-name-small">{cat.label}</div>
                        <div className="cat-count-text">{cat.count} vendor</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/search?kategori=Catering+Service" className="cat-wide cat-card" style={{ textDecoration: 'none' }}>
              <img src="/categories/catering.jpg" alt="Catering Service" className="cat-img" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(13,59,46,0.92) 35%, rgba(13,59,46,0.2) 100%)' }} />
              <div className="cat-wide-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div className="cat-icon-box cat-icon-lg"><UtensilsCrossed size={24} /></div>
                  <div>
                    <div className="cat-name-large">Catering Service</div>
                    <div className="cat-count-text">156 Vendor Terverifikasi · Premium &amp; Budget Friendly</div>
                  </div>
                </div>
                <div className="cat-wide-btn">
                  Lihat Semua <ArrowRight size={15} color="var(--forest)" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section bg-gray">
        <div className="container">
          <div style={{ marginBottom: 40 }}>
            <h2 className="section-title">Vendor Terpopuler</h2>
            <p className="section-sub">Yang paling banyak dicari dan dipercaya oleh klien premium.</p>
          </div>
          <div className="vendor-grid">
            {vendorLoading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--white)', border: '1px solid #f0f0ec' }}>
                    <div style={{ aspectRatio: '4/3', background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ height: 16, width: '70%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
                      <div style={{ height: 13, width: '50%', borderRadius: 6, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
                      <div style={{ height: 34, width: '100%', borderRadius: 100, background: '#f0f0ec', animation: 'shimmer 1.5s infinite' }} />
                    </div>
                  </div>
                ))
              : popularVendors.map(v => (
                <div key={v.id} className="vendor-card">
                  <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#1C3D2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.2)', fontFamily: 'Fraunces, serif' }}>
                      {v.store_name[0].toUpperCase()}
                    </span>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 100, padding: '3px 8px', fontSize: 12, fontWeight: 700, color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={10} fill="var(--amber)" color="var(--amber)" /> {v.rating_avg > 0 ? v.rating_avg.toFixed(1) : '—'}
                    </div>
                    {v.is_verified && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 100, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}>
                        ✓ Verified
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{v.store_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{v.category}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      <MapPin size={11} /> {v.city}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Starts from</span>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--forest)' }}>{formatHarga(v.services)}</div>
                      </div>
                      <button
                        onClick={() => handleViewDetail(v.slug)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--forest)', background: 'var(--amber)', borderRadius: 100, padding: '7px 14px', border: 'none', cursor: 'pointer' }}
                      >
                        Portofolio <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      <section className="home-section bg-white">
        <div className="container">
          <div className="trust-grid">
            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>
                Kurasi Ketat Untuk<br />Keamanan Anda.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Setiap vendor dengan badge <strong>Terpercaya</strong> telah melewati verifikasi legalitas, pengecekan peralatan, dan audit riwayat pekerjaan.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {TRUST_ITEMS.map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--verified-green)', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="#" className="btn-forest" style={{ display: 'inline-flex' }}>
                Pelajari Standar Findor <ArrowRight size={16} />
              </Link>
            </div>

            <div className="trust-images">
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--forest)', position: 'relative' }}>
                <img src="/trust/vendor1.jpg" alt="vendor" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, mixBlendMode: 'luminosity' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'var(--amber)', borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>GOLD VENDOR</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-100)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Standard Kualitas Global</div>
                </div>
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '1', background: 'var(--forest)', position: 'relative' }}>
                  <img src="/trust/speaker.jpg" alt="speaker" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)', fontFamily: 'Fraunces, serif' }}>500+</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Vendor Terverifikasi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <img src="/cta/bg.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,59,46,0.55) 0%, rgba(13,59,46,0.82) 50%, rgba(13,59,46,0.55) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,59,46,0.7) 100%)' }} />
        <div className="cta-inner">
          <h2 className="cta-title">Punya Vendor Event Berkualitas?</h2>
          <p className="cta-sub">
            Dapatkan akses ke ribuan klien premium di seluruh Indonesia. Mulai kembangkan bisnis event Anda hari ini.
          </p>
          <div className="cta-buttons">
            <Link href="/vendor/dashboard" className="btn-primary">Daftar Sebagai Vendor</Link>
            <Link href="#" className="btn-secondary">Hubungi Consultant</Link>
          </div>
        </div>
      </section>

      <style>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .home-section { padding: clamp(48px, 8vw, 80px) 0; }
        .bg-white { background: var(--white); }
        .bg-gray { background: var(--gray-50); }

        .section-header {
          display: flex; justify-content: space-between;
          align-items: flex-end; margin-bottom: 36px;
          gap: 16px; flex-wrap: wrap;
        }
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 700; color: var(--text-primary);
          letter-spacing: -0.5px; margin-bottom: 6px; line-height: 1.15;
        }
        .section-sub { color: var(--text-secondary); font-size: 15px; }
        .see-all-link {
          display: flex; align-items: center; gap: 6px;
          color: var(--forest); font-weight: 600; font-size: 14px;
          text-decoration: none; white-space: nowrap; flex-shrink: 0;
        }

        .cat-bento {
          display: grid;
          grid-template-columns: 1fr 2fr;
          grid-template-rows: auto auto;
          gap: 16px;
        }
        .cat-featured {
          grid-row: 1 / 3;
          position: relative; border-radius: 20px; overflow: hidden;
          min-height: 380px; background: var(--forest);
          display: flex; align-items: flex-end;
        }
        .cat-small-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .cat-small {
          position: relative; border-radius: 18px; overflow: hidden;
          height: 170px; background: var(--gray-50);
          display: flex; align-items: flex-end;
        }
        .cat-wide {
          grid-column: 2 / 3;
          position: relative; border-radius: 20px; overflow: hidden;
          height: 170px; background: var(--forest);
          display: flex; align-items: center;
        }
        .cat-wide-inner {
          position: relative; padding: 0 32px;
          display: flex; align-items: center;
          justify-content: space-between; width: 100%; gap: 16px;
        }
        .cat-wide-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--amber); border-radius: 100px;
          padding: 10px 20px; flex-shrink: 0;
          font-size: 13px; font-weight: 700; color: var(--forest);
          white-space: nowrap;
        }
        .cat-overlay-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(13,59,46,0.95) 0%, rgba(13,59,46,0.15) 55%, transparent 100%);
        }
        .cat-info { position: relative; padding: 28px; }
        .cat-badge {
          display: inline-flex; align-items: center;
          background: var(--amber); border-radius: 100px;
          padding: 4px 12px; margin-bottom: 14px;
          font-size: 11px; font-weight: 700; color: var(--forest);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .cat-icon-box {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.12);
          display: grid; place-items: center;
          color: white; backdrop-filter: blur(8px); flex-shrink: 0;
        }
        .cat-icon-lg { width: 52px; height: 52px; border-radius: 14px; }
        .cat-name-large {
          font-weight: 800; color: var(--white);
          font-size: clamp(16px, 2vw, 22px);
          font-family: 'Fraunces', serif; letter-spacing: -0.5px;
        }
        .cat-name-small {
          font-family: 'Fraunces', serif; font-weight: 700;
          color: var(--white); font-size: 15px;
          margin-bottom: 2px; letter-spacing: -0.3px;
        }
        .cat-count-text { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .cat-card { transition: box-shadow 0.3s, transform 0.3s; }
        .cat-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.18); transform: translateY(-3px); }
        .cat-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; transition: transform 0.5s ease;
        }
        .cat-card:hover .cat-img { transform: scale(1.06); }

        @media (max-width: 900px) {
          .cat-bento {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
          }
          .cat-featured { grid-row: 1; min-height: 280px; }
          .cat-small-grid { grid-column: 2; grid-row: 1; }
          .cat-wide { grid-column: 1 / 3; grid-row: 2; }
        }
        @media (max-width: 600px) {
          .cat-bento { grid-template-columns: 1fr; }
          .cat-featured { grid-row: auto; min-height: 240px; }
          .cat-small-grid { grid-column: 1; grid-row: auto; }
          .cat-small { height: 140px; }
          .cat-wide {
            grid-column: 1; grid-row: auto;
            height: auto; min-height: 120px;
          }
          .cat-wide-inner {
            flex-direction: column; align-items: flex-start;
            padding: 20px; gap: 12px;
          }
          .cat-wide-btn { width: 100%; justify-content: center; }
        }

        .vendor-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .vendor-card {
          background: var(--white); border-radius: 16px;
          overflow: hidden; transition: box-shadow 0.3s, transform 0.2s;
          border: 1px solid #f0f0ec;
        }
        .vendor-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.12); transform: translateY(-2px); }
        @media (max-width: 1024px) { .vendor-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .vendor-grid { grid-template-columns: 1fr; } }

        .trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .trust-images {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 900px) {
          .trust-grid { grid-template-columns: 1fr; gap: 40px; }
          .trust-images { max-width: 480px; }
        }
        @media (max-width: 480px) {
          .trust-images { max-width: 100%; }
        }

        .cta-section {
          padding: clamp(60px, 10vw, 100px) clamp(16px, 4vw, 24px);
          background: var(--forest);
          position: relative; overflow: hidden;
        }
        .cta-inner {
          position: relative; z-index: 2;
          max-width: 700px; margin: 0 auto; text-align: center;
        }
        .cta-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 700; color: var(--white);
          letter-spacing: -0.5px; margin-bottom: 16px; line-height: 1.2;
        }
        .cta-sub {
          color: rgba(255,255,255,0.7);
          font-size: clamp(14px, 2vw, 16px);
          line-height: 1.7; margin-bottom: 36px;
        }
        .cta-buttons {
          display: flex; gap: 12px;
          justify-content: center; flex-wrap: wrap;
        }
        @media (max-width: 480px) {
          .cta-buttons { flex-direction: column; align-items: stretch; }
          .cta-buttons a { text-align: center; }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <Footer />
    </main>
  );
}