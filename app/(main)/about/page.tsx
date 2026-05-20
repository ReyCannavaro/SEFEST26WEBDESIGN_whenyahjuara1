'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Star, Heart, Zap, MapPin } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const STATS = [
  { value: '2.400+', label: 'Vendor Terverifikasi' },
  { value: '18.000+', label: 'Event Sukses' },
  { value: '99%', label: 'Tingkat Kepuasan' },
  { value: '34', label: 'Kota di Indonesia' },
];

const VALUES = [
  { icon: <Shield size={22} />, title: 'Kepercayaan', desc: 'Setiap vendor melewati verifikasi ketat sebelum tampil di platform. Kami tidak berkompromi soal kualitas.' },
  { icon: <Star size={22} />, title: 'Kurasi Ketat', desc: 'Bukan sekadar direktori. Findor adalah galeri terkurasi — hanya yang terbaik yang layak masuk.' },
  { icon: <Heart size={22} />, title: 'Berpihak pada Klien', desc: 'Garansi dana kembali, mediasi sengketa, dan dukungan 24/7 memastikan Anda selalu terlindungi.' },
  { icon: <Zap size={22} />, title: 'Efisiensi', desc: 'Temukan, negosiasi, dan booking vendor premium dalam satu platform — tanpa ribet, tanpa perantara.' },
];

const TEAM = [
  { name: 'Reyjuno Al Cannvaro', role: 'Co-Founder & CEO', img: '/team/rey.jpg' },
  { name: 'Raffi Akbar Baihaqy', role: 'Co-Founder & CPO', img: '/team/raffi.jpg' },
  { name: 'Arga Fikri Akbar', role: 'Head of Curation', img: '/team/arga.jpg' },
  { name: 'Abbiyu Putra Praditama', role: 'Head of Vendor Relations', img: '/team/bayu.jpg' },
];

const MILESTONES = [
  { year: '2022', title: 'Findor Didirikan', desc: 'Lahir di Sidoarjo dengan misi menghubungkan klien dan vendor event berkualitas.' },
  { year: '2023', title: 'Ekspansi 10 Kota', desc: 'Hadir di Surabaya, Bandung, Bali, Medan, dan 6 kota besar lainnya.' },
  { year: '2024', title: '500+ Vendor Aktif', desc: 'Melampaui 500 vendor terverifikasi dengan tingkat kepuasan klien 99%.' },
  { year: '2025', title: '34 Kota Indonesia', desc: 'Menjadi platform vendor event terluas dengan jangkauan nasional.' },
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />

      <section className="about-hero">
        <img src="/about/hero.jpg" alt="" className="about-hero-img" />
        <div className="about-hero-overlay1" />
        <div className="about-hero-overlay2" />
        <div className="about-hero-content">
          <h1 className="about-hero-title">
            Kami Hadir untuk Membuat<br />Event Anda{' '}
            <em>Tak Terlupakan</em>
          </h1>
          <p className="about-hero-sub">
            Findor adalah platform kurasi vendor event premium pertama di Indonesia — menghubungkan penyelenggara acara dengan vendor terbaik yang telah terverifikasi secara ketat.
          </p>
          <div className="about-hero-cta">
            <Link href="/search" className="btn-primary about-btn">
              Cari Vendor <ArrowRight size={15} />
            </Link>
            <Link href="/how-it-works" className="btn-secondary about-btn">
              Cara Kerja
            </Link>
          </div>
        </div>
      </section>

      <section className="about-stats-section">
        <div className="about-container">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={s.label} className={`stat-item ${i < STATS.length - 1 ? 'stat-item-border' : ''}`}>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-gray">
        <div className="about-container">
          <div className="story-grid">
            <div className="story-text">
              <div className="story-badge">
                <span>Cerita Kami</span>
              </div>
              <h2 className="story-title">
                Lahir dari Frustrasi,<br />Tumbuh dari{' '}
                <em>Kepercayaan</em>
              </h2>
              <p className="story-body">
                Findor lahir pada 2022 ketika para pendirinya mengalami sendiri betapa sulitnya menemukan vendor event yang benar-benar bisa diandalkan.
              </p>
              <p className="story-body">
                Kami membangun Findor dengan satu prinsip:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>hanya vendor yang benar-benar layak yang boleh tampil</strong>.
              </p>
              <div className="story-checklist">
                {['Didirikan di Sidoarjo, 2022', 'Hadir di 34 kota Indonesia', 'Didukung 2.400+ vendor terverifikasi'].map(t => (
                  <div key={t} className="story-check-item">
                    <CheckCircle size={15} color="var(--verified-green)" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="story-img-wrap">
              <img src="/about/story.jpg" alt="Findor story" className="story-img" />
              <div className="story-img-badge">
                <MapPin size={16} color="var(--amber)" />
                <div>
                  <div className="story-img-badge-label">Berbasis di</div>
                  <div className="story-img-badge-value">Sidoarjo, Indonesia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-section-white">
        <div className="about-container">
          <div className="about-section-head">
            <h2 className="about-section-title">Perjalanan Findor</h2>
            <p className="about-section-sub">Dari ide sederhana menjadi platform terpercaya jutaan pengguna.</p>
          </div>
          <div className="milestone-grid">
            {MILESTONES.map((m, i) => (
              <div key={i} className={`milestone-card ${i % 2 === 0 ? 'milestone-dark' : 'milestone-light'}`}>
                <div className={`milestone-year ${i % 2 === 0 ? 'milestone-year-amber' : 'milestone-year-forest'}`}>{m.year}</div>
                <div className={`milestone-title ${i % 2 === 0 ? 'milestone-title-white' : 'milestone-title-dark'}`}>{m.title}</div>
                <div className={`milestone-desc ${i % 2 === 0 ? 'milestone-desc-muted' : 'milestone-desc-secondary'}`}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-gray">
        <div className="about-container">
          <div className="about-section-head">
            <h2 className="about-section-title">Yang Kami Percaya</h2>
            <p className="about-section-sub">Nilai-nilai yang menjadi fondasi setiap keputusan di Findor.</p>
          </div>
          <div className="values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <div>
                  <p className="value-title">{v.title}</p>
                  <p className="value-desc">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-white">
        <div className="about-container">
          <div className="about-section-head">
            <h2 className="about-section-title">Orang-orang di Balik Findor</h2>
            <p className="about-section-sub">Tim yang berdedikasi membangun ekosistem event terbaik di Indonesia.</p>
          </div>
          <div className="team-grid">
            {TEAM.map(t => (
              <div key={t.name} className="team-card">
                <div className="team-img-wrap">
                  <img src={t.img} alt={t.name} className="team-img" />
                  <div className="team-img-overlay" />
                </div>
                <div className="team-info">
                  <p className="team-name">{t.name}</p>
                  <p className="team-role">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-gray">
        <div className="about-container">
          <div className="about-cta-box">
            <img src="/about/cta.jpg" alt="" className="about-cta-img" />
            <div className="about-cta-overlay" />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 className="about-cta-title">
                Siap Wujudkan Event{' '}
                <em>Impian</em> Anda?
              </h2>
              <p className="about-cta-sub">
                Jelajahi ratusan vendor premium yang sudah terverifikasi dan siap membantu acara Anda.
              </p>
              <div className="about-cta-actions">
                <Link href="/search" className="btn-primary about-btn">
                  Cari Vendor <ArrowRight size={15} />
                </Link>
                <Link href="/how-it-works" className="btn-secondary about-btn">
                  Standar Findor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        /* ── Hero ── */
        .about-hero {
          background: var(--forest);
          padding: 120px 24px 90px;
          position: relative; overflow: hidden;
          text-align: center;
        }
        .about-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.45);
        }
        .about-hero-overlay1 {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(13,59,46,0.55) 0%, rgba(13,59,46,0.9) 100%);
        }
        .about-hero-overlay2 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(13,59,46,0.65) 100%);
        }
        .about-hero-content {
          position: relative; z-index: 2;
          max-width: 700px; margin: 0 auto;
        }
        .about-hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 5vw, 58px);
          font-weight: 900; color: var(--white);
          letter-spacing: -1.5px; line-height: 1.08; margin-bottom: 20px;
        }
        .about-hero-title em { font-style: italic; color: var(--amber); font-weight: 300; }
        .about-hero-sub {
          font-size: 15px; color: rgba(255,255,255,0.65);
          line-height: 1.8; max-width: 520px; margin: 0 auto 36px;
        }
        .about-hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .about-btn { font-size: 14px !important; padding: 11px 24px !important; }

        /* ── Layout helpers ── */
        .about-section { padding: 80px 24px; }
        .about-section-gray { background: var(--gray-50); }
        .about-section-white { background: var(--white); }
        .about-container { max-width: 960px; margin: 0 auto; }
        .about-section-head { text-align: center; margin-bottom: 48px; }
        .about-section-title {
          font-family: 'Fraunces', serif; font-size: 32px;
          font-weight: 700; color: var(--text-primary);
          letter-spacing: -0.5px; margin-bottom: 8px;
        }
        .about-section-sub { color: var(--text-secondary); font-size: 15px; }

        /* ── Stats ── */
        .about-stats-section {
          background: var(--white);
          border-bottom: 1px solid var(--gray-100);
          padding: 52px 24px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .stat-item { text-align: center; }
        .stat-item-border {
          border-right: 1px solid var(--gray-100);
          padding-right: 24px;
        }
        .stat-value {
          font-family: 'Fraunces', serif; font-size: 38px;
          font-weight: 900; color: var(--forest);
          letter-spacing: -1px; margin-bottom: 4px; line-height: 1;
        }
        .stat-label { font-size: 13px; color: var(--text-secondary); }

        /* ── Story ── */
        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }
        .story-badge {
          display: inline-flex; align-items: center;
          background: rgba(245,166,35,0.12);
          border: 1px solid rgba(245,166,35,0.25);
          border-radius: 100px; padding: 4px 14px; margin-bottom: 16px;
          font-size: 11px; font-weight: 700; color: var(--amber);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .story-title {
          font-family: 'Fraunces', serif; font-size: 34px;
          font-weight: 700; color: var(--text-primary);
          letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 18px;
        }
        .story-title em { font-style: italic; color: var(--forest); font-weight: 300; }
        .story-body { font-size: 14px; color: var(--text-secondary); line-height: 1.85; margin-bottom: 14px; }
        .story-checklist { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
        .story-check-item { display: flex; align-items: center; gap: 10px; }
        .story-check-item span { font-size: 13px; color: var(--text-primary); font-weight: 500; }
        .story-img-wrap {
          border-radius: var(--radius-xl); overflow: hidden;
          aspect-ratio: 4/3; position: relative;
        }
        .story-img { width: 100%; height: 100%; object-fit: cover; }
        .story-img-badge {
          position: absolute; bottom: 20px; left: 20px;
          background: var(--forest); border-radius: var(--radius-md);
          padding: 12px 18px; display: flex; align-items: center; gap: 10px;
        }
        .story-img-badge-label { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
        .story-img-badge-value { font-size: 13px; font-weight: 700; color: var(--white); }

        /* ── Milestones ── */
        .milestone-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .milestone-card { border-radius: var(--radius-lg); padding: 28px 24px; }
        .milestone-dark { background: var(--forest); }
        .milestone-light { background: var(--gray-50); border: 1px solid var(--gray-100); }
        .milestone-year {
          font-family: 'Fraunces', serif; font-size: 32px;
          font-weight: 900; margin-bottom: 12px; line-height: 1;
        }
        .milestone-year-amber { color: var(--amber); }
        .milestone-year-forest { color: var(--forest); }
        .milestone-title { font-weight: 700; font-size: 14px; margin-bottom: 8px; }
        .milestone-title-white { color: var(--white); }
        .milestone-title-dark { color: var(--text-primary); }
        .milestone-desc { font-size: 13px; line-height: 1.65; }
        .milestone-desc-muted { color: rgba(255,255,255,0.6); }
        .milestone-desc-secondary { color: var(--text-secondary); }

        /* ── Values ── */
        .values-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .value-card {
          background: var(--white); border-radius: var(--radius-lg);
          padding: 24px 26px; border: 1px solid var(--gray-100);
          display: flex; gap: 16px; align-items: flex-start;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .value-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .value-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: var(--forest); display: grid; place-items: center;
          color: var(--amber); flex-shrink: 0;
        }
        .value-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
        .value-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }

        /* ── Team ── */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .team-card {
          background: var(--white); border-radius: var(--radius-lg);
          overflow: hidden; border: 1px solid var(--gray-100);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .team-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .team-img-wrap { aspect-ratio: 1; overflow: hidden; background: var(--gray-100); position: relative; }
        .team-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .team-card:hover .team-img { transform: scale(1.06); }
        .team-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(13,59,46,0.5) 0%, transparent 50%); }
        .team-info { padding: 16px 16px 18px; }
        .team-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
        .team-role { font-size: 12px; color: var(--text-secondary); }

        /* ── CTA ── */
        .about-cta-box {
          background: var(--forest); border-radius: var(--radius-xl);
          padding: 56px 48px; text-align: center;
          position: relative; overflow: hidden;
        }
        .about-cta-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.35);
        }
        .about-cta-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(13,59,46,0.7) 0%, rgba(13,59,46,0.95) 100%);
        }
        .about-cta-title {
          font-family: 'Fraunces', serif; font-size: 34px;
          font-weight: 700; color: var(--white);
          letter-spacing: -0.5px; margin-bottom: 14px; line-height: 1.2;
        }
        .about-cta-title em { font-style: italic; color: var(--amber); font-weight: 300; }
        .about-cta-sub {
          font-size: 15px; color: rgba(255,255,255,0.6);
          line-height: 1.7; margin: 0 auto 32px;
          max-width: 440px;
        }
        .about-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ══ RESPONSIVE ══ */

        /* Tablet ≤ 1024px */
        @media (max-width: 1024px) {
          .milestone-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .team-grid      { grid-template-columns: repeat(2, 1fr) !important; }
          .story-grid     { gap: 40px; }
          .about-section  { padding: 64px 24px; }
          .about-cta-box  { padding: 48px 36px; }
          .about-cta-title { font-size: 28px; }
        }

        /* Tablet kecil ≤ 768px */
        @media (max-width: 768px) {
          .story-grid     { grid-template-columns: 1fr !important; gap: 32px; }
          .values-grid    { grid-template-columns: 1fr !important; }
          .stats-grid     { grid-template-columns: repeat(2, 1fr) !important; gap: 16px; }
          .stat-item-border { border-right: none; padding-right: 0; border-bottom: 1px solid var(--gray-100); padding-bottom: 16px; }
          /* only first two stats get bottom border */
          .stat-item:nth-child(1),
          .stat-item:nth-child(2) { border-bottom: 1px solid var(--gray-100); padding-bottom: 16px; }
          .stat-item:nth-child(3),
          .stat-item:nth-child(4) { border-bottom: none; }
          .about-section  { padding: 48px 16px; }
          .about-section-head { margin-bottom: 36px; }
          .about-section-title { font-size: 26px; }
          .story-title    { font-size: 26px; }
          .about-cta-box  { padding: 36px 24px; }
          .about-cta-title { font-size: 24px; }
          .value-card:hover { transform: none; }
          .team-card:hover { transform: none; }
        }

        /* Mobile ≤ 640px */
        @media (max-width: 640px) {
          .about-hero     { padding: 100px 16px 60px; }
          .about-hero-sub { font-size: 14px; }
          .about-hero-cta { flex-direction: column; align-items: center; }
          .about-btn      { width: 100% !important; justify-content: center; max-width: 280px; }
          .about-stats-section { padding: 36px 16px; }
          .stat-value     { font-size: 30px; }
          .milestone-grid { grid-template-columns: 1fr !important; }
          .milestone-card { padding: 22px 18px; }
          .team-grid      { grid-template-columns: repeat(2, 1fr) !important; gap: 12px; }
          .team-name      { font-size: 13px; }
          .about-cta-box  { padding: 28px 20px; }
          .about-cta-title { font-size: 22px; }
          .about-cta-sub  { font-size: 14px; }
          .about-cta-actions { flex-direction: column; align-items: center; }
          .about-cta-actions a { width: 100%; max-width: 280px; justify-content: center; }
          .about-section-title { font-size: 22px; }
          .story-img-badge { left: 12px; bottom: 12px; padding: 10px 14px; }
        }
      `}</style>
    </main>
  );
}