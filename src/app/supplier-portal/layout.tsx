'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import styles from './portal-layout.module.css';

/* ── Navigation items ── */
interface NavItem {
  key: string;
  labelKey: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', labelKey: 'supplierPortal.nav.dashboard', icon: '\u2302', href: '/supplier-portal' },
  { key: 'invoices', labelKey: 'supplierPortal.nav.invoices', icon: '\u2709', href: '/supplier-portal/invoices' },
  { key: 'payments', labelKey: 'supplierPortal.nav.payments', icon: '\u25B6', href: '/supplier-portal/payments' },
  { key: 'disputes', labelKey: 'supplierPortal.nav.disputes', icon: '\u26A0', href: '/supplier-portal/disputes' },
  { key: 'documents', labelKey: 'supplierPortal.nav.documents', icon: '\u2630', href: '/supplier-portal/documents' },
  { key: 'profile', labelKey: 'supplierPortal.nav.profile', icon: '\u263A', href: '/supplier-portal/profile' },
];

/* ── Layout Component ── */
export default function SupplierPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Determine if we're on the login page — if so, skip the layout shell */
  const isLoginPage = pathname === '/supplier-portal/login';

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /* Close mobile menu on ESC */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKey);
        document.body.style.overflow = '';
      };
    }
  }, [mobileMenuOpen]);

  const handleNavClick = useCallback(
    (href: string) => {
      router.push(href);
      setMobileMenuOpen(false);
    },
    [router]
  );

  const isActive = (href: string) => {
    if (href === '/supplier-portal') return pathname === '/supplier-portal';
    return pathname.startsWith(href);
  };

  /* Login page gets no shell */
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.portalRoot}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoText}>M</span>
          </div>
          <span className={styles.headerTitle}>
            {t('supplierPortal.header.portalTitle')}
          </span>
          <div className={styles.headerDivider} />
          <span className={styles.companyName}>Acme Corp</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.logoutButton}
            onClick={() => router.push('/supplier-portal/login')}
          >
            {t('supplierPortal.header.logout')}
          </button>
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t('supplierPortal.header.menuToggle')}
          >
            &#9776;
          </button>
        </div>
      </header>

      {/* ── Desktop Navigation ── */}
      <nav className={styles.nav} aria-label="Supplier portal navigation">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
            onClick={() => handleNavClick(item.href)}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">
              {item.icon}
            </span>
            {t(item.labelKey)}
          </button>
        ))}
      </nav>

      {/* ── Mobile Navigation Overlay ── */}
      <div
        className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.mobileOverlayVisible : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Navigation Drawer ── */}
      <div
        className={`${styles.mobileNav} ${mobileMenuOpen ? styles.mobileNavOpen : ''}`}
        role="dialog"
        aria-modal={mobileMenuOpen}
        aria-label="Navigation menu"
      >
        <div className={styles.mobileNavHeader}>
          <span className={styles.mobileNavTitle}>
            {t('supplierPortal.header.portalTitle')}
          </span>
          <button
            className={styles.mobileNavClose}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            &#10005;
          </button>
        </div>
        <div className={styles.mobileNavLinks}>
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.mobileNavLinkActive : ''}`}
              onClick={() => handleNavClick(item.href)}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span className={styles.mobileNavIcon} aria-hidden="true">
                {item.icon}
              </span>
              {t(item.labelKey)}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button
          className={styles.logoutButton}
          onClick={() => router.push('/supplier-portal/login')}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {t('supplierPortal.header.logout')}
        </button>
      </div>

      {/* ── Main Content ── */}
      <main className={styles.main}>{children}</main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <button className={styles.footerLink}>
            {t('supplierPortal.footer.help')}
          </button>
          <button className={styles.footerLink}>
            {t('supplierPortal.footer.terms')}
          </button>
          <button className={styles.footerLink}>
            {t('supplierPortal.footer.privacy')}
          </button>
          <button className={styles.footerLink}>
            {t('supplierPortal.footer.contactSupport')}
          </button>
        </div>
        <span className={styles.footerCopyright}>
          &copy; 2026 {t('supplierPortal.footer.copyright')}
        </span>
      </footer>
    </div>
  );
}
