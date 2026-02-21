/**
 * Medius AP Automation Platform - Database Seed Script
 *
 * Creates comprehensive demo data for development and testing.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 * Or via:   npm run db:seed
 *
 * This script is idempotent - it cleans existing data before inserting.
 *
 * Data created:
 *   - 2 tenants: Acme Corp (ENTERPRISE), StartupCo (STARTER)
 *   - 4 users per tenant (admin, approver, clerk, viewer)
 *   - 5 trading partners per tenant
 *   - 20 invoices per tenant with various statuses
 *   - 5 purchase orders per tenant
 *   - 10 expenses per tenant
 *   - 3 contracts per tenant
 *   - 2 payment batches per tenant with transactions
 *   - 5 approval workflows per tenant
 *   - Risk alerts, audit logs, notifications
 *   - ERP connections and reports
 *   - Feature flags (default set)
 *   - Tenant branding configurations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Bcrypt-style placeholder hash for "password123".
 * In production, you would use bcrypt.hash() from the bcryptjs package.
 * This is a pre-computed bcrypt hash of "password123" with 10 rounds.
 */
const DEMO_PASSWORD_HASH = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36eQe2s0JiucEbU7K.VN7mS';

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

// ─── Main seed function ───────────────────────────────────────

async function main() {
  console.log('=== Medius AP Platform - Database Seeding ===');
  console.log('');

  // ─── 0. Clean existing data (idempotent) ────────────────────
  console.log('[1/18] Cleaning existing data...');
  // Delete in reverse dependency order to avoid FK constraint violations
  await prisma.webhookDelivery.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.session.deleteMany();
  await prisma.tenantBranding.deleteMany();
  await prisma.supplierUser.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.monetizationLog.deleteMany();
  await prisma.conversationMessage.deleteMany();
  await prisma.supplierConversation.deleteMany();
  await prisma.cashFlowForecast.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.eRPConnection.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.paymentBatch.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.approvalWorkflow.deleteMany();
  await prisma.pOMatchResult.deleteMany();
  await prisma.complianceLog.deleteMany();
  await prisma.agentDecision.deleteMany();
  await prisma.riskAlert.deleteMany();
  await prisma.report.deleteMany();
  await prisma.expensePolicy.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.virtualCard.deleteMany();
  await prisma.sCFProgram.deleteMany();
  await prisma.tradingPartner.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  console.log('    Done.');

  // ─── 1. Tenants ─────────────────────────────────────────────
  console.log('[2/18] Creating tenants...');

  const tenantAcme = await prisma.tenant.create({
    data: {
      id: 'tenant_acme',
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'ENTERPRISE',
      isActive: true,
      logoUrl: '/logos/acme-corp.svg',
      brandColor: '#165DFF',
      domain: 'acme-corp.medius.app',
      branding: JSON.stringify({
        logoUrl: '/logos/acme-corp.svg',
        primaryColor: '#165DFF',
        companyName: 'Acme Corporation',
      }),
      settings: JSON.stringify({
        locale: 'en-US',
        timezone: 'America/New_York',
        defaultCurrency: 'USD',
        approvalThreshold: 10000,
        touchlessEnabled: true,
        multiCurrency: true,
        twoFactorRequired: false,
      }),
    },
  });

  const tenantStartup = await prisma.tenant.create({
    data: {
      id: 'tenant_startup',
      name: 'StartupCo',
      slug: 'startupco',
      plan: 'STARTER',
      isActive: true,
      logoUrl: '/logos/startupco.svg',
      brandColor: '#FF7D00',
      domain: 'startupco.medius.app',
      branding: JSON.stringify({
        logoUrl: '/logos/startupco.svg',
        primaryColor: '#FF7D00',
        companyName: 'StartupCo Inc.',
      }),
      settings: JSON.stringify({
        locale: 'en-US',
        timezone: 'America/Los_Angeles',
        defaultCurrency: 'USD',
        approvalThreshold: 1000,
        touchlessEnabled: false,
      }),
    },
  });

  console.log(`    Created: ${tenantAcme.name} (${tenantAcme.plan}), ${tenantStartup.name} (${tenantStartup.plan})`);

  // ─── 2. Users (4 per tenant = 8 total) ──────────────────────
  console.log('[3/18] Creating users...');

  // Acme Corp users
  const acmeAdmin = await prisma.user.create({
    data: {
      id: 'user_acme_admin',
      email: 'sarah.chen@acme-corp.com',
      name: 'Sarah Chen',
      role: 'ADMIN',
      tenantId: tenantAcme.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: daysAgo(0),
      preferences: JSON.stringify({ theme: 'light', notifications: true, dashboardLayout: 'compact' }),
    },
  });

  const acmeApprover = await prisma.user.create({
    data: {
      id: 'user_acme_approver',
      email: 'james.rodriguez@acme-corp.com',
      name: 'James Rodriguez',
      role: 'APPROVER',
      tenantId: tenantAcme.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      lastLoginAt: daysAgo(1),
      preferences: JSON.stringify({ theme: 'dark', notifications: true }),
    },
  });

  const acmeClerk = await prisma.user.create({
    data: {
      id: 'user_acme_clerk',
      email: 'emily.watson@acme-corp.com',
      name: 'Emily Watson',
      role: 'AP_CLERK',
      tenantId: tenantAcme.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      lastLoginAt: daysAgo(0),
      preferences: JSON.stringify({ theme: 'light', notifications: true }),
    },
  });

  const acmeViewer = await prisma.user.create({
    data: {
      id: 'user_acme_viewer',
      email: 'michael.park@acme-corp.com',
      name: 'Michael Park',
      role: 'VIEWER',
      tenantId: tenantAcme.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      lastLoginAt: daysAgo(3),
    },
  });

  // StartupCo users
  const startupAdmin = await prisma.user.create({
    data: {
      id: 'user_startup_admin',
      email: 'lisa.nguyen@startupco.com',
      name: 'Lisa Nguyen',
      role: 'ADMIN',
      tenantId: tenantStartup.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      lastLoginAt: daysAgo(0),
      preferences: JSON.stringify({ theme: 'dark', notifications: true }),
    },
  });

  const startupApprover = await prisma.user.create({
    data: {
      id: 'user_startup_approver',
      email: 'david.kim@startupco.com',
      name: 'David Kim',
      role: 'APPROVER',
      tenantId: tenantStartup.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      lastLoginAt: daysAgo(2),
    },
  });

  const startupClerk = await prisma.user.create({
    data: {
      id: 'user_startup_clerk',
      email: 'anna.kowalski@startupco.com',
      name: 'Anna Kowalski',
      role: 'AP_CLERK',
      tenantId: tenantStartup.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      lastLoginAt: daysAgo(1),
    },
  });

  const startupViewer = await prisma.user.create({
    data: {
      id: 'user_startup_viewer',
      email: 'tom.jackson@startupco.com',
      name: 'Tom Jackson',
      role: 'VIEWER',
      tenantId: tenantStartup.id,
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
      lastLoginAt: daysAgo(5),
    },
  });

  console.log('    Created 8 users across 2 tenants');

  // ─── 3. Trading Partners (5 per tenant = 10 total) ──────────
  console.log('[4/18] Creating trading partners...');

  const partnersData = [
    { id: 'tp_01', name: 'TechStar Solutions', taxId: 'US-12-3456789', email: 'billing@techstar.com', category: 'IT_SERVICES', riskScore: 15, discountTerms: '2/10 net 30', paymentTerms: 'NET_30', address: '100 Tech Blvd, San Jose, CA 95110', phone: '+1-408-555-0100', complianceStatus: 'compliant' },
    { id: 'tp_02', name: 'OfficeMax Supplies', taxId: 'US-98-7654321', email: 'accounts@officemax.com', category: 'OFFICE_SUPPLIES', riskScore: 5, discountTerms: '1/10 net 30', paymentTerms: 'NET_30', address: '200 Commerce Way, Chicago, IL 60601', phone: '+1-312-555-0200', complianceStatus: 'compliant' },
    { id: 'tp_03', name: 'Deloitte Consulting', taxId: 'US-45-6789012', email: 'invoicing@deloitte.com', category: 'PROFESSIONAL_SERVICES', riskScore: 8, discountTerms: null, paymentTerms: 'NET_45', address: '30 Rock Plaza, New York, NY 10112', phone: '+1-212-555-0300', complianceStatus: 'compliant' },
    { id: 'tp_04', name: 'Global Logistics Corp', taxId: 'US-67-8901234', email: 'ap@globallogistics.com', category: 'LOGISTICS', riskScore: 22, discountTerms: '2/10 net 45', paymentTerms: 'NET_45', address: '500 Shipping Ln, Long Beach, CA 90802', phone: '+1-562-555-0400', complianceStatus: 'compliant' },
    { id: 'tp_05', name: 'Precision Manufacturing', taxId: 'US-23-4567890', email: 'billing@precisionmfg.com', category: 'MANUFACTURING', riskScore: 30, discountTerms: '3/15 net 60', paymentTerms: 'NET_60', address: '1200 Factory Rd, Detroit, MI 48201', phone: '+1-313-555-0500', complianceStatus: 'pending' },
    { id: 'tp_06', name: 'CloudVault Services', taxId: 'US-34-5678901', email: 'finance@cloudvault.io', category: 'IT_SERVICES', riskScore: 10, discountTerms: null, paymentTerms: 'NET_30', address: '800 Cloud Ave, Seattle, WA 98101', phone: '+1-206-555-0600', complianceStatus: 'compliant' },
    { id: 'tp_07', name: 'Baker & Associates LLP', taxId: 'US-56-7890123', email: 'billing@bakerassoc.com', category: 'PROFESSIONAL_SERVICES', riskScore: 12, discountTerms: null, paymentTerms: 'NET_30', address: '50 Law St, Boston, MA 02108', phone: '+1-617-555-0700', complianceStatus: 'compliant' },
    { id: 'tp_08', name: 'EcoClean Facilities', taxId: 'US-78-9012345', email: 'ar@ecoclean.com', category: 'OFFICE_SUPPLIES', riskScore: 18, discountTerms: '1/10 net 30', paymentTerms: 'NET_30', address: '75 Clean Way, Austin, TX 73301', phone: '+1-512-555-0800', complianceStatus: 'compliant' },
    { id: 'tp_09', name: 'DataSecure Inc', taxId: 'US-89-0123456', email: 'accounts@datasecure.com', category: 'IT_SERVICES', riskScore: 7, discountTerms: null, paymentTerms: 'NET_30', address: '400 Cyber Dr, Reston, VA 20190', phone: '+1-571-555-0900', complianceStatus: 'compliant' },
    { id: 'tp_10', name: 'FastFreight Shipping', taxId: 'US-01-2345678', email: 'invoices@fastfreight.com', category: 'LOGISTICS', riskScore: 25, discountTerms: '2/10 net 30', paymentTerms: 'NET_30', address: '900 Port Rd, Newark, NJ 07102', phone: '+1-973-555-1000', complianceStatus: 'pending' },
  ];

  for (const p of partnersData) {
    await prisma.tradingPartner.create({ data: p });
  }
  console.log(`    Created ${partnersData.length} trading partners`);

  // ─── 4. Invoices (20 per tenant = 40 total) ─────────────────
  console.log('[5/18] Creating invoices...');

  const invoiceStatuses = [
    'ingested', 'extracted', 'compliance_checked', 'classified',
    'matched', 'approved', 'paid', 'rejected', 'flagged_for_review',
  ];
  const sourceTypes = ['email', 'upload', 'api', 'network'];
  const paymentMethods = ['ACH', 'WIRE', 'VIRTUAL_CARD', 'CHECK'];
  const costCenters = ['CC-100', 'CC-200', 'CC-300', 'CC-400', 'CC-500'];
  const glCodes = ['6000-OPEX', '6100-IT', '6200-TRAVEL', '6300-OFFICE', '6400-PROF-SVC', '6500-LOGISTICS'];

  // Acme invoices (inv_001 through inv_020)
  for (let i = 1; i <= 20; i++) {
    const idx = i - 1;
    const status = invoiceStatuses[idx % invoiceStatuses.length];
    const partnerIdx = idx % 5;
    const partnerId = partnersData[partnerIdx].id;
    const subtotal = randomFloat(500, 50000);
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    await prisma.invoice.create({
      data: {
        id: `inv_${String(i).padStart(3, '0')}`,
        tenantId: tenantAcme.id,
        sourceType: sourceTypes[idx % sourceTypes.length],
        status,
        createdBy: acmeClerk.id,
        invoiceNumber: `INV-2025-${String(i + 1000).padStart(5, '0')}`,
        invoiceDate: daysAgo(Math.floor(Math.random() * 90)),
        dueDate: daysFromNow(Math.floor(Math.random() * 60)),
        vendorName: partnersData[partnerIdx].name,
        totalAmount: total,
        subtotalAmount: subtotal,
        taxAmount: tax,
        currency: 'USD',
        poNumber: idx % 3 === 0 ? `PO-${String(i).padStart(4, '0')}` : null,
        costCenter: costCenters[idx % costCenters.length],
        glCode: glCodes[idx % glCodes.length],
        description: `Invoice for ${(partnersData[partnerIdx].category || '').toLowerCase().replace(/_/g, ' ')} services`,
        paymentMethod: status === 'paid' ? paymentMethods[idx % paymentMethods.length] : null,
        aiConfidence: randomFloat(0.75, 0.99),
        processingTimeMs: Math.floor(500 + Math.random() * 4500),
        partnerId,
        discountApplied: idx % 5 === 0 ? parseFloat((total * 0.02).toFixed(2)) : 0,
      },
    });
  }

  // StartupCo invoices (inv_021 through inv_040)
  for (let i = 21; i <= 40; i++) {
    const idx = i - 21;
    const status = invoiceStatuses[idx % invoiceStatuses.length];
    const partnerIdx = 5 + (idx % 5);
    const partnerId = partnersData[partnerIdx].id;
    const subtotal = randomFloat(200, 15000);
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    await prisma.invoice.create({
      data: {
        id: `inv_${String(i).padStart(3, '0')}`,
        tenantId: tenantStartup.id,
        sourceType: sourceTypes[idx % sourceTypes.length],
        status,
        createdBy: startupClerk.id,
        invoiceNumber: `INV-2025-${String(i + 1000).padStart(5, '0')}`,
        invoiceDate: daysAgo(Math.floor(Math.random() * 90)),
        dueDate: daysFromNow(Math.floor(Math.random() * 60)),
        vendorName: partnersData[partnerIdx].name,
        totalAmount: total,
        subtotalAmount: subtotal,
        taxAmount: tax,
        currency: 'USD',
        poNumber: idx % 4 === 0 ? `PO-${String(i).padStart(4, '0')}` : null,
        costCenter: costCenters[idx % costCenters.length],
        glCode: glCodes[idx % glCodes.length],
        description: `Invoice for ${(partnersData[partnerIdx].category || '').toLowerCase().replace(/_/g, ' ')} services`,
        paymentMethod: status === 'paid' ? paymentMethods[idx % paymentMethods.length] : null,
        aiConfidence: randomFloat(0.70, 0.98),
        processingTimeMs: Math.floor(800 + Math.random() * 5000),
        partnerId,
        discountApplied: idx % 5 === 0 ? parseFloat((total * 0.01).toFixed(2)) : 0,
      },
    });
  }
  console.log('    Created 40 invoices (20 per tenant)');

  // ─── 5. Purchase Orders (5 per tenant = 10 total) ───────────
  console.log('[6/18] Creating purchase orders...');

  const purchaseOrdersData = [
    { id: 'po_01', poNumber: 'PO-2025-0001', supplierId: 'tp_01', tenantId: tenantAcme.id, totalAmount: 15000, status: 'APPROVED', description: 'IT infrastructure upgrade Q1', lineItems: JSON.stringify([{ item: 'Server rack', qty: 2, unitPrice: 5000 }, { item: 'Network switch', qty: 5, unitPrice: 1000 }]) },
    { id: 'po_02', poNumber: 'PO-2025-0002', supplierId: 'tp_02', tenantId: tenantAcme.id, totalAmount: 3200, status: 'RECEIVED', description: 'Office supplies Q1 order', lineItems: JSON.stringify([{ item: 'Paper (case)', qty: 50, unitPrice: 40 }, { item: 'Toner cartridge', qty: 20, unitPrice: 60 }]) },
    { id: 'po_03', poNumber: 'PO-2025-0003', supplierId: 'tp_03', tenantId: tenantAcme.id, totalAmount: 75000, status: 'APPROVED', description: 'Consulting engagement - process optimization', lineItems: JSON.stringify([{ item: 'Senior consultant (hours)', qty: 500, unitPrice: 150 }]) },
    { id: 'po_04', poNumber: 'PO-2025-0004', supplierId: 'tp_04', tenantId: tenantAcme.id, totalAmount: 8500, status: 'PARTIALLY_RECEIVED', description: 'Warehouse shipping services', lineItems: JSON.stringify([{ item: 'Domestic freight', qty: 100, unitPrice: 50 }, { item: 'International freight', qty: 10, unitPrice: 350 }]) },
    { id: 'po_05', poNumber: 'PO-2025-0005', supplierId: 'tp_05', tenantId: tenantAcme.id, totalAmount: 125000, status: 'CLOSED', description: 'Custom machined parts batch', lineItems: JSON.stringify([{ item: 'Machined housing', qty: 500, unitPrice: 250 }]) },
    { id: 'po_06', poNumber: 'PO-2025-0006', supplierId: 'tp_06', tenantId: tenantStartup.id, totalAmount: 24000, status: 'APPROVED', description: 'Cloud hosting annual contract', lineItems: JSON.stringify([{ item: 'Cloud hosting (monthly)', qty: 12, unitPrice: 2000 }]) },
    { id: 'po_07', poNumber: 'PO-2025-0007', supplierId: 'tp_07', tenantId: tenantStartup.id, totalAmount: 12000, status: 'APPROVED', description: 'Legal retainer Q1-Q2', lineItems: JSON.stringify([{ item: 'Legal retainer (monthly)', qty: 6, unitPrice: 2000 }]) },
    { id: 'po_08', poNumber: 'PO-2025-0008', supplierId: 'tp_08', tenantId: tenantStartup.id, totalAmount: 2400, status: 'RECEIVED', description: 'Office cleaning services', lineItems: JSON.stringify([{ item: 'Monthly cleaning', qty: 6, unitPrice: 400 }]) },
    { id: 'po_09', poNumber: 'PO-2025-0009', supplierId: 'tp_09', tenantId: tenantStartup.id, totalAmount: 18000, status: 'APPROVED', description: 'Cybersecurity audit and tools', lineItems: JSON.stringify([{ item: 'Pen test', qty: 1, unitPrice: 8000 }, { item: 'License (annual)', qty: 2, unitPrice: 5000 }]) },
    { id: 'po_10', poNumber: 'PO-2025-0010', supplierId: 'tp_10', tenantId: tenantStartup.id, totalAmount: 5600, status: 'DRAFT', description: 'Freight services Q2', lineItems: JSON.stringify([{ item: 'Domestic shipping', qty: 80, unitPrice: 70 }]) },
  ];

  for (const po of purchaseOrdersData) {
    await prisma.purchaseOrder.create({ data: po });
  }
  console.log(`    Created ${purchaseOrdersData.length} purchase orders`);

  // ─── 6. Expenses (10 per tenant = 20 total) ─────────────────
  console.log('[7/18] Creating expenses...');

  const expensesData = [
    { id: 'exp_01', userId: acmeClerk.id, tenantId: tenantAcme.id, category: 'TRAVEL', amount: 450.00, receiptUrl: '/receipts/exp_01.jpg', status: 'APPROVED', description: 'Client visit - flight to Chicago', merchant: 'United Airlines', project: 'Client Onboarding', costCenter: 'CC-200', expenseDate: daysAgo(15), submittedAt: daysAgo(14), approvedAt: daysAgo(12) },
    { id: 'exp_02', userId: acmeClerk.id, tenantId: tenantAcme.id, category: 'MEALS', amount: 85.50, receiptUrl: '/receipts/exp_02.jpg', status: 'APPROVED', description: 'Team lunch - quarterly review', merchant: 'The Capital Grille', costCenter: 'CC-100', expenseDate: daysAgo(10), submittedAt: daysAgo(9), approvedAt: daysAgo(7) },
    { id: 'exp_03', userId: acmeAdmin.id, tenantId: tenantAcme.id, category: 'SOFTWARE', amount: 299.00, receiptUrl: '/receipts/exp_03.jpg', status: 'REIMBURSED', description: 'Annual Figma license', merchant: 'Figma Inc', costCenter: 'CC-300', expenseDate: daysAgo(30), submittedAt: daysAgo(29), approvedAt: daysAgo(25) },
    { id: 'exp_04', userId: acmeApprover.id, tenantId: tenantAcme.id, category: 'TRAVEL', amount: 1250.00, receiptUrl: '/receipts/exp_04.jpg', status: 'SUBMITTED', description: 'Conference attendance - AP World', merchant: 'Marriott Hotels', project: 'Professional Development', costCenter: 'CC-200', expenseDate: daysAgo(5), submittedAt: daysAgo(4) },
    { id: 'exp_05', userId: acmeViewer.id, tenantId: tenantAcme.id, category: 'OFFICE', amount: 156.75, receiptUrl: '/receipts/exp_05.jpg', status: 'DRAFT', description: 'Ergonomic keyboard and mouse', merchant: 'Amazon', costCenter: 'CC-100', expenseDate: daysAgo(2) },
    { id: 'exp_06', userId: acmeClerk.id, tenantId: tenantAcme.id, category: 'EQUIPMENT', amount: 2100.00, receiptUrl: '/receipts/exp_06.jpg', status: 'APPROVED', description: 'External monitor for remote work', merchant: 'Dell Technologies', costCenter: 'CC-300', expenseDate: daysAgo(20), submittedAt: daysAgo(19), approvedAt: daysAgo(17) },
    { id: 'exp_07', userId: acmeApprover.id, tenantId: tenantAcme.id, category: 'TRAVEL', amount: 320.00, receiptUrl: '/receipts/exp_07.jpg', status: 'SUBMITTED', description: 'Uber rides - client meetings', merchant: 'Uber', project: 'Client Onboarding', costCenter: 'CC-200', expenseDate: daysAgo(8), submittedAt: daysAgo(7) },
    { id: 'exp_08', userId: acmeAdmin.id, tenantId: tenantAcme.id, category: 'SOFTWARE', amount: 499.00, receiptUrl: '/receipts/exp_08.jpg', status: 'APPROVED', description: 'Annual GitHub Team subscription', merchant: 'GitHub', costCenter: 'CC-300', expenseDate: daysAgo(45), submittedAt: daysAgo(44), approvedAt: daysAgo(43) },
    { id: 'exp_09', userId: acmeClerk.id, tenantId: tenantAcme.id, category: 'MEALS', amount: 62.00, receiptUrl: '/receipts/exp_09.jpg', status: 'REJECTED', description: 'Dinner - over policy limit', merchant: 'Nobu Restaurant', costCenter: 'CC-100', expenseDate: daysAgo(12), submittedAt: daysAgo(11) },
    { id: 'exp_10', userId: acmeAdmin.id, tenantId: tenantAcme.id, category: 'OTHER', amount: 175.00, receiptUrl: '/receipts/exp_10.jpg', status: 'SUBMITTED', description: 'Co-working space day pass', merchant: 'WeWork', project: 'Remote Work', costCenter: 'CC-500', expenseDate: daysAgo(3), submittedAt: daysAgo(2) },
    { id: 'exp_11', userId: startupAdmin.id, tenantId: tenantStartup.id, category: 'SOFTWARE', amount: 199.00, receiptUrl: '/receipts/exp_11.jpg', status: 'APPROVED', description: 'Slack annual subscription', merchant: 'Slack Technologies', costCenter: 'CC-300', expenseDate: daysAgo(40), submittedAt: daysAgo(39), approvedAt: daysAgo(38) },
    { id: 'exp_12', userId: startupClerk.id, tenantId: tenantStartup.id, category: 'OFFICE', amount: 89.99, receiptUrl: '/receipts/exp_12.jpg', status: 'APPROVED', description: 'Office supplies - pens and notebooks', merchant: 'Staples', costCenter: 'CC-100', expenseDate: daysAgo(25), submittedAt: daysAgo(24), approvedAt: daysAgo(22) },
    { id: 'exp_13', userId: startupAdmin.id, tenantId: tenantStartup.id, category: 'TRAVEL', amount: 680.00, receiptUrl: '/receipts/exp_13.jpg', status: 'SUBMITTED', description: 'Flight to investor meeting', merchant: 'Southwest Airlines', project: 'Fundraising', costCenter: 'CC-200', expenseDate: daysAgo(7), submittedAt: daysAgo(6) },
    { id: 'exp_14', userId: startupApprover.id, tenantId: tenantStartup.id, category: 'MEALS', amount: 42.50, receiptUrl: '/receipts/exp_14.jpg', status: 'APPROVED', description: 'Team coffee meeting', merchant: 'Starbucks', costCenter: 'CC-100', expenseDate: daysAgo(15), submittedAt: daysAgo(14), approvedAt: daysAgo(13) },
    { id: 'exp_15', userId: startupClerk.id, tenantId: tenantStartup.id, category: 'SOFTWARE', amount: 120.00, receiptUrl: '/receipts/exp_15.jpg', status: 'DRAFT', description: 'Notion team plan', merchant: 'Notion Labs', costCenter: 'CC-300', expenseDate: daysAgo(3) },
    { id: 'exp_16', userId: startupAdmin.id, tenantId: tenantStartup.id, category: 'EQUIPMENT', amount: 1599.00, receiptUrl: '/receipts/exp_16.jpg', status: 'APPROVED', description: 'MacBook charger and accessories', merchant: 'Apple Store', costCenter: 'CC-300', expenseDate: daysAgo(35), submittedAt: daysAgo(34), approvedAt: daysAgo(32) },
    { id: 'exp_17', userId: startupApprover.id, tenantId: tenantStartup.id, category: 'TRAVEL', amount: 250.00, receiptUrl: '/receipts/exp_17.jpg', status: 'SUBMITTED', description: 'Hotel for trade show', merchant: 'Holiday Inn', project: 'Marketing', costCenter: 'CC-200', expenseDate: daysAgo(10), submittedAt: daysAgo(9) },
    { id: 'exp_18', userId: startupClerk.id, tenantId: tenantStartup.id, category: 'OTHER', amount: 55.00, receiptUrl: '/receipts/exp_18.jpg', status: 'REJECTED', description: 'Personal item - not reimbursable', merchant: 'Target', costCenter: 'CC-100', expenseDate: daysAgo(18), submittedAt: daysAgo(17) },
    { id: 'exp_19', userId: startupAdmin.id, tenantId: tenantStartup.id, category: 'OFFICE', amount: 320.00, receiptUrl: '/receipts/exp_19.jpg', status: 'REIMBURSED', description: 'Standing desk converter', merchant: 'Amazon', costCenter: 'CC-100', expenseDate: daysAgo(50), submittedAt: daysAgo(49), approvedAt: daysAgo(47) },
    { id: 'exp_20', userId: startupViewer.id, tenantId: tenantStartup.id, category: 'MEALS', amount: 35.00, receiptUrl: '/receipts/exp_20.jpg', status: 'DRAFT', description: 'Working lunch', merchant: 'Chipotle', costCenter: 'CC-100', expenseDate: daysAgo(1) },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }
  console.log(`    Created ${expensesData.length} expenses`);

  // ─── 7. Contracts (3 per tenant = 6 total) ──────────────────
  console.log('[8/18] Creating contracts...');

  const contractsData = [
    { id: 'ct_01', tenantId: tenantAcme.id, supplierId: 'tp_01', title: 'IT Infrastructure Maintenance Agreement', value: 120000, startDate: daysAgo(180), endDate: daysFromNow(185), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ sla: '99.9%', supportHours: '24/7', penaltyRate: 0.5 }), documentUrl: '/docs/contracts/ct_01.pdf' },
    { id: 'ct_02', tenantId: tenantAcme.id, supplierId: 'tp_03', title: 'Strategic Consulting Framework', value: 500000, startDate: daysAgo(90), endDate: daysFromNow(275), status: 'ACTIVE', autoRenew: false, terms: JSON.stringify({ rateCard: { senior: 250, principal: 400 }, travelCap: 15000 }), documentUrl: '/docs/contracts/ct_02.pdf' },
    { id: 'ct_03', tenantId: tenantAcme.id, supplierId: 'tp_05', title: 'Manufacturing Supply Agreement', value: 250000, startDate: daysAgo(365), endDate: daysFromNow(0), status: 'EXPIRING', autoRenew: true, terms: JSON.stringify({ minOrder: 100, leadTime: '30 days', qualitySpec: 'ISO 9001' }), documentUrl: '/docs/contracts/ct_03.pdf' },
    { id: 'ct_04', tenantId: tenantStartup.id, supplierId: 'tp_06', title: 'Cloud Hosting Service Agreement', value: 28800, startDate: daysAgo(60), endDate: daysFromNow(305), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ tier: 'Startup', storage: '500GB', compute: '100vCPU' }), documentUrl: '/docs/contracts/ct_04.pdf' },
    { id: 'ct_05', tenantId: tenantStartup.id, supplierId: 'tp_07', title: 'Legal Services Retainer', value: 24000, startDate: daysAgo(30), endDate: daysFromNow(335), status: 'ACTIVE', autoRenew: false, terms: JSON.stringify({ hoursPerMonth: 10, rateOverage: 350 }), documentUrl: '/docs/contracts/ct_05.pdf' },
    { id: 'ct_06', tenantId: tenantStartup.id, supplierId: 'tp_09', title: 'Cybersecurity Assessment & Monitoring', value: 36000, startDate: daysAgo(30), endDate: daysFromNow(335), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ scope: 'full-stack', frequency: 'quarterly', responseTime: '1 hour' }), documentUrl: '/docs/contracts/ct_06.pdf' },
  ];

  for (const ct of contractsData) {
    await prisma.contract.create({ data: ct });
  }
  console.log(`    Created ${contractsData.length} contracts`);

  // ─── 8. Payment Batches & Transactions ──────────────────────
  console.log('[9/18] Creating payment batches and transactions...');

  const batchesData = [
    { id: 'pb_01', tenantId: tenantAcme.id, totalAmount: 35000, paymentCount: 4, status: 'COMPLETED', method: 'ACH', processedAt: daysAgo(5) },
    { id: 'pb_02', tenantId: tenantAcme.id, totalAmount: 12500, paymentCount: 3, status: 'PROCESSING', method: 'WIRE', processedAt: null },
    { id: 'pb_03', tenantId: tenantStartup.id, totalAmount: 8500, paymentCount: 3, status: 'COMPLETED', method: 'ACH', processedAt: daysAgo(1) },
    { id: 'pb_04', tenantId: tenantStartup.id, totalAmount: 4200, paymentCount: 2, status: 'PENDING', method: 'CHECK', processedAt: null },
  ];

  for (const batch of batchesData) {
    await prisma.paymentBatch.create({ data: batch });
  }

  const txnsData = [
    { id: 'ptx_01', batchId: 'pb_01', invoiceId: 'inv_007', amount: 8500, status: 'COMPLETED', reference: 'ACH-REF-001', processedAt: daysAgo(5) },
    { id: 'ptx_02', batchId: 'pb_01', invoiceId: 'inv_016', amount: 12000, status: 'COMPLETED', reference: 'ACH-REF-002', processedAt: daysAgo(5) },
    { id: 'ptx_03', batchId: 'pb_01', invoiceId: 'inv_006', amount: 8000, status: 'COMPLETED', reference: 'ACH-REF-003', processedAt: daysAgo(5) },
    { id: 'ptx_04', batchId: 'pb_01', invoiceId: 'inv_015', amount: 6500, status: 'COMPLETED', reference: 'ACH-REF-004', processedAt: daysAgo(5) },
    { id: 'ptx_05', batchId: 'pb_02', invoiceId: 'inv_001', amount: 4500, status: 'PROCESSING', reference: 'WIRE-REF-001', processedAt: null },
    { id: 'ptx_06', batchId: 'pb_02', invoiceId: 'inv_010', amount: 3000, status: 'PROCESSING', reference: 'WIRE-REF-002', processedAt: null },
    { id: 'ptx_07', batchId: 'pb_02', invoiceId: 'inv_019', amount: 5000, status: 'PROCESSING', reference: 'WIRE-REF-003', processedAt: null },
    { id: 'ptx_08', batchId: 'pb_03', invoiceId: 'inv_027', amount: 3000, status: 'COMPLETED', reference: 'ACH-REF-010', processedAt: daysAgo(1) },
    { id: 'ptx_09', batchId: 'pb_03', invoiceId: 'inv_028', amount: 2500, status: 'COMPLETED', reference: 'ACH-REF-011', processedAt: daysAgo(1) },
    { id: 'ptx_10', batchId: 'pb_03', invoiceId: 'inv_029', amount: 3000, status: 'COMPLETED', reference: 'ACH-REF-012', processedAt: daysAgo(1) },
    { id: 'ptx_11', batchId: 'pb_04', invoiceId: 'inv_031', amount: 2200, status: 'PENDING', reference: null, processedAt: null },
    { id: 'ptx_12', batchId: 'pb_04', invoiceId: 'inv_032', amount: 2000, status: 'PENDING', reference: null, processedAt: null },
  ];

  for (const txn of txnsData) {
    await prisma.paymentTransaction.create({ data: txn });
  }
  console.log(`    Created ${batchesData.length} batches with ${txnsData.length} transactions`);

  // ─── 9. Approval Workflows & Steps ──────────────────────────
  console.log('[10/18] Creating approval workflows and steps...');

  const workflowsData = [
    { id: 'wf_01', name: 'Standard Invoice Approval', description: 'Default workflow for invoices under $10,000', tenantId: tenantAcme.id, rules: JSON.stringify({ maxAmount: 10000, autoApprove: true, requiredApprovers: 1 }), isActive: true },
    { id: 'wf_02', name: 'High Value Approval', description: 'Two-step approval for invoices over $10,000', tenantId: tenantAcme.id, rules: JSON.stringify({ minAmount: 10000, autoApprove: false, requiredApprovers: 2 }), isActive: true },
    { id: 'wf_03', name: 'Emergency Payment', description: 'Fast-track approval for urgent payments', tenantId: tenantAcme.id, rules: JSON.stringify({ priority: 'URGENT', autoApprove: false, requiredApprovers: 1, escalateAfterHours: 4 }), isActive: true },
    { id: 'wf_04', name: 'New Vendor Approval', description: 'Additional scrutiny for first-time vendor invoices', tenantId: tenantAcme.id, rules: JSON.stringify({ newVendor: true, autoApprove: false, requiredApprovers: 2, complianceCheck: true }), isActive: true },
    { id: 'wf_05', name: 'PO Match Auto-Approve', description: 'Auto-approve when PO match is exact', tenantId: tenantAcme.id, rules: JSON.stringify({ poMatch: true, tolerancePercent: 5, autoApprove: true }), isActive: true },
    { id: 'wf_06', name: 'Startup Standard', description: 'Simple approval for StartupCo', tenantId: tenantStartup.id, rules: JSON.stringify({ maxAmount: 1000, autoApprove: false, requiredApprovers: 1 }), isActive: true },
    { id: 'wf_07', name: 'Founder Approval Required', description: 'Founder approval for invoices over $1,000', tenantId: tenantStartup.id, rules: JSON.stringify({ minAmount: 1000, autoApprove: false, requiredApprovers: 1, founderApproval: true }), isActive: true },
    { id: 'wf_08', name: 'Recurring Payment', description: 'Streamlined for recurring vendor payments', tenantId: tenantStartup.id, rules: JSON.stringify({ recurring: true, autoApprove: true, requiredApprovers: 0 }), isActive: true },
    { id: 'wf_09', name: 'Expense Reimbursement', description: 'Approval flow for employee expense claims', tenantId: tenantStartup.id, rules: JSON.stringify({ type: 'expense', maxAmount: 500, requiredApprovers: 1 }), isActive: true },
    { id: 'wf_10', name: 'Risk-Based Review', description: 'Additional review for high-risk vendors', tenantId: tenantStartup.id, rules: JSON.stringify({ riskScoreThreshold: 20, requiredApprovers: 2, complianceCheck: true }), isActive: false },
  ];

  for (const wf of workflowsData) {
    await prisma.approvalWorkflow.create({ data: wf });
  }

  const approvalStepsData = [
    { id: 'as_01', workflowId: 'wf_01', invoiceId: 'inv_001', stepOrder: 1, approverId: acmeApprover.id, status: 'APPROVED', comments: 'Looks good, approved.', approvedAt: daysAgo(5) },
    { id: 'as_02', workflowId: 'wf_02', invoiceId: 'inv_002', stepOrder: 1, approverId: acmeApprover.id, status: 'APPROVED', comments: 'First approval complete.', approvedAt: daysAgo(4) },
    { id: 'as_03', workflowId: 'wf_02', invoiceId: 'inv_002', stepOrder: 2, approverId: acmeAdmin.id, status: 'APPROVED', comments: 'Second approval. Released for payment.', approvedAt: daysAgo(3) },
    { id: 'as_04', workflowId: 'wf_01', invoiceId: 'inv_003', stepOrder: 1, approverId: acmeApprover.id, status: 'PENDING', comments: null, approvedAt: null },
    { id: 'as_05', workflowId: 'wf_03', invoiceId: 'inv_004', stepOrder: 1, approverId: acmeAdmin.id, status: 'APPROVED', comments: 'Emergency payment approved.', approvedAt: daysAgo(1) },
    { id: 'as_06', workflowId: 'wf_04', invoiceId: 'inv_005', stepOrder: 1, approverId: acmeApprover.id, status: 'REJECTED', comments: 'New vendor not verified.', approvedAt: null },
    { id: 'as_07', workflowId: 'wf_05', invoiceId: 'inv_015', stepOrder: 1, approverId: null, status: 'SKIPPED', comments: 'Auto-approved: PO match within tolerance.', approvedAt: daysAgo(8) },
    { id: 'as_08', workflowId: 'wf_06', invoiceId: 'inv_021', stepOrder: 1, approverId: startupApprover.id, status: 'APPROVED', comments: 'Approved - within budget.', approvedAt: daysAgo(7) },
    { id: 'as_09', workflowId: 'wf_07', invoiceId: 'inv_022', stepOrder: 1, approverId: startupAdmin.id, status: 'APPROVED', comments: 'Founder approved.', approvedAt: daysAgo(6) },
    { id: 'as_10', workflowId: 'wf_06', invoiceId: 'inv_023', stepOrder: 1, approverId: startupApprover.id, status: 'PENDING', comments: null, approvedAt: null },
  ];

  for (const step of approvalStepsData) {
    await prisma.approvalStep.create({ data: step });
  }
  console.log(`    Created ${workflowsData.length} workflows with ${approvalStepsData.length} steps`);

  // ─── 10. Risk Alerts ────────────────────────────────────────
  console.log('[11/18] Creating risk alerts...');

  const riskAlertsData = [
    { id: 'ra_01', tenantId: tenantAcme.id, invoiceId: 'inv_005', riskType: 'DUPLICATE', severity: 'HIGH', description: 'Potential duplicate invoice detected - similar amount and vendor within 7 days', status: 'OPEN', details: JSON.stringify({ matchedInvoiceId: 'inv_004', similarityScore: 0.92 }), detectedAt: daysAgo(4) },
    { id: 'ra_02', tenantId: tenantAcme.id, invoiceId: 'inv_008', riskType: 'FRAUD', severity: 'CRITICAL', description: 'Vendor bank account changed before payment - potential BEC fraud', status: 'INVESTIGATING', details: JSON.stringify({ previousBank: 'Chase', newBank: 'Unknown Bank' }), detectedAt: daysAgo(2) },
    { id: 'ra_03', tenantId: tenantAcme.id, invoiceId: 'inv_012', riskType: 'ANOMALY', severity: 'MEDIUM', description: 'Invoice amount 3x higher than average for this vendor', status: 'OPEN', details: JSON.stringify({ averageAmount: 5000, invoiceAmount: 15000 }), detectedAt: daysAgo(6) },
    { id: 'ra_04', tenantId: tenantStartup.id, invoiceId: 'inv_030', riskType: 'COMPLIANCE', severity: 'HIGH', description: 'Missing W-9 form for new vendor', status: 'OPEN', details: JSON.stringify({ requiredForm: 'W-9', vendorId: 'tp_10' }), detectedAt: daysAgo(3) },
    { id: 'ra_05', tenantId: tenantStartup.id, invoiceId: 'inv_035', riskType: 'ANOMALY', severity: 'LOW', description: 'Unusual payment terms - NET_7 instead of NET_30', status: 'RESOLVED', details: JSON.stringify({ requestedTerms: 'NET_7', standardTerms: 'NET_30' }), detectedAt: daysAgo(10), resolvedAt: daysAgo(8) },
  ];

  for (const ra of riskAlertsData) {
    await prisma.riskAlert.create({ data: ra });
  }
  console.log(`    Created ${riskAlertsData.length} risk alerts`);

  // ─── 11. Audit Logs ─────────────────────────────────────────
  console.log('[12/18] Creating audit logs...');

  const auditLogsData = [
    { id: 'al_01', tenantId: tenantAcme.id, userId: acmeAdmin.id, action: 'LOGIN', entityType: 'User', entityId: acmeAdmin.id, details: JSON.stringify({ method: 'password', success: true }), ipAddress: '192.168.1.100', timestamp: daysAgo(0) },
    { id: 'al_02', tenantId: tenantAcme.id, userId: acmeAdmin.id, action: 'CONFIGURED', entityType: 'Setting', entityId: tenantAcme.id, details: JSON.stringify({ changed: ['approvalThreshold'], from: 5000, to: 10000 }), ipAddress: '192.168.1.100', timestamp: daysAgo(1) },
    { id: 'al_03', tenantId: tenantAcme.id, userId: acmeClerk.id, action: 'CREATED', entityType: 'Invoice', entityId: 'inv_001', details: JSON.stringify({ source: 'upload' }), ipAddress: '192.168.1.105', timestamp: daysAgo(10) },
    { id: 'al_04', tenantId: tenantAcme.id, userId: acmeApprover.id, action: 'APPROVED', entityType: 'Invoice', entityId: 'inv_001', details: JSON.stringify({ workflowId: 'wf_01' }), ipAddress: '192.168.1.110', timestamp: daysAgo(5) },
    { id: 'al_05', tenantId: tenantAcme.id, userId: acmeApprover.id, action: 'REJECTED', entityType: 'Invoice', entityId: 'inv_005', details: JSON.stringify({ reason: 'Vendor not verified' }), ipAddress: '192.168.1.110', timestamp: daysAgo(4) },
    { id: 'al_06', tenantId: tenantAcme.id, userId: acmeAdmin.id, action: 'CREATED', entityType: 'Supplier', entityId: 'tp_01', details: JSON.stringify({ name: 'TechStar Solutions' }), ipAddress: '192.168.1.100', timestamp: daysAgo(30) },
    { id: 'al_07', tenantId: tenantAcme.id, userId: acmeAdmin.id, action: 'EXPORT', entityType: 'Report', entityId: 'rpt_01', details: JSON.stringify({ format: 'CSV', rows: 150 }), ipAddress: '192.168.1.100', timestamp: daysAgo(3) },
    { id: 'al_08', tenantId: tenantAcme.id, userId: null, action: 'CREATED', entityType: 'Payment', entityId: 'pb_01', details: JSON.stringify({ method: 'ACH', total: 35000 }), ipAddress: null, timestamp: daysAgo(5) },
    { id: 'al_09', tenantId: tenantAcme.id, userId: acmeAdmin.id, action: 'UPDATED', entityType: 'User', entityId: acmeClerk.id, details: JSON.stringify({ changed: ['role'] }), ipAddress: '192.168.1.100', timestamp: daysAgo(20) },
    { id: 'al_10', tenantId: tenantAcme.id, userId: acmeClerk.id, action: 'CREATED', entityType: 'Invoice', entityId: 'inv_015', details: JSON.stringify({ source: 'email' }), ipAddress: '192.168.1.105', timestamp: daysAgo(8) },
    { id: 'al_11', tenantId: tenantStartup.id, userId: startupAdmin.id, action: 'LOGIN', entityType: 'User', entityId: startupAdmin.id, details: JSON.stringify({ method: 'password', success: true }), ipAddress: '172.16.0.10', timestamp: daysAgo(0) },
    { id: 'al_12', tenantId: tenantStartup.id, userId: startupAdmin.id, action: 'CONFIGURED', entityType: 'Setting', entityId: tenantStartup.id, details: JSON.stringify({ changed: ['touchlessEnabled'] }), ipAddress: '172.16.0.10', timestamp: daysAgo(15) },
    { id: 'al_13', tenantId: tenantStartup.id, userId: startupApprover.id, action: 'APPROVED', entityType: 'Invoice', entityId: 'inv_021', details: JSON.stringify({ workflowId: 'wf_06' }), ipAddress: '172.16.0.15', timestamp: daysAgo(7) },
    { id: 'al_14', tenantId: tenantStartup.id, userId: startupAdmin.id, action: 'APPROVED', entityType: 'Invoice', entityId: 'inv_022', details: JSON.stringify({ workflowId: 'wf_07' }), ipAddress: '172.16.0.10', timestamp: daysAgo(6) },
    { id: 'al_15', tenantId: tenantStartup.id, userId: startupClerk.id, action: 'CREATED', entityType: 'Invoice', entityId: 'inv_035', details: JSON.stringify({ source: 'upload' }), ipAddress: '172.16.0.20', timestamp: daysAgo(5) },
    { id: 'al_16', tenantId: tenantStartup.id, userId: startupAdmin.id, action: 'DELETED', entityType: 'Invoice', entityId: 'inv_040', details: JSON.stringify({ reason: 'Duplicate' }), ipAddress: '172.16.0.10', timestamp: daysAgo(2) },
    { id: 'al_17', tenantId: tenantStartup.id, userId: null, action: 'CREATED', entityType: 'Payment', entityId: 'pb_03', details: JSON.stringify({ method: 'ACH', total: 8500 }), ipAddress: null, timestamp: daysAgo(1) },
    { id: 'al_18', tenantId: tenantAcme.id, userId: acmeAdmin.id, action: 'CREATED', entityType: 'Approval', entityId: 'wf_01', details: JSON.stringify({ name: 'Standard Invoice Approval' }), ipAddress: '192.168.1.100', timestamp: daysAgo(60) },
    { id: 'al_19', tenantId: tenantAcme.id, userId: acmeApprover.id, action: 'LOGIN', entityType: 'User', entityId: acmeApprover.id, details: JSON.stringify({ method: 'password' }), ipAddress: '192.168.1.110', timestamp: daysAgo(1) },
    { id: 'al_20', tenantId: tenantStartup.id, userId: startupAdmin.id, action: 'CREATED', entityType: 'Approval', entityId: 'wf_06', details: JSON.stringify({ name: 'Startup Standard' }), ipAddress: '172.16.0.10', timestamp: daysAgo(45) },
  ];

  for (const log of auditLogsData) {
    await prisma.auditLog.create({ data: log });
  }
  console.log(`    Created ${auditLogsData.length} audit logs`);

  // ─── 12. Notifications ──────────────────────────────────────
  console.log('[13/18] Creating notifications...');

  const notificationsData = [
    { id: 'notif_01', userId: acmeApprover.id, tenantId: tenantAcme.id, type: 'APPROVAL_REQUIRED', title: 'Invoice Pending Approval', message: 'Invoice INV-2025-01003 requires your approval.', isRead: false, actionUrl: '/invoices/inv_003' },
    { id: 'notif_02', userId: acmeAdmin.id, tenantId: tenantAcme.id, type: 'RISK_ALERT', title: 'Critical: Potential BEC Fraud', message: 'Vendor bank account change detected. Payment hold activated.', isRead: false, actionUrl: '/risk-alerts/ra_02' },
    { id: 'notif_03', userId: acmeClerk.id, tenantId: tenantAcme.id, type: 'PAYMENT_PROCESSED', title: 'Payment Batch Completed', message: 'ACH batch PB-01 processed: $35,000 total.', isRead: true, actionUrl: '/payments/pb_01' },
    { id: 'notif_04', userId: acmeAdmin.id, tenantId: tenantAcme.id, type: 'SYSTEM', title: 'ERP Sync Complete', message: 'SAP sync: 25 invoices imported, 0 errors.', isRead: true, actionUrl: '/settings/erp' },
    { id: 'notif_05', userId: acmeViewer.id, tenantId: tenantAcme.id, type: 'INFO', title: 'Monthly Report Available', message: 'January Spend Analysis report is ready.', isRead: false, actionUrl: '/reports/rpt_01' },
    { id: 'notif_06', userId: startupAdmin.id, tenantId: tenantStartup.id, type: 'RISK_ALERT', title: 'Compliance Alert', message: 'Missing W-9 for FastFreight Shipping.', isRead: false, actionUrl: '/risk-alerts/ra_04' },
    { id: 'notif_07', userId: startupApprover.id, tenantId: tenantStartup.id, type: 'APPROVAL_REQUIRED', title: 'Invoice Pending Approval', message: 'Invoice INV-2025-01023 requires your approval.', isRead: false, actionUrl: '/invoices/inv_023' },
    { id: 'notif_08', userId: startupAdmin.id, tenantId: tenantStartup.id, type: 'PAYMENT_PROCESSED', title: 'Payment Batch Completed', message: 'ACH batch PB-03: 3 payments totaling $8,500.', isRead: true, actionUrl: '/payments/pb_03' },
    { id: 'notif_09', userId: startupClerk.id, tenantId: tenantStartup.id, type: 'SYSTEM', title: 'QuickBooks Sync', message: 'QuickBooks sync: 12 invoices synced.', isRead: true, actionUrl: '/settings/erp' },
    { id: 'notif_10', userId: startupViewer.id, tenantId: tenantStartup.id, type: 'INFO', title: 'Welcome to Medius', message: 'Your account has been set up. Explore the dashboard.', isRead: false, actionUrl: '/dashboard' },
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({ data: notif });
  }
  console.log(`    Created ${notificationsData.length} notifications`);

  // ─── 13. ERP Connections & Sync Logs ────────────────────────
  console.log('[14/18] Creating ERP connections...');

  const erpData = [
    { id: 'erp_01', tenantId: tenantAcme.id, erpType: 'SAP', name: 'SAP S/4HANA Production', status: 'ACTIVE', config: JSON.stringify({ host: 'sap.acme.internal', client: '100', encrypted: true }), lastSyncAt: daysAgo(0) },
    { id: 'erp_02', tenantId: tenantStartup.id, erpType: 'QUICKBOOKS', name: 'QuickBooks Online', status: 'ACTIVE', config: JSON.stringify({ realmId: 'qb-12345', encrypted: true }), lastSyncAt: daysAgo(0) },
  ];

  for (const erp of erpData) {
    await prisma.eRPConnection.create({ data: erp });
  }

  const syncData = [
    { id: 'sync_01', erpConnectionId: 'erp_01', direction: 'INBOUND', entityType: 'Invoice', recordCount: 25, status: 'SUCCESS', startedAt: daysAgo(0), completedAt: daysAgo(0) },
    { id: 'sync_02', erpConnectionId: 'erp_01', direction: 'OUTBOUND', entityType: 'Payment', recordCount: 8, status: 'SUCCESS', startedAt: daysAgo(1), completedAt: daysAgo(1) },
    { id: 'sync_03', erpConnectionId: 'erp_02', direction: 'INBOUND', entityType: 'Invoice', recordCount: 12, status: 'SUCCESS', startedAt: daysAgo(0), completedAt: daysAgo(0) },
    { id: 'sync_04', erpConnectionId: 'erp_02', direction: 'INBOUND', entityType: 'Invoice', recordCount: 0, status: 'FAILED', errors: JSON.stringify([{ code: 'AUTH_EXPIRED', message: 'OAuth token expired' }]), startedAt: daysAgo(2), completedAt: daysAgo(2) },
  ];

  for (const sl of syncData) {
    await prisma.syncLog.create({ data: sl });
  }
  console.log(`    Created ${erpData.length} ERP connections with ${syncData.length} sync logs`);

  // ─── 14. Reports ────────────────────────────────────────────
  console.log('[15/18] Creating reports...');

  const reportsData = [
    { id: 'rpt_01', tenantId: tenantAcme.id, name: 'Monthly Spend Analysis', type: 'SPEND_ANALYSIS', config: JSON.stringify({ dateRange: 'last_30_days', groupBy: ['vendor', 'category'] }), schedule: JSON.stringify({ cron: '0 8 1 * *', enabled: true, recipients: ['sarah.chen@acme-corp.com'] }), lastRunAt: daysAgo(2) },
    { id: 'rpt_02', tenantId: tenantAcme.id, name: 'Invoice Aging Report', type: 'AGING', config: JSON.stringify({ buckets: ['0-30', '31-60', '61-90', '90+'] }), schedule: JSON.stringify({ cron: '0 9 * * 1', enabled: true }), lastRunAt: daysAgo(5) },
    { id: 'rpt_03', tenantId: tenantAcme.id, name: 'Fraud Detection Summary', type: 'FRAUD', config: JSON.stringify({ dateRange: 'last_90_days' }), schedule: null, lastRunAt: daysAgo(1) },
    { id: 'rpt_04', tenantId: tenantStartup.id, name: 'Cash Flow Dashboard', type: 'CASH_FLOW', config: JSON.stringify({ dateRange: 'next_30_days', includeForecasts: true }), schedule: JSON.stringify({ cron: '0 7 * * 1', enabled: true, recipients: ['lisa.nguyen@startupco.com'] }), lastRunAt: daysAgo(5) },
    { id: 'rpt_05', tenantId: tenantStartup.id, name: 'Processing Efficiency', type: 'PROCESSING', config: JSON.stringify({ metrics: ['avgProcessingTime', 'touchlessRate'] }), schedule: null, lastRunAt: daysAgo(10) },
  ];

  for (const rpt of reportsData) {
    await prisma.report.create({ data: rpt });
  }
  console.log(`    Created ${reportsData.length} reports`);

  // ─── 15. Feature Flags ──────────────────────────────────────
  console.log('[16/18] Creating feature flags...');

  const featureFlagsData = [
    { id: 'ff_01', key: 'dynamic_discounting', name: 'Dynamic Discounting', description: 'Early-payment discounts based on vendor terms', isEnabled: true, plans: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']) },
    { id: 'ff_02', key: 'virtual_cards', name: 'Virtual Card Payments', description: 'Single-use virtual cards for vendor payments', isEnabled: true, plans: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']) },
    { id: 'ff_03', key: 'scf', name: 'Supply Chain Finance', description: 'Supply chain financing programs', isEnabled: false, tenantIds: JSON.stringify([tenantAcme.id]), plans: JSON.stringify(['ENTERPRISE']) },
    { id: 'ff_04', key: 'supplier_portal', name: 'Supplier Self-Service Portal', description: 'Supplier login, payment status, invoice submission', isEnabled: true, plans: JSON.stringify(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']) },
    { id: 'ff_05', key: 'ai_copilot', name: 'AI Copilot', description: 'Natural language AP assistant', isEnabled: true, plans: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']) },
    { id: 'ff_06', key: 'multi_currency', name: 'Multi-Currency Support', description: 'Process invoices in multiple currencies', isEnabled: true, plans: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']) },
    { id: 'ff_07', key: 'advanced_analytics', name: 'Advanced Analytics', description: 'AI-powered spend analytics and anomaly detection', isEnabled: false, plans: JSON.stringify(['ENTERPRISE']) },
    { id: 'ff_08', key: 'two_factor_auth', name: 'Two-Factor Authentication', description: 'TOTP-based 2FA for user login', isEnabled: true, plans: JSON.stringify(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']) },
  ];

  for (const ff of featureFlagsData) {
    await prisma.featureFlag.create({ data: ff });
  }
  console.log(`    Created ${featureFlagsData.length} feature flags`);

  // ─── 16. Tenant Branding ────────────────────────────────────
  console.log('[17/18] Creating tenant branding...');

  await prisma.tenantBranding.create({
    data: {
      id: 'tb_01',
      tenantId: tenantAcme.id,
      logoUrl: '/logos/acme-corp.svg',
      primaryColor: '#165DFF',
      secondaryColor: '#8E51DA',
      accentColor: '#23C343',
      companyName: 'Acme Corporation',
      emailHeader: '<div style="background:#165DFF;color:white;padding:20px;text-align:center"><h1>Acme Corp</h1></div>',
      emailFooter: '<div style="text-align:center;color:#666;padding:10px"><p>Acme Corp - AP Department</p></div>',
    },
  });

  await prisma.tenantBranding.create({
    data: {
      id: 'tb_02',
      tenantId: tenantStartup.id,
      logoUrl: '/logos/startupco.svg',
      primaryColor: '#FF7D00',
      secondaryColor: '#6B4EFF',
      accentColor: '#00B42A',
      companyName: 'StartupCo Inc.',
      emailHeader: '<div style="background:#FF7D00;color:white;padding:20px;text-align:center"><h1>StartupCo</h1></div>',
      emailFooter: '<div style="text-align:center;color:#666;padding:10px"><p>StartupCo Inc.</p></div>',
    },
  });
  console.log('    Created 2 tenant branding configurations');

  // ─── 17. Cash Flow Forecasts ────────────────────────────────
  console.log('[18/18] Creating cash flow forecasts...');

  const cashFlowData = [
    { id: 'cf_01', tenantId: tenantAcme.id, forecastDate: daysFromNow(7), expectedInflow: 125000, expectedOutflow: 85000, netPosition: 40000, confidence: 0.92 },
    { id: 'cf_02', tenantId: tenantAcme.id, forecastDate: daysFromNow(14), expectedInflow: 98000, expectedOutflow: 110000, netPosition: -12000, confidence: 0.87 },
    { id: 'cf_03', tenantId: tenantAcme.id, forecastDate: daysFromNow(21), expectedInflow: 145000, expectedOutflow: 72000, netPosition: 73000, confidence: 0.81 },
    { id: 'cf_04', tenantId: tenantAcme.id, forecastDate: daysFromNow(28), expectedInflow: 110000, expectedOutflow: 95000, netPosition: 15000, confidence: 0.75 },
    { id: 'cf_05', tenantId: tenantStartup.id, forecastDate: daysFromNow(7), expectedInflow: 18000, expectedOutflow: 22000, netPosition: -4000, confidence: 0.78 },
    { id: 'cf_06', tenantId: tenantStartup.id, forecastDate: daysFromNow(14), expectedInflow: 25000, expectedOutflow: 15000, netPosition: 10000, confidence: 0.72 },
    { id: 'cf_07', tenantId: tenantStartup.id, forecastDate: daysFromNow(21), expectedInflow: 30000, expectedOutflow: 28000, netPosition: 2000, confidence: 0.65 },
    { id: 'cf_08', tenantId: tenantStartup.id, forecastDate: daysFromNow(28), expectedInflow: 22000, expectedOutflow: 20000, netPosition: 2000, confidence: 0.60 },
  ];

  for (const cf of cashFlowData) {
    await prisma.cashFlowForecast.create({ data: cf });
  }
  console.log(`    Created ${cashFlowData.length} cash flow forecasts`);

  // ─── Summary ────────────────────────────────────────────────
  console.log('');
  console.log('=== Seeding Complete ===');
  console.log('');
  console.log('  Demo credentials:');
  console.log('  - sarah.chen@acme-corp.com / password123 (ADMIN, Acme Corp)');
  console.log('  - lisa.nguyen@startupco.com / password123 (ADMIN, StartupCo)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
