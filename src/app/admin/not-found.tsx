'use client';

import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '400px',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: 'var(--color-accent)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Admin Page Not Found
        </h1>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: '20px',
          }}
        >
          The admin page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              borderRadius: '4px',
              textDecoration: 'none',
              height: '36px',
            }}
          >
            Admin Dashboard
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              textDecoration: 'none',
              height: '36px',
            }}
          >
            Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
