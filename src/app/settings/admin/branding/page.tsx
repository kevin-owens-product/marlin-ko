'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './branding.module.css';

/* ---------- Preset Colors ---------- */

const PRESET_COLORS = [
  { name: 'Blue', hex: '#165DFF' },
  { name: 'Cyan', hex: '#14C9C9' },
  { name: 'Green', hex: '#00B42A' },
  { name: 'Orange', hex: '#FF7D00' },
  { name: 'Red', hex: '#F53F3F' },
  { name: 'Purple', hex: '#722ED1' },
];

type PreviewTab = 'email' | 'login' | 'invoice' | 'sidebar';

/* ---------- Component ---------- */

export default function BrandingPage() {
  const t = useT();
  const router = useRouter();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Color State */
  const [primaryColor, setPrimaryColor] = useState('#165DFF');
  const [primaryHex, setPrimaryHex] = useState('165DFF');
  const [secondaryColor, setSecondaryColor] = useState('#4E5969');
  const [secondaryHex, setSecondaryHex] = useState('4E5969');
  const [accentColor, setAccentColor] = useState('#00B42A');
  const [accentHex, setAccentHex] = useState('00B42A');

  /* Other State */
  const [companyName, setCompanyName] = useState('Medius Corp');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('email');
  const [saving, setSaving] = useState(false);

  /* Email Template */
  const [emailHeaderText, setEmailHeaderText] = useState('AP Automation Platform');
  const [emailFooterText, setEmailFooterText] = useState('Powered by Medius AP Automation');

  /* ---- Color Handling ---- */
  const handleColorSelect = useCallback((hex: string, setter: (h: string) => void, hexSetter: (h: string) => void) => {
    setter(hex);
    hexSetter(hex.replace('#', ''));
  }, []);

  const handleCustomHexChange = useCallback((val: string, setter: (h: string) => void, hexSetter: (h: string) => void) => {
    const cleaned = val.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    hexSetter(cleaned);
    if (cleaned.length === 6) {
      setter(`#${cleaned}`);
    }
  }, []);

  /* ---- Logo Upload ---- */
  const processFile = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: 'error', title: t('tenantAdmin.branding.fileTooLarge'), message: t('tenantAdmin.branding.maxFileSize') });
      return;
    }
    const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      addToast({ type: 'error', title: t('tenantAdmin.branding.invalidFormat'), message: t('tenantAdmin.branding.supportedFormats') });
      return;
    }
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
    setLogoFileName(file.name);
  }, [addToast, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const handleRemoveLogo = useCallback(() => {
    setLogoUrl(null);
    setLogoFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  /* ---- Save / Reset ---- */
  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast({ type: 'success', title: t('tenantAdmin.branding.savedSuccess') });
    }, 800);
  }, [addToast, t]);

  const handleReset = useCallback(() => {
    setPrimaryColor('#165DFF');
    setPrimaryHex('165DFF');
    setSecondaryColor('#4E5969');
    setSecondaryHex('4E5969');
    setAccentColor('#00B42A');
    setAccentHex('00B42A');
    setCompanyName('Medius Corp');
    setEmailHeaderText('AP Automation Platform');
    setEmailFooterText('Powered by Medius AP Automation');
    handleRemoveLogo();
    addToast({ type: 'info', title: t('tenantAdmin.branding.resetToDefaults') });
  }, [addToast, t, handleRemoveLogo]);

  /* ---- Preview Tabs ---- */
  const previewTabs: { key: PreviewTab; labelKey: string }[] = [
    { key: 'email', labelKey: 'tenantAdmin.branding.emailPreview' },
    { key: 'login', labelKey: 'tenantAdmin.branding.loginPreview' },
    { key: 'invoice', labelKey: 'tenantAdmin.branding.invoicePreview' },
    { key: 'sidebar', labelKey: 'tenantAdmin.branding.sidebarPreview' },
  ];

  const darkenColor = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  /* ---- Color Picker Section ---- */
  const renderColorPicker = (
    label: string,
    color: string,
    hex: string,
    setColor: (c: string) => void,
    setHex: (h: string) => void
  ) => (
    <div className={styles.colorSection}>
      <div className={styles.colorSectionLabel}>{label}</div>
      <div className={styles.colorPickerRow}>
        <div className={styles.presetColors}>
          {PRESET_COLORS.map((pc) => (
            <button
              key={pc.hex}
              className={`${styles.colorSwatch} ${color === pc.hex ? styles.colorSwatchSelected : ''}`}
              style={{ backgroundColor: pc.hex }}
              onClick={() => handleColorSelect(pc.hex, setColor, setHex)}
              aria-label={`${t('tenantAdmin.branding.select')} ${pc.name}`}
              title={pc.name}
            >
              {color === pc.hex && <span className={styles.colorSwatchCheck}>&#10003;</span>}
            </button>
          ))}
        </div>
        <div className={styles.hexInputRow}>
          <span className={styles.hexPrefix}>#</span>
          <Input
            value={hex}
            onChange={(e) => handleCustomHexChange(e.target.value, setColor, setHex)}
            placeholder="165DFF"
            style={{ fontFamily: 'monospace', maxWidth: '120px' }}
          />
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              backgroundColor: color,
              border: '1px solid var(--color-border)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => router.push('/settings/admin')}>
          &#8592; {t('tenantAdmin.title')}
        </button>
        <h1 className={styles.headerTitle}>{t('tenantAdmin.branding.title')}</h1>
        <p className={styles.headerSubtitle}>{t('tenantAdmin.branding.subtitle')}</p>
      </div>

      <div className={styles.content}>
        {/* Left: Settings Panel */}
        <div className={styles.settingsPanel}>
          {/* Company Name */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('tenantAdmin.branding.companyDisplayName')}</h3>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t('tenantAdmin.branding.companyDisplayNamePlaceholder')}
            />
          </div>

          {/* Logo Upload */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('tenantAdmin.branding.logoUpload')}</h3>
            {logoUrl ? (
              <div className={styles.logoPreview}>
                <img src={logoUrl} alt="Company logo" className={styles.logoImage} />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{logoFileName}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                      {t('tenantAdmin.branding.change')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                      {t('tenantAdmin.branding.removeLogo')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label={t('tenantAdmin.branding.uploadLogo')}
              >
                <div className={styles.dropZoneIcon}>&#128247;</div>
                <div className={styles.dropZoneText}>{t('tenantAdmin.branding.logoUploadDesc')}</div>
                <div className={styles.dropZoneFormats}>{t('tenantAdmin.branding.logoFormats')}</div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleFileSelect}
              className={styles.hiddenInput}
              aria-hidden="true"
            />
          </div>

          {/* Colors */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('tenantAdmin.branding.colors')}</h3>
            {renderColorPicker(
              t('tenantAdmin.branding.primaryColor'),
              primaryColor,
              primaryHex,
              setPrimaryColor,
              setPrimaryHex
            )}
            {renderColorPicker(
              t('tenantAdmin.branding.secondaryColor'),
              secondaryColor,
              secondaryHex,
              setSecondaryColor,
              setSecondaryHex
            )}
            {renderColorPicker(
              t('tenantAdmin.branding.accentColor'),
              accentColor,
              accentHex,
              setAccentColor,
              setAccentHex
            )}
          </div>

          {/* Email Template Settings */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('tenantAdmin.branding.emailTemplate')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label={t('tenantAdmin.branding.emailHeaderText')}
                value={emailHeaderText}
                onChange={(e) => setEmailHeaderText(e.target.value)}
                placeholder="AP Automation Platform"
              />
              <Input
                label={t('tenantAdmin.branding.emailFooterText')}
                value={emailFooterText}
                onChange={(e) => setEmailFooterText(e.target.value)}
                placeholder="Powered by Medius"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className={styles.previewPanel}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('tenantAdmin.branding.livePreview')}</h3>
            <div className={styles.previewTabBar}>
              {previewTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`${styles.previewTab} ${previewTab === tab.key ? styles.previewTabActive : ''}`}
                  onClick={() => setPreviewTab(tab.key)}
                >
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>

            <div className={styles.previewContainer}>
              {/* Email Preview */}
              {previewTab === 'email' && (
                <div className={styles.emailPreview}>
                  <div className={styles.emailCard}>
                    <div className={styles.emailHeader} style={{ backgroundColor: primaryColor }}>
                      <div className={styles.emailLogoPlaceholder}>
                        {logoUrl ? (
                          <img src={logoUrl} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        ) : (
                          companyName.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className={styles.emailCompanyName}>{companyName}</span>
                        <div style={{ fontSize: '0.625rem', opacity: 0.85, color: 'white' }}>{emailHeaderText}</div>
                      </div>
                    </div>
                    <div className={styles.emailBody}>
                      <div className={styles.emailSubject}>{t('tenantAdmin.branding.previewSubject')}</div>
                      <div className={styles.emailText}>
                        {t('tenantAdmin.branding.previewBody')}
                      </div>
                      <span
                        className={styles.emailButton}
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t('tenantAdmin.branding.previewButtonText')}
                      </span>
                    </div>
                    <div className={styles.emailFooter}>
                      {emailFooterText}
                    </div>
                  </div>
                </div>
              )}

              {/* Login Preview */}
              {previewTab === 'login' && (
                <div className={styles.loginPreview}>
                  <div className={styles.loginSidebar} style={{ backgroundColor: primaryColor }}>
                    <div className={styles.loginSidebarLogo}>
                      {logoUrl ? (
                        <img src={logoUrl} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                      ) : (
                        companyName.charAt(0)
                      )}
                    </div>
                    <div className={styles.loginSidebarName}>{companyName}</div>
                    <div className={styles.loginSidebarTag}>{emailHeaderText}</div>
                  </div>
                  <div className={styles.loginForm}>
                    <div className={styles.loginFormTitle}>{t('tenantAdmin.branding.welcomeBack')}</div>
                    <div className={styles.loginFormInput} />
                    <div className={styles.loginFormInput} />
                    <div
                      className={styles.loginFormBtn}
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t('tenantAdmin.branding.signIn')}
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Preview */}
              {previewTab === 'invoice' && (
                <div className={styles.invoicePreview}>
                  <div className={styles.invoiceHeader} style={{ borderBottomColor: primaryColor }}>
                    <div className={styles.invoiceLogoArea}>
                      <div className={styles.invoiceLogoPlaceholder} style={{ backgroundColor: primaryColor }}>
                        {logoUrl ? (
                          <img src={logoUrl} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        ) : (
                          companyName.charAt(0)
                        )}
                      </div>
                      <span className={styles.invoiceCompanyName}>{companyName}</span>
                    </div>
                    <span className={styles.invoiceLabel} style={{ color: primaryColor }}>INVOICE</span>
                  </div>
                  <div className={styles.invoiceMeta}>
                    <div>Invoice #: INV-2024-0847</div>
                    <div>Date: Feb 21, 2026</div>
                    <div>Due Date: Mar 23, 2026</div>
                    <div>PO #: PO-2024-1234</div>
                  </div>
                  <div className={styles.invoiceLine}>
                    <span>Consulting Services (40 hrs)</span>
                    <span>$12,000.00</span>
                  </div>
                  <div className={styles.invoiceLine}>
                    <span>Software License (Annual)</span>
                    <span>$5,400.00</span>
                  </div>
                  <div className={styles.invoiceLine}>
                    <span>Travel Expenses</span>
                    <span>$2,340.00</span>
                  </div>
                  <div className={styles.invoiceTotal} style={{ color: primaryColor }}>
                    <span>Total</span>
                    <span>$19,740.00</span>
                  </div>
                </div>
              )}

              {/* Sidebar Preview */}
              {previewTab === 'sidebar' && (
                <div className={styles.sidebarPreview}>
                  <div className={styles.sidebarMock} style={{ backgroundColor: darkenColor(primaryColor, 40) }}>
                    <div className={styles.sidebarLogo}>
                      <div className={styles.sidebarLogoIcon}>
                        {logoUrl ? (
                          <img src={logoUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                        ) : (
                          companyName.charAt(0)
                        )}
                      </div>
                      <span className={styles.sidebarLogoText}>{companyName}</span>
                    </div>
                    <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>Dashboard</div>
                    <div className={styles.sidebarItem}>Invoices</div>
                    <div className={styles.sidebarItem}>Approvals</div>
                    <div className={styles.sidebarItem}>Payments</div>
                    <div className={styles.sidebarItem}>Suppliers</div>
                    <div className={styles.sidebarItem}>Analytics</div>
                    <div className={styles.sidebarItem}>Settings</div>
                  </div>
                  <div className={styles.sidebarContent}>
                    <div className={styles.sidebarContentPlaceholder} style={{ width: '60%' }} />
                    <div className={styles.sidebarContentPlaceholder} style={{ width: '100%' }} />
                    <div className={styles.sidebarContentPlaceholder} style={{ width: '80%' }} />
                    <div className={styles.sidebarContentPlaceholder} style={{ width: '45%' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleReset}>
            {t('tenantAdmin.branding.resetDefaults')}
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {t('tenantAdmin.branding.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
}
