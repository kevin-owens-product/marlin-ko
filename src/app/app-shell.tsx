"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { ToastProvider } from '@/components/ui/Toast';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/CommandPalette';
import { CaseStudyGuide } from '@/components/CaseStudyGuide';
import { CopilotProvider } from '@/lib/copilot/copilot-context';
import { CopilotDrawer } from '@/components/CopilotDrawer/CopilotDrawer';
import styles from './layout.module.css';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!user && !isLoginPage && !isLoading) {
      router.replace('/login');
    }
  }, [user, isLoginPage, isLoading, router]);

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerIcon}>
            <span>M</span>
          </div>
          <span className={styles.spinnerText}>Loading...</span>
        </div>
      </div>
    );
  }

  // Login page: render without shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Not authenticated: show loading spinner while redirecting to /login
  if (!user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerIcon}>
            <span>M</span>
          </div>
          <span className={styles.spinnerText}>Loading...</span>
        </div>
      </div>
    );
  }

  // Authenticated layout: sidebar + header + content
  return (
    <div className={styles.appShell}>
      <Sidebar />
      <div className={styles.mainArea}>
        <Header onOpenCommandPalette={handleOpenCommandPalette} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <CopilotDrawer />
      <CaseStudyGuide />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ToastProvider>
          <CopilotProvider>
            <AppContent>{children}</AppContent>
          </CopilotProvider>
        </ToastProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
