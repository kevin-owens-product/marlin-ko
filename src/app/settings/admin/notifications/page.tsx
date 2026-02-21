'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import styles from './notifications.module.css';

/* ---------- Types ---------- */

type DigestMode = 'realtime' | 'hourly' | 'daily';
type EmailFormat = 'html' | 'plain';

interface NotificationPref {
  key: string;
  labelKey: string;
  email: boolean;
  inApp: boolean;
  slack: boolean;
  sms: boolean;
}

interface UserOverride {
  id: string;
  name: string;
  email: string;
  overrides: string[];
}

/* ---------- Default Data ---------- */

const DEFAULT_PREFS: NotificationPref[] = [
  { key: 'invoiceApproval', labelKey: 'tenantAdmin.notificationsPage.invoiceApproval', email: true, inApp: true, slack: false, sms: false },
  { key: 'paymentProcessed', labelKey: 'tenantAdmin.notificationsPage.paymentProcessed', email: true, inApp: true, slack: false, sms: false },
  { key: 'riskAlert', labelKey: 'tenantAdmin.notificationsPage.riskAlert', email: true, inApp: true, slack: false, sms: true },
  { key: 'complianceWarning', labelKey: 'tenantAdmin.notificationsPage.complianceWarning', email: true, inApp: true, slack: false, sms: true },
  { key: 'contractExpiring', labelKey: 'tenantAdmin.notificationsPage.contractExpiring', email: false, inApp: true, slack: false, sms: false },
  { key: 'weeklySummary', labelKey: 'tenantAdmin.notificationsPage.weeklySummary', email: true, inApp: false, slack: false, sms: false },
  { key: 'systemMaintenance', labelKey: 'tenantAdmin.notificationsPage.systemMaintenance', email: true, inApp: true, slack: false, sms: false },
  { key: 'newSupplier', labelKey: 'tenantAdmin.notificationsPage.newSupplier', email: false, inApp: true, slack: false, sms: false },
  { key: 'expenseSubmitted', labelKey: 'tenantAdmin.notificationsPage.expenseSubmitted', email: true, inApp: true, slack: false, sms: false },
  { key: 'budgetExceeded', labelKey: 'tenantAdmin.notificationsPage.budgetExceeded', email: true, inApp: true, slack: false, sms: true },
];

const MOCK_USER_OVERRIDES: UserOverride[] = [
  { id: 'u1', name: 'Sarah Johnson', email: 'sarah.johnson@medius.com', overrides: ['Disabled email for Weekly Summary', 'Enabled SMS for Risk Alerts'] },
  { id: 'u2', name: 'Marcus Chen', email: 'marcus.chen@medius.com', overrides: ['Disabled in-app for System Maintenance'] },
];

/* ---------- Component ---------- */

export default function NotificationsPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();

  const [prefs, setPrefs] = useState<NotificationPref[]>(DEFAULT_PREFS);
  const [digestMode, setDigestMode] = useState<DigestMode>('realtime');
  const [emailFormat, setEmailFormat] = useState<EmailFormat>('html');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [saving, setSaving] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  /* ---- Toggle Handlers ---- */
  const togglePref = useCallback((index: number, channel: 'email' | 'inApp' | 'slack' | 'sms') => {
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

  const handleTestNotification = useCallback(() => {
    addToast({ type: 'info', title: t('tenantAdmin.notificationsPage.testSent'), message: t('tenantAdmin.notificationsPage.testSentDesc') });
  }, [addToast, t]);

  const digestOptions: { key: DigestMode; labelKey: string; descKey: string }[] = [
    { key: 'realtime', labelKey: 'tenantAdmin.notificationsPage.realTime', descKey: 'tenantAdmin.notificationsPage.realTimeDesc' },
    { key: 'hourly', labelKey: 'tenantAdmin.notificationsPage.hourlyDigest', descKey: 'tenantAdmin.notificationsPage.hourlyDesc' },
    { key: 'daily', labelKey: 'tenantAdmin.notificationsPage.dailyDigest', descKey: 'tenantAdmin.notificationsPage.dailyDesc' },
  ];

  const emailFormatOptions: { key: EmailFormat; labelKey: string }[] = [
    { key: 'html', labelKey: 'tenantAdmin.notificationsPage.htmlFormat' },
    { key: 'plain', labelKey: 'tenantAdmin.notificationsPage.plainFormat' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backLink} onClick={() => router.push('/settings/admin')}>
            &#8592; {t('tenantAdmin.title')}
          </button>
          <h1 className={styles.headerTitle}>{t('tenantAdmin.notificationsPage.title')}</h1>
          <p className={styles.headerSubtitle}>{t('tenantAdmin.notificationsPage.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="sm" onClick={handleTestNotification}>
            {t('tenantAdmin.notificationsPage.testNotification')}
          </Button>
        </div>
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
                <div className={styles.channelDesc}>{t('tenantAdmin.notificationsPage.emailDesc')}</div>
              </div>
            </div>
            <div className={styles.channelItem}>
              <div className={styles.channelIcon}>&#128276;</div>
              <div className={styles.channelInfo}>
                <div className={styles.channelName}>{t('tenantAdmin.notificationsPage.inApp')}</div>
                <div className={styles.channelDesc}>{t('tenantAdmin.notificationsPage.inAppDesc')}</div>
              </div>
            </div>
            <div className={styles.channelItem}>
              <div className={styles.channelIcon}>&#128172;</div>
              <div className={styles.channelInfo}>
                <div className={styles.channelName}>
                  {t('tenantAdmin.notificationsPage.slack')}
                  <span className={styles.comingSoonBadge}>{t('tenantAdmin.notificationsPage.comingSoon')}</span>
                </div>
                <div className={styles.channelDesc}>{t('tenantAdmin.notificationsPage.slackDesc')}</div>
              </div>
            </div>
            <div className={styles.channelItem}>
              <div className={styles.channelIcon}>&#128241;</div>
              <div className={styles.channelInfo}>
                <div className={styles.channelName}>
                  {t('tenantAdmin.notificationsPage.sms')}
                  <span className={styles.comingSoonBadge}>{t('tenantAdmin.notificationsPage.comingSoon')}</span>
                </div>
                <div className={styles.channelDesc}>{t('tenantAdmin.notificationsPage.smsDesc')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Matrix Table */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t('tenantAdmin.notificationsPage.notificationMatrix')}</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.notifTable}>
              <thead>
                <tr>
                  <th>{t('tenantAdmin.notificationsPage.eventType')}</th>
                  <th>{t('tenantAdmin.notificationsPage.email')}</th>
                  <th>{t('tenantAdmin.notificationsPage.inApp')}</th>
                  <th>
                    <span className={styles.slackDisabled}>{t('tenantAdmin.notificationsPage.slack')}</span>
                  </th>
                  <th>
                    <span className={styles.smsDisabled}>{t('tenantAdmin.notificationsPage.sms')}</span>
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
                        <button className={styles.toggleSwitch} disabled aria-label="Slack coming soon">
                          <div className={styles.toggleDot} />
                        </button>
                      </span>
                    </td>
                    <td>
                      <span className={styles.smsDisabled}>
                        <button className={styles.toggleSwitch} disabled aria-label="SMS coming soon">
                          <div className={styles.toggleDot} />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Settings Row */}
        <div className={styles.settingsGrid}>
          {/* Digest Mode */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('tenantAdmin.notificationsPage.digestSettings')}</h2>
            <div className={styles.digestOptions}>
              {digestOptions.map((option) => (
                <button
                  key={option.key}
                  className={`${styles.digestOption} ${digestMode === option.key ? styles.digestOptionActive : ''}`}
                  onClick={() => setDigestMode(option.key)}
                >
                  <span className={styles.digestOptionLabel}>{t(option.labelKey)}</span>
                  <span className={styles.digestOptionDesc}>{t(option.descKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email Format */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('tenantAdmin.notificationsPage.emailFormat')}</h2>
            <div className={styles.formatOptions}>
              {emailFormatOptions.map((option) => (
                <button
                  key={option.key}
                  className={`${styles.formatOption} ${emailFormat === option.key ? styles.formatOptionActive : ''}`}
                  onClick={() => setEmailFormat(option.key)}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
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
                <span className={styles.timeSeparator}>{t('tenantAdmin.notificationsPage.to')}</span>
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

        {/* Per-User Overrides */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t('tenantAdmin.notificationsPage.perUserOverrides')}</h2>
          <div className={styles.overrideList}>
            {MOCK_USER_OVERRIDES.map((user) => (
              <div key={user.id} className={styles.overrideItem}>
                <div className={styles.overrideUser}>
                  <div className={styles.overrideAvatar}>{user.name.charAt(0)}</div>
                  <div>
                    <div className={styles.overrideName}>{user.name}</div>
                    <div className={styles.overrideEmail}>{user.email}</div>
                  </div>
                </div>
                <div className={styles.overrideDetails}>
                  {user.overrides.map((override, idx) => (
                    <div key={idx} className={styles.overrideBadge}>{override}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Template Preview */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>{t('tenantAdmin.notificationsPage.templatePreview')}</h2>
            <button
              className={styles.togglePreviewBtn}
              onClick={() => setShowTemplatePreview((prev) => !prev)}
            >
              {showTemplatePreview ? t('tenantAdmin.notificationsPage.hidePreview') : t('tenantAdmin.notificationsPage.showPreview')}
            </button>
          </div>
          {showTemplatePreview && (
            <div className={styles.templatePreview}>
              <div className={styles.templateCard}>
                <div className={styles.templateHeader}>
                  <span className={styles.templateLogo}>M</span>
                  <span className={styles.templateCompanyName}>Medius Corp</span>
                </div>
                <div className={styles.templateBody}>
                  <div className={styles.templateSubject}>{t('tenantAdmin.notificationsPage.previewSubject')}</div>
                  <div className={styles.templateText}>
                    {t('tenantAdmin.notificationsPage.previewBody')}
                  </div>
                  <div className={styles.templateButton}>
                    {t('tenantAdmin.notificationsPage.previewAction')}
                  </div>
                </div>
                <div className={styles.templateFooter}>
                  Medius Corp &middot; Powered by Medius AP Automation
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
