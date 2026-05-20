'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Shield, Zap, Star } from 'lucide-react';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect') ?? '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [focused,  setFocused]  = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/v1/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error ?? 'Email atau password salah.'); return; }
      const role = data.data?.user?.role;
      if (redirectTo && redirectTo !== '/') router.push(redirectTo);
      else if (role === 'admin') router.push('/admin/vendors');
      else if (role === 'vendor') router.push('/vendor/dashboard');
      else router.push('/dashboard');
      router.refresh();
    } catch { setError('Terjadi kesalahan. Coba lagi.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      const res  = await fetch('/api/v1/auth/google');
      const data = await res.json();
      if (data.success && data.data?.url) window.location.href = data.data.url;
    } catch { setError('Gagal login dengan Google.'); }
  };

  const inputSt = (isFocused: boolean): React.CSSProperties => ({
    width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14,
    outline: 'none', fontFamily: 'inherit', color: '#0f172a',
    background: '#fafafa', boxSizing: 'border-box',
    border: `1.5px solid ${isFocused ? '#0d3b2e' : '#e2e8f0'}`,
    boxShadow: isFocused ? '0 0 0 3px rgba(13,59,46,0.08)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  return (
    <div className="login-wrap">
      <LeftPanel />

      <div className="login-right">
        <div className="login-mobile-logo">
          <Link href="/">
            <img src="/logo_findor.jpg" alt="Findor"
              style={{ height: 38, width: 'auto', objectFit: 'contain', borderRadius: 8 }} />
          </Link>
        </div>

        <div className="login-card">
          <div className="login-card-logo">
            <Link href="/">
              <img src="/logo_findor.jpg" alt="Findor"
                style={{ height: 44, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 className="login-title">Selamat Datang Kembali</h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Masuk untuk melanjutkan ke Findor 👋</p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, padding: '12px 16px', marginBottom: 22,
              fontSize: 13, color: '#dc2626',
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'shake 0.4s ease both',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="login-label">Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="email@contoh.com"
                style={inputSt(focused === 'email')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label className="login-label" style={{ margin: 0 }}>Password</label>
                <Link href="#" style={{ fontSize: 12, color: '#0d3b2e', fontWeight: 600, textDecoration: 'none' }}>
                  Lupa password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Masukkan password"
                  style={{ ...inputSt(focused === 'password'), paddingRight: 46 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="login-submit-btn"
              style={{
                background: loading ? '#e5e7eb' : '#0d3b2e',
                color: loading ? '#9ca3af' : 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(13,59,46,0.28)',
              }}
            >
              {loading ? <><Spinner /> Memproses...</> : <>Masuk ke Findor <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
            <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500, whiteSpace: 'nowrap' }}>atau masuk dengan</span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          </div>

          <button onClick={handleGoogle} className="login-google-btn">
            <GoogleIcon />
            Masuk dengan Google
          </button>

          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 22 }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#0d3b2e', fontWeight: 700, textDecoration: 'none' }}>Daftar gratis</Link>
          </p>
          <p className="login-terms">
            Dengan masuk, Anda menyetujui{' '}
            <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/how-it-works" style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>Kebijakan Privasi</Link>
            {' '}Findor.
          </p>
        </div>
      </div>

      <Styles />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="login-left">
      <div className="login-left-bg" />
      <div className="login-left-glow1" />
      <div className="login-left-glow2" />

      <div className="login-left-inner">
        <Link href="/">
          <img src="/logo_findor.jpg" alt="Findor"
            style={{ height: 44, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
        </Link>

        <div>
          <p className="login-left-eyebrow">✦ Platform Event Indonesia</p>
          <h2 className="login-left-heading">
            Semua Vendor<br />
            <em>Terpercaya</em><br />
            Ada di Sini
          </h2>
          <p className="login-left-sub">
            Dari sound system hingga wedding organizer, temukan dan pesan vendor terbaik untuk acara Anda.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: <Shield size={15} />, text: 'Vendor terverifikasi dengan KTP asli' },
            { icon: <Zap size={15} />,   text: 'Booking & negosiasi langsung via WhatsApp' },
            { icon: <Star size={15} />,  text: 'Ribuan ulasan nyata dari pengguna' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="login-feature-icon">{item.icon}</div>
              <span className="login-feature-text">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="login-testimonial">
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#f5a623" color="#f5a623" />)}
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', marginLeft: 6 }}>4.9/5</span>
          </div>
          <p className="login-testimonial-text">
            &ldquo;Berkat Findor, kami menemukan vendor sound system terbaik untuk konser kami dalam waktu singkat!&rdquo;
          </p>
          <p className="login-testimonial-author">— Budi S., Event Organizer Surabaya</p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function Spinner() {
  return (
    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,300&display=swap');

      @keyframes spin    { to { transform: rotate(360deg); } }
      @keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
      @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

      .login-wrap {
        display: flex; min-height: 100vh;
        font-family: 'Plus Jakarta Sans', Inter, sans-serif;
      }

      .login-left {
        flex: 0 0 44%; position: relative; overflow: hidden;
        background: linear-gradient(160deg, #0a2e20 0%, #0d3b2e 50%, #1a5c41 100%);
      }
      .login-left-bg {
        position: absolute; inset: 0;
        background-image: url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80);
        background-size: cover; background-position: center 40%; opacity: 0.10;
      }
      .login-left-glow1 {
        position: absolute; top: -100px; right: -100px;
        width: 360px; height: 360px; border-radius: 50%;
        background: radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%);
      }
      .login-left-glow2 {
        position: absolute; bottom: -80px; left: -80px;
        width: 280px; height: 280px; border-radius: 50%;
        background: radial-gradient(circle, rgba(64,145,108,0.18) 0%, transparent 70%);
      }
      .login-left-inner {
        position: relative; z-index: 2; height: 100%;
        display: flex; flex-direction: column;
        justify-content: space-between; padding: 48px 40px;
      }
      .login-left-eyebrow {
        font-size: 11px; font-weight: 700; color: #f5a623;
        letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px;
      }
      .login-left-heading {
        font-family: 'Fraunces', serif; font-size: 38px;
        font-weight: 900; color: white; line-height: 1.1;
        letter-spacing: -1.5px; margin-bottom: 20px;
      }
      .login-left-heading em { font-style: italic; color: #f5a623; font-weight: 300; }
      .login-left-sub {
        font-size: 14px; color: rgba(255,255,255,0.55);
        line-height: 1.8; max-width: 280px;
      }
      .login-feature-icon {
        width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        display: flex; align-items: center; justify-content: center;
        color: #f5a623;
      }
      .login-feature-text { font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 500; }
      .login-testimonial {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px; padding: 16px 20px;
        backdrop-filter: blur(10px);
      }
      .login-testimonial-text { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.6; margin: 0; }
      .login-testimonial-author { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 8px; }

      .login-right {
        flex: 1; overflow-y: auto;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: #f8fafc; padding: 40px 24px;
      }
      .login-mobile-logo { display: none; margin-bottom: 24px; }

      .login-card {
        width: 100%; max-width: 460px;
        background: white; border-radius: 24px;
        padding: 44px 48px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
        animation: fadeUp 0.5s ease both;
      }
      .login-card-logo { text-align: center; margin-bottom: 32px; }
      .login-title {
        font-size: 27px; font-weight: 900; color: #0f172a;
        letter-spacing: -0.7px; margin-bottom: 6px;
        font-family: 'Fraunces', serif;
      }
      .login-label {
        font-size: 13px; font-weight: 700; color: #374151;
        letter-spacing: 0.01em; display: block; margin-bottom: 7px;
      }
      .login-submit-btn {
        margin-top: 4px; width: 100%; padding: 15px 20px;
        border-radius: 14px; font-size: 15px; font-weight: 700;
        border: none; font-family: inherit; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .login-google-btn {
        width: 100%; padding: 13px; border-radius: 14px;
        border: 1.5px solid #e2e8f0; background: white;
        font-size: 14px; font-weight: 600; color: #374151; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 10px;
        font-family: inherit; transition: all 0.18s;
      }
      .login-google-btn:hover {
        border-color: #c7d2e0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        background: #f9fafb;
      }
      .login-terms {
        font-size: 11px; color: #cbd5e1;
        text-align: center; margin-top: 10px; line-height: 1.7;
      }

      @media (max-width: 900px) {
        .login-left { flex: 0 0 38%; }
        .login-left-inner { padding: 36px 28px; }
        .login-left-heading { font-size: 30px; }
        .login-left-sub { display: none; }
        .login-card { padding: 36px 32px; }
      }

      @media (max-width: 768px) {
        .login-left { display: none !important; }
        .login-right { padding: 32px 16px; justify-content: flex-start; }
        .login-mobile-logo { display: flex; justify-content: center; }
        .login-card-logo { display: none; }
        .login-card {
          padding: 32px 24px;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .login-title { font-size: 24px; }
      }

      @media (max-width: 480px) {
        .login-right { padding: 24px 16px; background: white; }
        .login-card {
          padding: 24px 20px;
          border-radius: 16px;
          box-shadow: none;
          border: 1px solid #f1f5f9;
        }
        .login-title { font-size: 22px; }
        .login-mobile-logo { margin-bottom: 20px; }
        .login-submit-btn { padding: 14px 16px; font-size: 14px; }
        .login-terms { font-size: 10.5px; }
      }
    `}</style>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f8fafc' }} />}>
      <LoginForm />
    </Suspense>
  );
}