'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import styles from './notifications.module.css';

/* ---------- Types ---------- */

type DigestMode = 'realtime' | 'hourly' | 'daily';

interface NotificationPref {
  key: string;
  labelKey: string;
  email: boolean;
  inApp: boolean;
  slack: boolean;
}

/* ---------- Default Data ---------- */

const DEFAULT_PREFS: NotificationPref[] = [
  { key: 'invoiceApproval', labelKey: 'tenantAdmin.notificationsPage.invoiceApproval', email: true, inApp: true, slack: false },
  { key: 'paymentProcessed', labelKey: 'tenantAdmin.notificationsPage.paymentProcessed', email: true, inApp: true, slack: false },
  { key: 'riskAlert', labelKey: 'tenantAdmin.notificationsPage.riskAlert', email: true, inApp: true, slack: false },
  { key: 'complianceWarning', labelKey: 'tenantAdmin.notificationsPage.complianceWarning', email: true, inApp: true, slack: false },
  { key: 'contractExpiring', labelKey: 'tenantAdmin.notificationsPage.contractExpiring', email: false, inApp: true, slack: false },
  { key: 'weeklySummary', labelKey: 'tenantAdmin.notificationsPage.weeklySummary', email: true, inApp: false, slack: false },
  { key: 'systemMaintenance', labelKey: 'tenantAdmin.notificationsPage.systemMaintenance', email: true, inApp: true, slack: false },
  { key: 'newSupplier', labelKey: 'tenantAdmin.notificationsPage.newSupplier', email: false, inApp: true, slack: false },
];

/* ---------- Component ---------- */

export default function NotificationsPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [prefs, setPrefs] = useState<NotificationPref[]>(DEFAULT_PREFS);
  const [digestMode, setDigestMode] = useState<DigestMode>('realtime');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [saving, setSaving] = useState(false);

  /* ---- Toggle Handlers ---- */
  const togglePref = useCallback((index: number, channel: 'email' | 'inApp' | 'slack') => {
    setPrefs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [channel]: !p[channel] } : p))
    );
  }, []);

  /* ---- Save ---- */
  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast({ type: 'success', title: t('tenantAdmin.notificationsPage.preferencesSaved') });
    }, 600);
  }, [addToast, t]);

  const digestOptions: { key: DigestMode; labelKey: string }[] = [
    { key: 'realtime', labelKey: 'tenantAdmin.notificationsPage.realTime' },
    { key: 'hourly', labelKey: 'tenantAdmin.notificationsPage.hourlyDigest' },
    { key: 'daily', labelKey: 'tenantAdmin.notificationsPage.dailyDigest' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => router.push('/settings/admin')}>
          &#8592; {t('tenantAdmin.title')}
        </button>
        <h1 className={styles.headerTitle}>{t('tenantAdmin.notificationsPage.title')}</h1>
        <p className={styles.headerSubtitle}>{t('tenantAdmin.notificationsPage.subtitle')}</p>
      </div>

      <div className={styles.content}>
        {/* Notification Channels */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t('tenantAdmin.notificationsPage.channels')}</h2>
          <div className={styles.channels}>
            <div className={styles.channelItem}>
              <div className={styles.channelIcon}>&#9993;</div>
              <div className={styles.channelInfo}>
                <div className={styles.channelName}>{t('tenantAdmin.notificationsPage.email')}</div>
                <div className={styles.channelDesc}>Deliver notifications to team email addresses</div>
              </div>
            </div>
            <div className={styles.channelItem}>
              <div className={styles.channelIcon}>&#128276;</div>
              <div className={styles.channelInfo}>
                <div className={styles.channelName}>{t('tenantAdmin.notificationsPage.inApp')}</div>
                <div className={styles.channelDesc}>Show notifications in the platform</div>
              </div>
            </div>
            <div className={styles.channelItem}>
              <div className={styles.channelIcon}>&#128172;</div>
              <div className={styles.channelInfo}>
                <div className={styles.channelName}>
                  {t('tenantAdmin.notificationsPage.slack')}
                  <span className={styles.comingSoonBadge}>{t('tenantAdmin.notificationsPage.comingSoon')}</span>
                </div>
                <div className={styles.channelDesc}>Send notifications to Slack channels</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t('tenantAdmin.notificationsPage.category')}</h2>
          <table className={styles.notifTable}>
            <thead>
              <tr>
                <th>{t('tenantAdmin.notificationsPage.category')}</th>
                <th>{t('tenantAdmin.notificationsPage.email')}</th>
                <th>{t('tenantAdmin.notificationsPage.inApp')}</th>
                <th>
                  <span className={styles.slackDisabled}>{t('tenantAdmin.notificationsPage.slack')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {prefs.map((pref, index) => (
                <tr key={pref.key}>
                  <td>{t(pref.labelKey)}</td>
                  <td>
                    <button
                      className={`${styles.toggleSwitch} ${pref.email ? styles.toggleSwitchActive : ''}`}
                      onClick={() => togglePref(index, 'email')}
                      aria-label={`Toggle email for ${t(pref.labelKey)}`}
                    >
                      <div className={`${styles.toggleDot} ${pref.email ? styles.toggleDotActive : ''}`} />
                    </button>
                  </td>
                  <td>
                    <button
                      className={`${styles.toggleSwitch} ${pref.inApp ? styles.toggleSwitchActive : ''}`}
                      onClick={() => togglePref(index, 'inApp')}
                      aria-label={`Toggle in-app for ${t(pref.labelKey)}`}
                    >
                      <div className={`${styles.toggleDot} ${pref.inApp ? styles.toggleDotActive : ''}`} />
                    </button>
                  </td>
                  <td>
                    <span className={styles.slackDisabled}>
                      <button
                        className={styles.toggleSwitch}
                        disabled
                        aria-label={`Slack notifications coming soon`}
                      >
                        <div className={styles.toggleDot} />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Digest Settings */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t('tenantAdmin.notificationsPage.digestSettings')}</h2>
          <div className={styles.digestOptions}>
            {digestOptions.map((option) => (
              <button
                key={option.key}
                className={`${styles.digestOption} ${digestMode === option.key ? styles.digestOptionActive : ''}`}
                onClick={() => setDigestMode(option.key)}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className={styles.card}>
          <div className={styles.quietHoursToggle}>
            <div className={styles.quietHoursInfo}>
              <div className={styles.quietHoursTitle}>{t('tenantAdmin.notificationsPage.quietHours')}</div>
              <div className={styles.quietHoursDesc}>{t('tenantAdmin.notificationsPage.quietHoursDesc')}</div>
            </div>
            <button
              className={`${styles.toggleSwitch} ${quietHoursEnabled ? styles.toggleSwitchActive : ''}`}
              onClick={() => setQuietHoursEnabled((prev) => !prev)}
              aria-label="Toggle quiet hours"
            >
              <div className={`${styles.toggleDot} ${quietHoursEnabled ? styles.toggleDotActive : ''}`} />
            </button>
          </div>

          {quietHoursEnabled && (
            <div className={styles.quietHoursRow}>
              <div className={styles.timeInputs}>
                <div>
                  <div className={styles.timeLabel}>{t('tenantAdmin.notificationsPage.quietStart')}</div>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                  />
                </div>
                <span className={styles.timeSeparator}>to</span>
                <div>
                  <div className={styles.timeLabel}>{t('tenantAdmin.notificationsPage.quietEnd')}</div>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Footer */}
        <div className={styles.footer}>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {t('tenantAdmin.notificationsPage.savePreferences')}
          </Button>
        </div>
      </div>
    </div>
  );
}
