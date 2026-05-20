'use client';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, XCircle, AlertTriangle,
  Users, Store, Shield, Star, MessageCircle, Ban,
  Search, CalendarCheck, Handshake, BadgeCheck,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const HOW_STEPS = [
  { num: '01', icon: <Search size={24} />, title: 'Cari Vendor', desc: 'Temukan vendor sesuai kategori, lokasi, dan budget. Filter canggih membantu kamu menemukan yang paling cocok.' },
  { num: '02', icon: <MessageCircle size={24} />, title: 'Hubungi & Negosiasi', desc: 'Diskusikan detail event langsung via WhatsApp. Tanyakan paket, ketersediaan, dan sesuaikan kebutuhan.' },
  { num: '03', icon: <CalendarCheck size={24} />, title: 'Booking & DP', desc: 'Lakukan booking resmi dan bayar DP melalui Virtual Account Findor. Dana aman hingga event selesai.' },
  { num: '04', icon: <Handshake size={24} />, title: 'Event Berjalan', desc: 'Vendor hadir profesional di hari H. Tim Findor siap membantu jika ada kendala mendadak.' },
  { num: '05', icon: <BadgeCheck size={24} />, title: 'Selesai & Review', desc: 'Pelunasan dilakukan setelah event sukses. Berikan ulasan untuk membantu komunitas Findor.' },
];

const USER_RULES = [
  { type: 'do', title: 'Komunikasi Lewat WhatsApp', desc: 'Semua negosiasi harga dan kesepakatan dilakukan langsung via WhatsApp dengan vendor.' },
  { type: 'do', title: 'Upload Bukti Transaksi Valid', desc: 'Setelah transfer, upload screenshot atau PDF bukti pembayaran yang jelas dan terbaca.' },
  { type: 'do', title: 'Booking Minimal 14 Hari Sebelum Event', desc: 'Pastikan booking setidaknya 2 minggu sebelum tanggal acara agar vendor dapat mempersiapkan diri.' },
  { type: 'do', title: 'Konfirmasi Detail Event Lengkap', desc: 'Sampaikan lokasi, durasi, jumlah tamu, dan kebutuhan teknis secara jelas kepada vendor.' },
  { type: 'dont', title: 'Dilarang Membatalkan Sepihak', desc: 'Pembatalan kurang dari 7 hari sebelum event tidak mendapat refund. Hubungi tim Findor untuk mediasi.' },
  { type: 'dont', title: 'Dilarang Transaksi di Luar Platform', desc: 'Semua pembayaran DP wajib melalui Virtual Account Findor. Transaksi langsung tidak dilindungi garansi.' },
  { type: 'dont', title: 'Dilarang Memberikan Ulasan Palsu', desc: 'Ulasan hanya boleh diberikan oleh user yang benar-benar menggunakan layanan vendor tersebut.' },
];

const VENDOR_RULES = [
  { type: 'do', title: 'Respons WhatsApp Maksimal 2 Jam', desc: 'Vendor wajib merespons pesan dari calon klien dalam 2 jam di jam kerja (08.00–20.00).' },
  { type: 'do', title: 'Informasi Paket Harus Akurat', desc: 'Deskripsi paket, harga, dan ketersediaan yang ditampilkan di profil harus sesuai kondisi aktual.' },
  { type: 'do', title: 'Hadir Tepat Waktu di Hari H', desc: 'Vendor wajib tiba di lokasi minimal 2 jam sebelum acara dimulai untuk persiapan.' },
  { type: 'do', title: 'Laporkan Kendala Segera', desc: 'Jika ada hambatan teknis atau force majeure, vendor wajib menginformasikan ke klien dan tim Findor.' },
  { type: 'dont', title: 'Dilarang Menolak Klien Tanpa Alasan', desc: 'Penolakan booking hanya diperbolehkan jika tanggal sudah terisi atau ada alasan teknis yang valid.' },
  { type: 'dont', title: 'Dilarang Menaikkan Harga Mendadak', desc: 'Harga yang sudah disepakati tidak boleh diubah secara sepihak setelah klien melakukan DP.' },
  { type: 'dont', title: 'Dilarang Menggunakan Peralatan Tidak Layak', desc: 'Semua peralatan harus sesuai yang tertera di paket dan dalam kondisi baik.' },
];

const VERIFICATION_STEPS = [
  { step: '01', title: 'Verifikasi Identitas', desc: 'KTP pemilik usaha dan NPWP bisnis diperiksa oleh tim Findor.' },
  { step: '02', title: 'Audit Portofolio', desc: 'Minimal 10 dokumentasi event nyata yang dapat diverifikasi.' },
  { step: '03', title: 'Pengecekan Peralatan', desc: 'Tim teknis Findor melakukan inspeksi fisik peralatan utama.' },
  { step: '04', title: 'Uji Respons & Komunikasi', desc: 'Simulasi interaksi klien untuk menilai profesionalisme vendor.' },
  { step: '05', title: 'Review Riwayat Kerja', desc: 'Wawancara dengan minimal 3 klien terdahulu sebagai referensi.' },
];

const SANCTIONS = [
  'Peringatan tertulis pertama dan kedua',
  'Pembekuan akun sementara (7–30 hari)',
  'Penghapusan permanen dari platform Findor',
  'Pelaporan ke pihak berwenang untuk kasus penipuan',
];

function RuleCard({ rule }: { rule: { type: string; title: string; desc: string } }) {
  const isDo = rule.type === 'do';
  return (
    <div className={`rule-card ${isDo ? 'rule-do' : 'rule-dont'}`}>
      <div className={`rule-icon ${isDo ? 'rule-icon-do' : 'rule-icon-dont'}`}>
        {isDo ? <CheckCircle size={17} /> : <XCircle size={17} />}
      </div>
      <div>
        <p className="rule-title">{rule.title}</p>
        <p className="rule-desc">{rule.desc}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="section-header">
      <div className="section-header-icon">{icon}</div>
      <div>
        <h2 className="section-header-title">{title}</h2>
        <p className="section-header-sub">{sub}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />

      <section className="hiw-hero">
        <img src="/how-it-works/hero.JPG" alt="" className="hiw-hero-img" />
        <div className="hiw-hero-overlay1" />
        <div className="hiw-hero-overlay2" />

        <div className="hiw-hero-content">
          <div className="hiw-hero-badge">
            <Shield size={12} color="var(--amber)" />
            <span>Standar Findor</span>
          </div>
          <h1 className="hiw-hero-title">
            Cara Kerja &<br />
            <em>Standar</em> Platform
          </h1>
          <p className="hiw-hero-sub">
            Panduan lengkap untuk user dan vendor agar setiap event berjalan profesional, aman, dan sesuai ekspektasi.
          </p>
          <div className="hiw-hero-cta">
            <Link href="/browse" className="btn-primary hiw-btn">
              Cari Vendor <ArrowRight size={15} />
            </Link>
            <Link href="/vendor/register" className="btn-secondary hiw-btn">
              Daftarkan Layanan
            </Link>
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-section-gray">
        <div className="hiw-container">
          <div className="hiw-section-head">
            <h2 className="hiw-section-title">5 Langkah Mudah</h2>
            <p className="hiw-section-sub">Dari pencarian hingga event sukses — semua terpandu di Findor.</p>
          </div>

          <div className="how-steps-grid">
            {HOW_STEPS.map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {i < HOW_STEPS.length - 1 && (
                  <div className="step-connector" />
                )}
                <div className="how-step-card">
                  <div className="step-icon-wrap">{s.icon}</div>
                  <div className="step-num">{s.num}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-section-white">
        <div className="hiw-container">
          <div className="hiw-block">
            <SectionHeader icon={<Users size={20} />} title="Aturan untuk User" sub="Berlaku untuk semua pengguna yang mencari dan memesan vendor di Findor." />
            <div className="rules-grid">
              {USER_RULES.map((r, i) => <RuleCard key={i} rule={r} />)}
            </div>
          </div>

          <div className="hiw-divider" />

          <div className="hiw-block">
            <SectionHeader icon={<Store size={20} />} title="Aturan untuk Vendor" sub="Berlaku untuk semua vendor yang terdaftar dan aktif di platform Findor." />
            <div className="rules-grid">
              {VENDOR_RULES.map((r, i) => <RuleCard key={i} rule={r} />)}
            </div>
          </div>

          <div className="hiw-divider" />

          <div className="hiw-block">
            <SectionHeader icon={<Star size={20} />} title="Proses Verifikasi 5 Tahap" sub="Setiap vendor melewati seleksi ketat sebelum tampil di platform." />
            <div className="verification-list">
              {VERIFICATION_STEPS.map((s, i) => (
                <div key={i} className="verification-item">
                  {i < VERIFICATION_STEPS.length - 1 && (
                    <div className="verification-line" />
                  )}
                  <div className="verification-dot">
                    <span>{s.step}</span>
                  </div>
                  <div className="verification-card">
                    <p className="verification-title">{s.title}</p>
                    <p className="verification-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sanctions-box">
            <div className="sanctions-icon">
              <AlertTriangle size={22} color="#ea580c" />
            </div>
            <div>
              <h3 className="sanctions-title">Sanksi Pelanggaran</h3>
              <p className="sanctions-sub">Pelanggaran terhadap aturan di atas dapat mengakibatkan:</p>
              <div className="sanctions-list">
                {SANCTIONS.map((s, i) => (
                  <div key={i} className="sanctions-item">
                    <Ban size={12} color="#ea580c" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hiw-cta-box">
            <img src="/how-it-works/cta.JPG" alt="" className="hiw-cta-img" />
            <div className="hiw-cta-overlay" />
            <div className="hiw-cta-text">
              <h3 className="hiw-cta-title">Ada pertanyaan soal aturan ini?</h3>
              <p className="hiw-cta-sub">Tim Findor siap membantu Anda memahami standar platform kami.</p>
            </div>
            <div className="hiw-cta-actions">
              <Link href="/" className="btn-secondary hiw-btn">Kembali ke Beranda</Link>
              <a href="https://wa.me/628001234567" target="_blank" rel="noreferrer" className="hiw-wa-btn">
                <MessageCircle size={14} /> Hubungi Kami
              </a>
            </div>
          </div>

        </div>
      </section>

      <Footer />

      <style>{`
        .hiw-hero {
          background: var(--forest);
          padding: 120px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hiw-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.45);
        }
        .hiw-hero-overlay1 {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(13,59,46,0.6) 0%, rgba(13,59,46,0.88) 100%);
        }
        .hiw-hero-overlay2 {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(13,59,46,0.65) 100%);
        }
        .hiw-hero-content {
          position: relative; z-index: 2;
          max-width: 640px; margin: 0 auto;
        }
        .hiw-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,166,35,0.15);
          border: 1px solid rgba(245,166,35,0.35);
          border-radius: 100px; padding: 6px 16px; margin-bottom: 24px;
          font-size: 11px; font-weight: 600; color: var(--amber);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .hiw-hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 5vw, 56px);
          font-weight: 900; color: var(--white);
          letter-spacing: -1.5px; line-height: 1.08; margin-bottom: 18px;
        }
        .hiw-hero-title em {
          font-style: italic; color: var(--amber); font-weight: 300;
        }
        .hiw-hero-sub {
          font-size: 15px; color: rgba(255,255,255,0.65);
          line-height: 1.8; max-width: 480px;
          margin: 0 auto 32px;
        }
        .hiw-hero-cta {
          display: flex; gap: 12px;
          justify-content: center; flex-wrap: wrap;
        }
        .hiw-btn { font-size: 14px !important; padding: 11px 24px !important; }

        .hiw-section { padding: 80px 24px; }
        .hiw-section-gray { background: var(--gray-50); }
        .hiw-section-white { background: var(--white); }
        .hiw-container { max-width: 960px; margin: 0 auto; }
        .hiw-section-head { text-align: center; margin-bottom: 52px; }
        .hiw-section-title {
          font-family: 'Fraunces', serif; font-size: 32px;
          font-weight: 700; color: var(--text-primary);
          letter-spacing: -0.5px; margin-bottom: 8px;
        }
        .hiw-section-sub { color: var(--text-secondary); font-size: 15px; }
        .hiw-block { margin-bottom: 64px; }
        .hiw-divider { height: 1px; background: var(--gray-100); margin-bottom: 64px; }

        .section-header {
          display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .section-header-icon {
          width: 44px; height: 44px; border-radius: 14px;
          background: var(--forest); display: grid; placeItems: center;
          place-items: center;
          color: var(--amber); flex-shrink: 0;
        }
        .section-header-title {
          font-family: 'Fraunces', serif; font-size: 22px;
          font-weight: 700; color: var(--text-primary);
          letter-spacing: -0.3px; margin-bottom: 2px;
        }
        .section-header-sub { font-size: 14px; color: var(--text-secondary); }

        .how-steps-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .step-connector {
          position: absolute; top: 28px;
          left: 60%; right: -40%;
          height: 2px;
          background: linear-gradient(to right, var(--amber), var(--gray-200));
          z-index: 0;
        }
        .how-step-card {
          background: var(--white); border-radius: var(--radius-lg);
          padding: 24px 18px; border: 1px solid var(--gray-100);
          text-align: center; position: relative; z-index: 1;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .how-step-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .step-icon-wrap {
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--forest); margin: 0 auto 14px;
          display: grid; place-items: center; color: var(--amber);
        }
        .step-num {
          font-size: 11px; font-weight: 700; color: var(--amber);
          letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px;
        }
        .step-title { font-weight: 700; font-size: 15px; color: var(--text-primary); margin-bottom: 8px; }
        .step-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.65; }

        .rules-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .rule-card {
          background: var(--white); border-radius: var(--radius-lg);
          padding: 20px 22px; display: flex; gap: 14px; align-items: flex-start;
        }
        .rule-do { border: 1px solid #d1fae5; }
        .rule-dont { border: 1px solid #fee2e2; }
        .rule-icon {
          width: 34px; height: 34px; border-radius: 10px;
          flex-shrink: 0; display: grid; place-items: center;
        }
        .rule-icon-do { background: #dcfce7; color: var(--verified-green); }
        .rule-icon-dont { background: #fee2e2; color: var(--danger); }
        .rule-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
        .rule-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.65; }

        .verification-list { display: flex; flex-direction: column; gap: 0; }
        .verification-item {
          display: flex; gap: 20px; align-items: flex-start;
          position: relative;
          padding-bottom: 24px;
        }
        .verification-item:last-child { padding-bottom: 0; }
        .verification-line {
          position: absolute; left: 21px; top: 46px;
          width: 2px; height: calc(100% - 16px);
          background: var(--gray-100);
        }
        .verification-dot {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--forest); display: grid; place-items: center;
          flex-shrink: 0; z-index: 1;
        }
        .verification-dot span { font-size: 12px; font-weight: 800; color: var(--amber); }
        .verification-card {
          background: var(--gray-50); border-radius: var(--radius-md);
          padding: 16px 20px; flex: 1; border: 1px solid var(--gray-100);
        }
        .verification-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
        .verification-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

        .sanctions-box {
          background: #fff7ed; border: 1px solid #fed7aa;
          border-radius: var(--radius-xl); padding: 28px 32px;
          display: flex; gap: 20px; align-items: flex-start;
          margin-bottom: 64px; flex-wrap: wrap;
        }
        .sanctions-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: #ffedd5; display: grid; place-items: center; flex-shrink: 0;
        }
        .sanctions-title { font-size: 17px; font-weight: 700; color: #9a3412; margin-bottom: 8px; }
        .sanctions-sub { font-size: 14px; color: #7c2d12; line-height: 1.7; margin-bottom: 12px; }
        .sanctions-list { display: flex; flex-direction: column; gap: 7px; }
        .sanctions-item { display: flex; align-items: center; gap: 8px; }
        .sanctions-item span { font-size: 14px; color: #7c2d12; }

        .hiw-cta-box {
          background: var(--forest); border-radius: var(--radius-xl);
          padding: 40px 48px; position: relative; overflow: hidden;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 24px;
        }
        .hiw-cta-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.35);
        }
        .hiw-cta-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(100deg, rgba(13,59,46,0.95) 40%, rgba(13,59,46,0.5) 100%);
        }
        .hiw-cta-text { position: relative; z-index: 1; }
        .hiw-cta-title {
          font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700;
          color: var(--white); margin-bottom: 6px; letter-spacing: -0.3px;
        }
        .hiw-cta-sub { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; }
        .hiw-cta-actions {
          display: flex; gap: 10px; position: relative; z-index: 1; flex-wrap: wrap;
        }
        .hiw-wa-btn {
          padding: 10px 20px; border-radius: 100px;
          background: #25D366; color: white;
          font-size: 13px; font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
        }

        @media (max-width: 1024px) {
          .how-steps-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .step-connector { display: none; }
          .rules-grid { grid-template-columns: 1fr 1fr; }
          .hiw-cta-box { padding: 32px 28px; }
          .hiw-cta-title { font-size: 20px; }
          .hiw-section { padding: 60px 24px; }
        }

        @media (max-width: 768px) {
          .how-steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .rules-grid { grid-template-columns: 1fr !important; }
          .hiw-section { padding: 48px 16px; }
          .hiw-block { margin-bottom: 48px; }
          .hiw-divider { margin-bottom: 48px; }
          .hiw-section-head { margin-bottom: 36px; }
          .hiw-section-title { font-size: 26px; }
          .sanctions-box { padding: 20px; flex-direction: row; gap: 14px; }
          .hiw-cta-box {
            padding: 28px 20px;
            flex-direction: column;
            align-items: flex-start;
          }
          .hiw-cta-title { font-size: 18px; }
          .section-header { gap: 12px; }
          .section-header-title { font-size: 19px; }
        }

        @media (max-width: 640px) {
          .hiw-hero { padding: 100px 16px 60px; }
          .hiw-hero-sub { font-size: 14px; }
          .hiw-hero-cta { flex-direction: column; align-items: center; }
          .hiw-btn { width: 100%; justify-content: center; max-width: 280px; }
          .how-steps-grid { grid-template-columns: 1fr !important; }
          .hiw-section { padding: 40px 16px; }
          .hiw-section-title { font-size: 22px; }
          .hiw-cta-actions { flex-direction: column; width: 100%; }
          .hiw-cta-actions a { text-align: center; justify-content: center; }
          .how-step-card { padding: 20px 16px; }
          .how-step-card:hover { transform: none; }
          .verification-card { padding: 14px 16px; }
          .sanctions-box { padding: 18px 16px; }
          .sanctions-title { font-size: 15px; }
        }
      `}</style>
    </main>
  );
}