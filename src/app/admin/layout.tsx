'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import styles from './layout.module.css';

/* ---------- SVG Icons ---------- */
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const TenantsIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-4h6v4" />
    <path d="M9 10h1" />
    <path d="M14 10h1" />
    <path d="M9 14h1" />
    <path d="M14 14h1" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MonitoringIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const FlagIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const AuditIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const BillingIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
    <line x1="14" y1="15" x2="18" y2="15" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

interface AdminNavItem {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
}

const ADMIN_NAV: AdminNavItem[] = [
  { labelKey: 'admin.nav.dashboard', href: '/admin', icon: <DashboardIcon /> },
  { labelKey: 'admin.nav.tenants', href: '/admin/tenants', icon: <TenantsIcon /> },
  { labelKey: 'admin.nav.users', href: '/admin/users', icon: <UsersIcon /> },
  { labelKey: 'admin.nav.monitoring', href: '/admin/monitoring', icon: <MonitoringIcon /> },
  { labelKey: 'admin.nav.featureFlags', href: '/admin/feature-flags', icon: <FlagIcon /> },
  { labelKey: 'admin.nav.audit', href: '/admin/audit', icon: <AuditIcon /> },
  { labelKey: 'admin.nav.billing', href: '/admin/billing', icon: <BillingIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/admin') return pathname === '/admin';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SA';

  // Loading state
  if (isLoading) {
    return null;
  }

  // Access denied for non-admins
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.accessDeniedIcon}>{'\u26D4'}</div>
        <h1 className={styles.accessDeniedTitle}>{t('admin.accessDenied.title')}</h1>
        <p className={styles.accessDeniedText}>{t('admin.accessDenied.message')}</p>
        <Link href="/" className={styles.accessDeniedBtn}>
          {t('admin.accessDenied.backToApp')}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.adminShell}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
          mobileOpen ? styles.sidebarOpen : ''
        }`}
      >
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <span>M</span>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Medius</span>
            <span className={styles.logoSubtitle}>{t('admin.nav.superAdmin')}</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{t(item.labelKey)}</span>
            </Link>
          ))}

          <div className={styles.navDivider} />

          <Link href="/" className={styles.backLink} title={collapsed ? t('admin.nav.backToApp') : undefined}>
            <span className={styles.navIcon}><BackIcon /></span>
            <span className={styles.backLabel}>{t('admin.nav.backToApp')}</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>{userInitials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || 'Admin'}</div>
              <div className={styles.userRole}>{t('admin.nav.superAdmin')}</div>
            </div>
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? t('admin.nav.expand') : t('admin.nav.collapse')}
            type="button"
          >
            {collapsed ? '\u276F' : '\u276E'}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={`${styles.mainArea} ${collapsed ? styles.mainAreaCollapsed : ''}`}>
        {/* Top bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              className={styles.hamburgerBtn}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
              type="button"
            >
              {'\u2630'}
            </button>
            <div className={styles.adminBadge}>
              <span className={styles.adminBadgeDot} />
              {t('admin.nav.superAdmin')}
            </div>
          </div>
          <div className={styles.topBarRight}>
            <Link href="/" className={styles.logoutBtn}>
              <BackIcon /> {t('admin.nav.backToApp')}
            </Link>
            <div className={styles.topBarUser}>
              <span className={styles.topBarUserName}>{user?.name || 'Admin'}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} type="button">
              {'\u23FB'} {t('admin.nav.logout')}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
