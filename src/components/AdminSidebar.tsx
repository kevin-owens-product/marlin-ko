'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface AdminSidebarProps {
  items: AdminNavItem[];
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  userInitials?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function AdminSidebar({
  items,
  title = 'Medius',
  subtitle = 'Super Admin',
  backHref = '/',
  backLabel = 'Back to App',
  userInitials = 'SA',
  userName = 'Admin',
  userRole = 'Super Admin',
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      const basePath = items[0]?.href;
      if (href === basePath) return pathname === basePath;
      return pathname.startsWith(href);
    },
    [pathname, items]
  );

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileOpen}
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.sidebarCollapsed : '',
          mobileOpen ? styles.sidebarOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Logo / Brand */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon} aria-hidden="true">
            <span>M</span>
          </div>
          {!collapsed && (
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>{title}</span>
              <span className={styles.logoSubtitle}>{subtitle}</span>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className={styles.nav}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                styles.navLink,
                isActive(item.href) ? styles.navLinkActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              title={collapsed ? item.label : undefined}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.navBadge}>{item.badge}</span>
                  )}
                </>
              )}
            </Link>
          ))}

          <div className={styles.navDivider} />

          <Link
            href={backHref}
            className={styles.backLink}
            title={collapsed ? backLabel : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            {!collapsed && (
              <span className={styles.navLabel}>{backLabel}</span>
            )}
          </Link>
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <div
            className={styles.userSection}
            onClick={onLogout}
            role={onLogout ? 'button' : undefined}
            tabIndex={onLogout ? 0 : undefined}
            onKeyDown={
              onLogout
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLogout();
                    }
                  }
                : undefined
            }
            aria-label={onLogout ? `Sign out ${userName}` : undefined}
          >
            <div className={styles.userAvatar} aria-hidden="true">
              {userInitials}
            </div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <div className={styles.userName}>{userName}</div>
                <div className={styles.userRole}>{userRole}</div>
              </div>
            )}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {collapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
