'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Findor Error]', error);
  }, [error]);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--gray-50, #F9F9F7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: 'clamp(20px, 5vw, 40px)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%', animation: 'fadeUp 0.6s ease both' }}>

        <Link href="/" style={{ display: 'inline-block', marginBottom: 'clamp(28px, 5vw, 44px)' }}>
          <img src="/logo_findor.jpg" alt="Findor" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
        </Link>

        <div style={{ marginBottom: 'clamp(20px, 4vw, 28px)' }}>
          <div style={{
            width: 'clamp(64px, 12vw, 80px)',
            height: 'clamp(64px, 12vw, 80px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(220,38,38,0.25)',
            animation: 'popIn 0.5s 0.3s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <svg
              viewBox="0 0 24 24" fill="none" stroke="white"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 'clamp(28px,5vw,36px)', height: 'clamp(28px,5vw,36px)' }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        <h1 style={{
          fontSize: 'clamp(20px, 4vw, 26px)',
          fontWeight: 800, color: '#1A1917',
          marginBottom: 10, letterSpacing: '-0.5px',
        }}>
          Terjadi Kesalahan
        </h1>
        <p style={{
          fontSize: 'clamp(13px, 2vw, 15px)',
          color: '#6B6960', lineHeight: 1.7,
          marginBottom: error.digest ? 10 : 'clamp(24px, 4vw, 32px)',
          padding: '0 clamp(0px, 2vw, 16px)',
        }}>
          Ada sesuatu yang tidak berjalan sebagaimana mestinya.
          Coba muat ulang halaman — biasanya ini berhasil.
        </p>

        {error.digest && (
          <p style={{
            fontSize: 11, color: '#9E9C94',
            fontFamily: 'monospace',
            background: '#F0EFEB',
            display: 'inline-block',
            padding: '4px 10px', borderRadius: 6,
            marginBottom: 'clamp(20px, 4vw, 32px)',
          }}>
            Error ID: {error.digest}
          </p>
        )}

        <div className="error-btns">
          <button onClick={reset} className="btn-retry">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:16, height:16, flexShrink:0 }}>
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Coba Lagi
          </button>
          <Link href="/" className="btn-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:16, height:16, flexShrink:0 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ke Beranda
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        .error-btns {
          display: flex; gap: 12px;
          justify-content: center; flex-wrap: wrap;
        }
        .btn-retry {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0D3B2E; color: white;
          font-weight: 600; font-size: 15px;
          padding: 13px 28px; border-radius: 9999px;
          border: none; cursor: pointer;
          font-family: Inter, sans-serif;
          box-shadow: 0 4px 16px rgba(13,59,46,0.25);
          transition: background 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .btn-retry:hover { background: #1a5c44; box-shadow: 0 6px 20px rgba(13,59,46,0.32); }
        .btn-home {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: #1A1917;
          font-weight: 600; font-size: 15px;
          padding: 12px 28px; border-radius: 9999px;
          text-decoration: none;
          border: 1.5px solid #E2E0D9;
          transition: border-color 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .btn-home:hover { border-color: #0D3B2E; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }

        @media (max-width: 400px) {
          .error-btns { flex-direction: column; align-items: stretch; }
          .btn-retry, .btn-home { justify-content: center; padding: 14px 20px; }
        }
      `}</style>
    </main>
  );
}