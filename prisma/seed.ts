import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Hash a password using Web Crypto API (SHA-256).
 * In production you'd use bcrypt/scrypt/argon2, but for seeding
 * this provides a deterministic hash without external deps.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function uuid(): string {
  return crypto.randomUUID()
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

// ─── Main seed function ───────────────────────────────────────

async function main() {
  console.log('Start seeding ...')
  const passwordHash = await hashPassword('password123')

  // ─── 0. Clean existing data (idempotent) ──────────────────────
  console.log('  Cleaning existing data...')
  await prisma.webhookDelivery.deleteMany()
  await prisma.webhook.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.session.deleteMany()
  await prisma.supplierUser.deleteMany()
  await prisma.featureFlag.deleteMany()
  await prisma.monetizationLog.deleteMany()
  await prisma.conversationMessage.deleteMany()
  await prisma.supplierConversation.deleteMany()
  await prisma.cashFlowForecast.deleteMany()
  await prisma.syncLog.deleteMany()
  await prisma.eRPConnection.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.paymentTransaction.deleteMany()
  await prisma.paymentBatch.deleteMany()
  await prisma.approvalStep.deleteMany()
  await prisma.approvalWorkflow.deleteMany()
  await prisma.pOMatchResult.deleteMany()
  await prisma.complianceLog.deleteMany()
  await prisma.agentDecision.deleteMany()
  await prisma.riskAlert.deleteMany()
  await prisma.report.deleteMany()
  await prisma.expensePolicy.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.virtualCard.deleteMany()
  await prisma.sCFProgram.deleteMany()
  await prisma.tradingPartner.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()
  console.log('  Done cleaning.')

  // ─── 1. Tenants ─────────────────────────────────────────────────
  console.log('  Creating tenants...')
  const tenantAcme = await prisma.tenant.create({
    data: {
      id: 'tenant_acme',
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'PROFESSIONAL',
      isActive: true,
      branding: JSON.stringify({
        logoUrl: '/logos/acme.svg',
        primaryColor: '#165DFF',
        companyName: 'Acme Corporation',
      }),
      settings: JSON.stringify({
        locale: 'en-US',
        timezone: 'America/New_York',
        defaultCurrency: 'USD',
        approvalThreshold: 5000,
        touchlessEnabled: true,
      }),
    },
  })

  const tenantGlobal = await prisma.tenant.create({
    data: {
      id: 'tenant_global',
      name: 'Global Inc',
      slug: 'global-inc',
      plan: 'ENTERPRISE',
      isActive: true,
      branding: JSON.stringify({
        logoUrl: '/logos/global.svg',
        primaryColor: '#00B42A',
        companyName: 'Global Industries Inc.',
      }),
      settings: JSON.stringify({
        locale: 'en-GB',
        timezone: 'Europe/London',
        defaultCurrency: 'GBP',
        approvalThreshold: 10000,
        touchlessEnabled: true,
        multiCurrency: true,
      }),
    },
  })

  const tenantStartup = await prisma.tenant.create({
    data: {
      id: 'tenant_startup',
      name: 'StartupXYZ',
      slug: 'startupxyz',
      plan: 'STARTER',
      isActive: true,
      branding: JSON.stringify({
        logoUrl: '/logos/startupxyz.svg',
        primaryColor: '#FF7D00',
        companyName: 'StartupXYZ Ltd.',
      }),
      settings: JSON.stringify({
        locale: 'en-US',
        timezone: 'America/Los_Angeles',
        defaultCurrency: 'USD',
        approvalThreshold: 1000,
        touchlessEnabled: false,
      }),
    },
  })

  console.log(`  Created tenants: ${tenantAcme.name}, ${tenantGlobal.name}, ${tenantStartup.name}`)

  // ─── 2. Users (8 across tenants) ───────────────────────────────
  console.log('  Creating users...')

  // Acme Corp users
  const userAcmeAdmin = await prisma.user.create({
    data: {
      id: 'user_acme_admin',
      email: 'sarah.chen@acme.com',
      name: 'Sarah Chen',
      role: 'ADMIN',
      tenantId: tenantAcme.id,
      passwordHash,
      emailVerified: true,
      preferences: JSON.stringify({ theme: 'light', notifications: true, dashboardLayout: 'compact' }),
    },
  })

  const userAcmeApprover = await prisma.user.create({
    data: {
      id: 'user_acme_approver',
      email: 'james.rodriguez@acme.com',
      name: 'James Rodriguez',
      role: 'APPROVER',
      tenantId: tenantAcme.id,
      passwordHash,
      emailVerified: true,
      preferences: JSON.stringify({ theme: 'dark', notifications: true }),
    },
  })

  const userAcmeClerk = await prisma.user.create({
    data: {
      id: 'user_acme_clerk',
      email: 'emily.watson@acme.com',
      name: 'Emily Watson',
      role: 'AP_CLERK',
      tenantId: tenantAcme.id,
      passwordHash,
      emailVerified: true,
      preferences: JSON.stringify({ theme: 'light', notifications: true }),
    },
  })

  const userAcmeViewer = await prisma.user.create({
    data: {
      id: 'user_acme_viewer',
      email: 'michael.park@acme.com',
      name: 'Michael Park',
      role: 'VIEWER',
      tenantId: tenantAcme.id,
      passwordHash,
      emailVerified: true,
    },
  })

  // Global Inc users
  const userGlobalAdmin = await prisma.user.create({
    data: {
      id: 'user_global_admin',
      email: 'anna.schmidt@global.com',
      name: 'Anna Schmidt',
      role: 'ADMIN',
      tenantId: tenantGlobal.id,
      passwordHash,
      emailVerified: true,
      preferences: JSON.stringify({ theme: 'light', notifications: true, locale: 'en-GB' }),
    },
  })

  const userGlobalApprover = await prisma.user.create({
    data: {
      id: 'user_global_approver',
      email: 'tom.wilson@global.com',
      name: 'Tom Wilson',
      role: 'APPROVER',
      tenantId: tenantGlobal.id,
      passwordHash,
      emailVerified: true,
    },
  })

  // StartupXYZ users
  const userStartupAdmin = await prisma.user.create({
    data: {
      id: 'user_startup_admin',
      email: 'lisa.nguyen@startupxyz.com',
      name: 'Lisa Nguyen',
      role: 'ADMIN',
      tenantId: tenantStartup.id,
      passwordHash,
      emailVerified: true,
      preferences: JSON.stringify({ theme: 'dark', notifications: true }),
    },
  })

  const userStartupClerk = await prisma.user.create({
    data: {
      id: 'user_startup_clerk',
      email: 'david.kim@startupxyz.com',
      name: 'David Kim',
      role: 'AP_CLERK',
      tenantId: tenantStartup.id,
      passwordHash,
      emailVerified: true,
    },
  })

  console.log('  Created 8 users across 3 tenants')

  // ─── 3. Trading Partners (20) ──────────────────────────────────
  console.log('  Creating trading partners...')

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
    { id: 'tp_11', name: 'Pinnacle Steel Works', taxId: 'US-11-1111111', email: 'ar@pinnacleSteel.com', category: 'MANUFACTURING', riskScore: 35, discountTerms: '2/10 net 60', paymentTerms: 'NET_60', address: '3000 Steel Ave, Pittsburgh, PA 15201', phone: '+1-412-555-1100', complianceStatus: 'non_compliant' },
    { id: 'tp_12', name: 'Summit Marketing Agency', taxId: 'US-22-2222222', email: 'billing@summitagency.com', category: 'PROFESSIONAL_SERVICES', riskScore: 14, discountTerms: null, paymentTerms: 'NET_30', address: '1500 Media Blvd, Los Angeles, CA 90028', phone: '+1-323-555-1200', complianceStatus: 'compliant' },
    { id: 'tp_13', name: 'Nordic Tech AB', taxId: 'SE-556677-8899', email: 'faktura@nordictech.se', category: 'IT_SERVICES', riskScore: 9, discountTerms: '1/10 net 30', paymentTerms: 'NET_30', address: 'Storgatan 10, Stockholm, Sweden', phone: '+46-8-555-1300', complianceStatus: 'compliant' },
    { id: 'tp_14', name: 'Thames Office Solutions', taxId: 'GB-123456789', email: 'invoices@thamesoffice.co.uk', category: 'OFFICE_SUPPLIES', riskScore: 11, discountTerms: null, paymentTerms: 'NET_30', address: '20 Oxford St, London W1D 1AP, UK', phone: '+44-20-555-1400', complianceStatus: 'compliant' },
    { id: 'tp_15', name: 'Midwest Packaging Co', taxId: 'US-33-3333333', email: 'ap@midwestpack.com', category: 'MANUFACTURING', riskScore: 20, discountTerms: '2/10 net 30', paymentTerms: 'NET_30', address: '600 Pack Dr, Columbus, OH 43215', phone: '+1-614-555-1500', complianceStatus: 'compliant' },
    { id: 'tp_16', name: 'Atlas Insurance Brokers', taxId: 'US-44-4444444', email: 'billing@atlasinsurance.com', category: 'PROFESSIONAL_SERVICES', riskScore: 6, discountTerms: null, paymentTerms: 'NET_45', address: '250 Finance Pl, Hartford, CT 06103', phone: '+1-860-555-1600', complianceStatus: 'compliant' },
    { id: 'tp_17', name: 'GreenPower Electric', taxId: 'US-55-5555555', email: 'ar@greenpower.com', category: 'MANUFACTURING', riskScore: 17, discountTerms: '3/15 net 45', paymentTerms: 'NET_45', address: '880 Energy Way, Denver, CO 80202', phone: '+1-303-555-1700', complianceStatus: 'compliant' },
    { id: 'tp_18', name: 'SecureNet Cybersecurity', taxId: 'US-66-6666666', email: 'finance@securenet.com', category: 'IT_SERVICES', riskScore: 4, discountTerms: null, paymentTerms: 'NET_30', address: '700 Firewall Dr, McLean, VA 22102', phone: '+1-703-555-1800', complianceStatus: 'compliant' },
    { id: 'tp_19', name: 'Metro Catering Services', taxId: 'US-77-7777777', email: 'invoices@metrocatering.com', category: 'OFFICE_SUPPLIES', riskScore: 13, discountTerms: '1/10 net 15', paymentTerms: 'NET_15', address: '150 Food Ct, Miami, FL 33101', phone: '+1-305-555-1900', complianceStatus: 'compliant' },
    { id: 'tp_20', name: 'Pacific Freight Lines', taxId: 'US-88-8888888', email: 'ap@pacificfreight.com', category: 'LOGISTICS', riskScore: 28, discountTerms: '2/10 net 30', paymentTerms: 'NET_30', address: '2200 Harbor Blvd, Oakland, CA 94607', phone: '+1-510-555-2000', complianceStatus: 'pending' },
  ]

  const partners: Record<string, { id: string }> = {}
  for (const p of partnersData) {
    const partner = await prisma.tradingPartner.create({ data: p })
    partners[p.id] = partner
  }
  console.log(`  Created ${partnersData.length} trading partners`)

  // ─── 4. Invoices (50) ──────────────────────────────────────────
  console.log('  Creating invoices...')

  const invoiceStatuses = [
    'ingested', 'extracted', 'compliance_checked', 'classified',
    'matched', 'approved', 'paid', 'rejected', 'flagged_for_review',
  ]
  const sourceTypes = ['email', 'upload', 'api', 'network']
  const paymentMethods = ['ACH', 'WIRE', 'VIRTUAL_CARD', 'CHECK', 'SEPA', 'BACS']
  const currencies = ['USD', 'USD', 'USD', 'EUR', 'GBP', 'SEK'] // weighted toward USD
  const costCenters = ['CC-100', 'CC-200', 'CC-300', 'CC-400', 'CC-500']
  const glCodes = ['6000-OPEX', '6100-IT', '6200-TRAVEL', '6300-OFFICE', '6400-PROF-SVC', '6500-LOGISTICS']

  type InvoiceData = {
    id: string
    tenantId: string
    sourceType: string
    status: string
    invoiceNumber: string
    invoiceDate: Date
    dueDate: Date
    vendorName: string
    totalAmount: number
    subtotalAmount: number
    taxAmount: number
    currency: string
    poNumber: string | null
    costCenter: string
    glCode: string
    description: string
    paymentMethod: string | null
    aiConfidence: number
    processingTimeMs: number
    partnerId: string
    discountApplied: number
  }

  const invoicesData: InvoiceData[] = []

  for (let i = 0; i < 50; i++) {
    const status = invoiceStatuses[i % invoiceStatuses.length]
    const partnerIdx = i % 20
    const partnerId = partnersData[partnerIdx].id
    const subtotal = Math.round((500 + Math.random() * 49500) * 100) / 100
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const total = Math.round((subtotal + tax) * 100) / 100
    const tenantId = i < 25 ? tenantAcme.id : i < 40 ? tenantGlobal.id : tenantStartup.id
    const currency = i < 25 ? 'USD' : i < 40 ? currencies[i % currencies.length] : 'USD'

    invoicesData.push({
      id: `inv_${String(i + 1).padStart(3, '0')}`,
      tenantId,
      sourceType: sourceTypes[i % sourceTypes.length],
      status,
      invoiceNumber: `INV-2025-${String(i + 1001).padStart(5, '0')}`,
      invoiceDate: daysAgo(Math.floor(Math.random() * 90)),
      dueDate: daysFromNow(Math.floor(Math.random() * 60)),
      vendorName: partnersData[partnerIdx].name,
      totalAmount: total,
      subtotalAmount: subtotal,
      taxAmount: tax,
      currency,
      poNumber: i % 3 === 0 ? `PO-${String(i + 1).padStart(4, '0')}` : null,
      costCenter: costCenters[i % costCenters.length],
      glCode: glCodes[i % glCodes.length],
      description: `Invoice for ${partnersData[partnerIdx].category?.toLowerCase().replace(/_/g, ' ')} services`,
      paymentMethod: status === 'paid' ? paymentMethods[i % paymentMethods.length] : null,
      aiConfidence: Math.round((0.75 + Math.random() * 0.25) * 100) / 100,
      processingTimeMs: Math.floor(500 + Math.random() * 4500),
      partnerId,
      discountApplied: i % 5 === 0 ? Math.round(total * 0.02 * 100) / 100 : 0,
    })
  }

  for (const inv of invoicesData) {
    await prisma.invoice.create({ data: inv })
  }
  console.log(`  Created ${invoicesData.length} invoices`)

  // ─── 5. Purchase Orders (10) ───────────────────────────────────
  console.log('  Creating purchase orders...')

  const poStatuses = ['DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED']

  const purchaseOrdersData = [
    { id: 'po_01', poNumber: 'PO-2025-0001', supplierId: 'tp_01', tenantId: tenantAcme.id, totalAmount: 15000, status: 'APPROVED', description: 'IT infrastructure upgrade Q1', lineItems: JSON.stringify([{ item: 'Server rack', qty: 2, unitPrice: 5000 }, { item: 'Network switch', qty: 5, unitPrice: 1000 }]) },
    { id: 'po_02', poNumber: 'PO-2025-0002', supplierId: 'tp_02', tenantId: tenantAcme.id, totalAmount: 3200, status: 'RECEIVED', description: 'Office supplies Q1 order', lineItems: JSON.stringify([{ item: 'Paper (case)', qty: 50, unitPrice: 40 }, { item: 'Toner cartridge', qty: 20, unitPrice: 60 }]) },
    { id: 'po_03', poNumber: 'PO-2025-0003', supplierId: 'tp_03', tenantId: tenantAcme.id, totalAmount: 75000, status: 'APPROVED', description: 'Consulting engagement - process optimization', lineItems: JSON.stringify([{ item: 'Senior consultant (hours)', qty: 500, unitPrice: 150 }]) },
    { id: 'po_04', poNumber: 'PO-2025-0004', supplierId: 'tp_04', tenantId: tenantAcme.id, totalAmount: 8500, status: 'PARTIALLY_RECEIVED', description: 'Warehouse shipping services', lineItems: JSON.stringify([{ item: 'Domestic freight', qty: 100, unitPrice: 50 }, { item: 'International freight', qty: 10, unitPrice: 350 }]) },
    { id: 'po_05', poNumber: 'PO-2025-0005', supplierId: 'tp_05', tenantId: tenantGlobal.id, totalAmount: 125000, status: 'APPROVED', description: 'Custom machined parts for production line', lineItems: JSON.stringify([{ item: 'Machined housing', qty: 500, unitPrice: 250 }]) },
    { id: 'po_06', poNumber: 'PO-2025-0006', supplierId: 'tp_06', tenantId: tenantGlobal.id, totalAmount: 24000, status: 'CLOSED', description: 'Cloud hosting annual contract', lineItems: JSON.stringify([{ item: 'Cloud hosting (monthly)', qty: 12, unitPrice: 2000 }]) },
    { id: 'po_07', poNumber: 'PO-2025-0007', supplierId: 'tp_13', tenantId: tenantGlobal.id, totalAmount: 45000, currency: 'SEK', status: 'APPROVED', description: 'Software development services', lineItems: JSON.stringify([{ item: 'Development sprint', qty: 9, unitPrice: 5000 }]) },
    { id: 'po_08', poNumber: 'PO-2025-0008', supplierId: 'tp_14', tenantId: tenantGlobal.id, totalAmount: 5600, currency: 'GBP', status: 'RECEIVED', description: 'London office supplies', lineItems: JSON.stringify([{ item: 'Furniture set', qty: 4, unitPrice: 1400 }]) },
    { id: 'po_09', poNumber: 'PO-2025-0009', supplierId: 'tp_18', tenantId: tenantStartup.id, totalAmount: 18000, status: 'APPROVED', description: 'Cybersecurity audit and tools', lineItems: JSON.stringify([{ item: 'Pen test', qty: 1, unitPrice: 8000 }, { item: 'License (annual)', qty: 2, unitPrice: 5000 }]) },
    { id: 'po_10', poNumber: 'PO-2025-0010', supplierId: 'tp_08', tenantId: tenantStartup.id, totalAmount: 2400, status: 'DRAFT', description: 'Office cleaning services Q2', lineItems: JSON.stringify([{ item: 'Monthly cleaning', qty: 6, unitPrice: 400 }]) },
  ]

  for (const po of purchaseOrdersData) {
    await prisma.purchaseOrder.create({ data: po })
  }
  console.log(`  Created ${purchaseOrdersData.length} purchase orders`)

  // ─── 6. Approval Workflows & Steps (15 workflows, ~30 steps) ──
  console.log('  Creating approval workflows and steps...')

  const workflowsData = [
    { id: 'wf_01', name: 'Standard Invoice Approval', description: 'Default workflow for invoices under $5,000', tenantId: tenantAcme.id, rules: JSON.stringify({ maxAmount: 5000, autoApprove: true, requiredApprovers: 1 }), isActive: true },
    { id: 'wf_02', name: 'High Value Approval', description: 'Two-step approval for invoices over $5,000', tenantId: tenantAcme.id, rules: JSON.stringify({ minAmount: 5000, autoApprove: false, requiredApprovers: 2 }), isActive: true },
    { id: 'wf_03', name: 'Emergency Payment', description: 'Fast-track approval for urgent payments', tenantId: tenantAcme.id, rules: JSON.stringify({ priority: 'URGENT', autoApprove: false, requiredApprovers: 1, escalateAfterHours: 4 }), isActive: true },
    { id: 'wf_04', name: 'New Vendor Approval', description: 'Additional scrutiny for first-time vendor invoices', tenantId: tenantAcme.id, rules: JSON.stringify({ newVendor: true, autoApprove: false, requiredApprovers: 2, complianceCheck: true }), isActive: true },
    { id: 'wf_05', name: 'Auto-Approve Small', description: 'Touchless processing for invoices under $500', tenantId: tenantAcme.id, rules: JSON.stringify({ maxAmount: 500, autoApprove: true, requiredApprovers: 0 }), isActive: true },
    { id: 'wf_06', name: 'EU Compliance Workflow', description: 'GDPR and EU regulatory compliance checks', tenantId: tenantGlobal.id, rules: JSON.stringify({ region: 'EU', complianceCheck: true, requiredApprovers: 2 }), isActive: true },
    { id: 'wf_07', name: 'Multi-Currency Approval', description: 'Additional FX review for non-base currency', tenantId: tenantGlobal.id, rules: JSON.stringify({ multiCurrency: true, fxReview: true, requiredApprovers: 2 }), isActive: true },
    { id: 'wf_08', name: 'Enterprise Standard', description: 'Standard approval for Global Inc', tenantId: tenantGlobal.id, rules: JSON.stringify({ maxAmount: 10000, autoApprove: false, requiredApprovers: 1 }), isActive: true },
    { id: 'wf_09', name: 'Executive Approval', description: 'C-suite approval for large expenditures', tenantId: tenantGlobal.id, rules: JSON.stringify({ minAmount: 50000, autoApprove: false, requiredApprovers: 3, escalateToExec: true }), isActive: true },
    { id: 'wf_10', name: 'Startup Standard', description: 'Simple approval for StartupXYZ', tenantId: tenantStartup.id, rules: JSON.stringify({ maxAmount: 1000, autoApprove: false, requiredApprovers: 1 }), isActive: true },
    { id: 'wf_11', name: 'Startup High Value', description: 'Founder approval required over $1,000', tenantId: tenantStartup.id, rules: JSON.stringify({ minAmount: 1000, autoApprove: false, requiredApprovers: 1, founderApproval: true }), isActive: true },
    { id: 'wf_12', name: 'PO Match Workflow', description: 'Auto-approve when PO match is exact', tenantId: tenantAcme.id, rules: JSON.stringify({ poMatch: true, tolerancePercent: 5, autoApprove: true }), isActive: true },
    { id: 'wf_13', name: 'Contract-Based Approval', description: 'Auto-approve if within contract terms', tenantId: tenantGlobal.id, rules: JSON.stringify({ contractMatch: true, autoApprove: true }), isActive: true },
    { id: 'wf_14', name: 'Risk-Based Review', description: 'Additional review for high-risk vendors', tenantId: tenantAcme.id, rules: JSON.stringify({ riskScoreThreshold: 20, requiredApprovers: 2, complianceCheck: true }), isActive: true },
    { id: 'wf_15', name: 'Recurring Payment', description: 'Streamlined for recurring vendor payments', tenantId: tenantAcme.id, rules: JSON.stringify({ recurring: true, autoApprove: true, requiredApprovers: 0 }), isActive: false },
  ]

  for (const wf of workflowsData) {
    await prisma.approvalWorkflow.create({ data: wf })
  }

  // Create approval steps linked to invoices and workflows
  const approvalStepsData = [
    { id: 'as_01', workflowId: 'wf_01', invoiceId: 'inv_001', stepOrder: 1, approverId: userAcmeApprover.id, status: 'APPROVED', comments: 'Looks good, approved.', approvedAt: daysAgo(5) },
    { id: 'as_02', workflowId: 'wf_02', invoiceId: 'inv_002', stepOrder: 1, approverId: userAcmeApprover.id, status: 'APPROVED', comments: 'First approval complete.', approvedAt: daysAgo(4) },
    { id: 'as_03', workflowId: 'wf_02', invoiceId: 'inv_002', stepOrder: 2, approverId: userAcmeAdmin.id, status: 'APPROVED', comments: 'Second approval. Released for payment.', approvedAt: daysAgo(3) },
    { id: 'as_04', workflowId: 'wf_01', invoiceId: 'inv_003', stepOrder: 1, approverId: userAcmeApprover.id, status: 'PENDING', comments: null, approvedAt: null },
    { id: 'as_05', workflowId: 'wf_03', invoiceId: 'inv_004', stepOrder: 1, approverId: userAcmeAdmin.id, status: 'APPROVED', comments: 'Emergency payment approved.', approvedAt: daysAgo(1) },
    { id: 'as_06', workflowId: 'wf_04', invoiceId: 'inv_005', stepOrder: 1, approverId: userAcmeApprover.id, status: 'REJECTED', comments: 'New vendor not verified. Rejecting.', approvedAt: null },
    { id: 'as_07', workflowId: 'wf_06', invoiceId: 'inv_026', stepOrder: 1, approverId: userGlobalApprover.id, status: 'APPROVED', comments: 'EU compliance verified.', approvedAt: daysAgo(7) },
    { id: 'as_08', workflowId: 'wf_06', invoiceId: 'inv_026', stepOrder: 2, approverId: userGlobalAdmin.id, status: 'APPROVED', comments: 'Final approval.', approvedAt: daysAgo(6) },
    { id: 'as_09', workflowId: 'wf_07', invoiceId: 'inv_027', stepOrder: 1, approverId: userGlobalApprover.id, status: 'PENDING', comments: null, approvedAt: null },
    { id: 'as_10', workflowId: 'wf_08', invoiceId: 'inv_028', stepOrder: 1, approverId: userGlobalAdmin.id, status: 'APPROVED', comments: 'Standard approval complete.', approvedAt: daysAgo(2) },
    { id: 'as_11', workflowId: 'wf_10', invoiceId: 'inv_041', stepOrder: 1, approverId: userStartupAdmin.id, status: 'APPROVED', comments: 'Approved for processing.', approvedAt: daysAgo(3) },
    { id: 'as_12', workflowId: 'wf_11', invoiceId: 'inv_042', stepOrder: 1, approverId: userStartupAdmin.id, status: 'PENDING', comments: null, approvedAt: null },
    { id: 'as_13', workflowId: 'wf_14', invoiceId: 'inv_010', stepOrder: 1, approverId: userAcmeApprover.id, status: 'APPROVED', comments: 'Risk reviewed and approved.', approvedAt: daysAgo(10) },
    { id: 'as_14', workflowId: 'wf_14', invoiceId: 'inv_010', stepOrder: 2, approverId: userAcmeAdmin.id, status: 'APPROVED', comments: 'Compliance check passed.', approvedAt: daysAgo(9) },
    { id: 'as_15', workflowId: 'wf_12', invoiceId: 'inv_015', stepOrder: 1, approverId: null, status: 'SKIPPED', comments: 'Auto-approved: PO match within tolerance.', approvedAt: daysAgo(8) },
  ]

  for (const step of approvalStepsData) {
    await prisma.approvalStep.create({ data: step })
  }
  console.log(`  Created ${workflowsData.length} approval workflows with ${approvalStepsData.length} steps`)

  // ─── 7. Contracts (5) ──────────────────────────────────────────
  console.log('  Creating contracts...')

  const contractsData = [
    { id: 'ct_01', tenantId: tenantAcme.id, supplierId: 'tp_01', title: 'IT Infrastructure Maintenance Agreement', value: 120000, startDate: daysAgo(180), endDate: daysFromNow(185), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ sla: '99.9%', supportHours: '24/7', penaltyRate: 0.5 }), documentUrl: '/docs/contracts/ct_01.pdf' },
    { id: 'ct_02', tenantId: tenantAcme.id, supplierId: 'tp_03', title: 'Strategic Consulting Framework', value: 500000, startDate: daysAgo(90), endDate: daysFromNow(275), status: 'ACTIVE', autoRenew: false, terms: JSON.stringify({ rateCard: { senior: 250, principal: 400 }, travelCap: 15000 }), documentUrl: '/docs/contracts/ct_02.pdf' },
    { id: 'ct_03', tenantId: tenantGlobal.id, supplierId: 'tp_06', title: 'Cloud Hosting Service Agreement', value: 288000, currency: 'USD', startDate: daysAgo(365), endDate: daysFromNow(0), status: 'EXPIRING', autoRenew: true, terms: JSON.stringify({ tier: 'Enterprise', storage: '10TB', compute: '1000vCPU' }), documentUrl: '/docs/contracts/ct_03.pdf' },
    { id: 'ct_04', tenantId: tenantGlobal.id, supplierId: 'tp_13', title: 'Software Development Outsourcing', value: 360000, currency: 'SEK', startDate: daysAgo(60), endDate: daysFromNow(305), status: 'ACTIVE', autoRenew: false, terms: JSON.stringify({ teamSize: 6, sprintDuration: '2 weeks', deliveryModel: 'agile' }), documentUrl: '/docs/contracts/ct_04.pdf' },
    { id: 'ct_05', tenantId: tenantStartup.id, supplierId: 'tp_18', title: 'Cybersecurity Assessment & Monitoring', value: 36000, startDate: daysAgo(30), endDate: daysFromNow(335), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ scope: 'full-stack', frequency: 'quarterly', responseTime: '1 hour' }), documentUrl: '/docs/contracts/ct_05.pdf' },
  ]

  for (const ct of contractsData) {
    await prisma.contract.create({ data: ct })
  }
  console.log(`  Created ${contractsData.length} contracts`)

  // ─── 8. Payment Batches & Transactions (5 batches) ─────────────
  console.log('  Creating payment batches and transactions...')

  const batchesData = [
    { id: 'pb_01', tenantId: tenantAcme.id, totalAmount: 35000, paymentCount: 4, status: 'COMPLETED', method: 'ACH', processedAt: daysAgo(5) },
    { id: 'pb_02', tenantId: tenantAcme.id, totalAmount: 12500, paymentCount: 3, status: 'PROCESSING', method: 'WIRE', processedAt: null },
    { id: 'pb_03', tenantId: tenantGlobal.id, totalAmount: 87000, paymentCount: 5, status: 'COMPLETED', method: 'SEPA', processedAt: daysAgo(3) },
    { id: 'pb_04', tenantId: tenantGlobal.id, totalAmount: 22000, paymentCount: 2, status: 'PENDING', method: 'WIRE', processedAt: null },
    { id: 'pb_05', tenantId: tenantStartup.id, totalAmount: 8500, paymentCount: 3, status: 'COMPLETED', method: 'ACH', processedAt: daysAgo(1) },
  ]

  for (const batch of batchesData) {
    await prisma.paymentBatch.create({ data: batch })
  }

  // Create transactions linked to batches and invoices
  const txnsData = [
    // Batch 1 (Acme, completed ACH)
    { id: 'ptx_01', batchId: 'pb_01', invoiceId: 'inv_007', amount: 8500, status: 'COMPLETED', reference: 'ACH-REF-001', processedAt: daysAgo(5) },
    { id: 'ptx_02', batchId: 'pb_01', invoiceId: 'inv_016', amount: 12000, status: 'COMPLETED', reference: 'ACH-REF-002', processedAt: daysAgo(5) },
    { id: 'ptx_03', batchId: 'pb_01', invoiceId: 'inv_025', amount: 6500, status: 'COMPLETED', reference: 'ACH-REF-003', processedAt: daysAgo(5) },
    { id: 'ptx_04', batchId: 'pb_01', invoiceId: 'inv_006', amount: 8000, status: 'COMPLETED', reference: 'ACH-REF-004', processedAt: daysAgo(5) },
    // Batch 2 (Acme, processing WIRE)
    { id: 'ptx_05', batchId: 'pb_02', invoiceId: 'inv_001', amount: 4500, status: 'PROCESSING', reference: 'WIRE-REF-001', processedAt: null },
    { id: 'ptx_06', batchId: 'pb_02', invoiceId: 'inv_010', amount: 3000, status: 'PROCESSING', reference: 'WIRE-REF-002', processedAt: null },
    { id: 'ptx_07', batchId: 'pb_02', invoiceId: 'inv_019', amount: 5000, status: 'PROCESSING', reference: 'WIRE-REF-003', processedAt: null },
    // Batch 3 (Global, completed SEPA)
    { id: 'ptx_08', batchId: 'pb_03', invoiceId: 'inv_026', amount: 18000, status: 'COMPLETED', reference: 'SEPA-REF-001', processedAt: daysAgo(3) },
    { id: 'ptx_09', batchId: 'pb_03', invoiceId: 'inv_027', amount: 25000, status: 'COMPLETED', reference: 'SEPA-REF-002', processedAt: daysAgo(3) },
    { id: 'ptx_10', batchId: 'pb_03', invoiceId: 'inv_028', amount: 14000, status: 'COMPLETED', reference: 'SEPA-REF-003', processedAt: daysAgo(3) },
    { id: 'ptx_11', batchId: 'pb_03', invoiceId: 'inv_029', amount: 22000, status: 'COMPLETED', reference: 'SEPA-REF-004', processedAt: daysAgo(3) },
    { id: 'ptx_12', batchId: 'pb_03', invoiceId: 'inv_030', amount: 8000, status: 'COMPLETED', reference: 'SEPA-REF-005', processedAt: daysAgo(3) },
    // Batch 4 (Global, pending WIRE)
    { id: 'ptx_13', batchId: 'pb_04', invoiceId: 'inv_031', amount: 12000, status: 'PENDING', reference: null, processedAt: null },
    { id: 'ptx_14', batchId: 'pb_04', invoiceId: 'inv_032', amount: 10000, status: 'PENDING', reference: null, processedAt: null },
    // Batch 5 (Startup, completed ACH)
    { id: 'ptx_15', batchId: 'pb_05', invoiceId: 'inv_041', amount: 3000, status: 'COMPLETED', reference: 'ACH-REF-010', processedAt: daysAgo(1) },
    { id: 'ptx_16', batchId: 'pb_05', invoiceId: 'inv_042', amount: 2500, status: 'COMPLETED', reference: 'ACH-REF-011', processedAt: daysAgo(1) },
    { id: 'ptx_17', batchId: 'pb_05', invoiceId: 'inv_043', amount: 3000, status: 'COMPLETED', reference: 'ACH-REF-012', processedAt: daysAgo(1) },
  ]

  for (const txn of txnsData) {
    await prisma.paymentTransaction.create({ data: txn })
  }
  console.log(`  Created ${batchesData.length} payment batches with ${txnsData.length} transactions`)

  // ─── 9. Expenses (10) ──────────────────────────────────────────
  console.log('  Creating expenses...')

  const expensesData = [
    { id: 'exp_01', userId: userAcmeClerk.id, tenantId: tenantAcme.id, category: 'TRAVEL', amount: 450.00, receiptUrl: '/receipts/exp_01.jpg', status: 'APPROVED', description: 'Client visit - flight to Chicago', merchant: 'United Airlines', project: 'Client Onboarding', costCenter: 'CC-200', expenseDate: daysAgo(15), submittedAt: daysAgo(14), approvedAt: daysAgo(12) },
    { id: 'exp_02', userId: userAcmeClerk.id, tenantId: tenantAcme.id, category: 'MEALS', amount: 85.50, receiptUrl: '/receipts/exp_02.jpg', status: 'APPROVED', description: 'Team lunch - quarterly review', merchant: 'The Capital Grille', project: null, costCenter: 'CC-100', expenseDate: daysAgo(10), submittedAt: daysAgo(9), approvedAt: daysAgo(7) },
    { id: 'exp_03', userId: userAcmeAdmin.id, tenantId: tenantAcme.id, category: 'SOFTWARE', amount: 299.00, receiptUrl: '/receipts/exp_03.jpg', status: 'REIMBURSED', description: 'Annual Figma license', merchant: 'Figma Inc', project: null, costCenter: 'CC-300', expenseDate: daysAgo(30), submittedAt: daysAgo(29), approvedAt: daysAgo(25) },
    { id: 'exp_04', userId: userAcmeApprover.id, tenantId: tenantAcme.id, category: 'TRAVEL', amount: 1250.00, receiptUrl: '/receipts/exp_04.jpg', status: 'SUBMITTED', description: 'Conference attendance - AP World', merchant: 'Marriott Hotels', project: 'Professional Development', costCenter: 'CC-200', expenseDate: daysAgo(5), submittedAt: daysAgo(4), approvedAt: null },
    { id: 'exp_05', userId: userAcmeViewer.id, tenantId: tenantAcme.id, category: 'OFFICE', amount: 156.75, receiptUrl: '/receipts/exp_05.jpg', status: 'DRAFT', description: 'Ergonomic keyboard and mouse', merchant: 'Amazon', project: null, costCenter: 'CC-100', expenseDate: daysAgo(2), submittedAt: null, approvedAt: null },
    { id: 'exp_06', userId: userGlobalAdmin.id, tenantId: tenantGlobal.id, category: 'TRAVEL', amount: 2100.00, currency: 'GBP', receiptUrl: '/receipts/exp_06.jpg', status: 'APPROVED', description: 'Client visit to Frankfurt office', merchant: 'British Airways', project: 'EU Expansion', costCenter: 'CC-200', expenseDate: daysAgo(20), submittedAt: daysAgo(19), approvedAt: daysAgo(17) },
    { id: 'exp_07', userId: userGlobalApprover.id, tenantId: tenantGlobal.id, category: 'EQUIPMENT', amount: 3500.00, currency: 'GBP', receiptUrl: '/receipts/exp_07.jpg', status: 'SUBMITTED', description: 'Presentation equipment for boardroom', merchant: 'Currys', project: 'Office Upgrade', costCenter: 'CC-400', expenseDate: daysAgo(8), submittedAt: daysAgo(7), approvedAt: null },
    { id: 'exp_08', userId: userStartupAdmin.id, tenantId: tenantStartup.id, category: 'SOFTWARE', amount: 499.00, receiptUrl: '/receipts/exp_08.jpg', status: 'APPROVED', description: 'GitHub Team annual subscription', merchant: 'GitHub', project: null, costCenter: 'CC-300', expenseDate: daysAgo(45), submittedAt: daysAgo(44), approvedAt: daysAgo(43) },
    { id: 'exp_09', userId: userStartupClerk.id, tenantId: tenantStartup.id, category: 'MEALS', amount: 62.00, receiptUrl: '/receipts/exp_09.jpg', status: 'REJECTED', description: 'Team dinner - over policy limit', merchant: 'Nobu Restaurant', project: null, costCenter: 'CC-100', expenseDate: daysAgo(12), submittedAt: daysAgo(11), approvedAt: null },
    { id: 'exp_10', userId: userStartupAdmin.id, tenantId: tenantStartup.id, category: 'OTHER', amount: 175.00, receiptUrl: '/receipts/exp_10.jpg', status: 'SUBMITTED', description: 'Co-working space day pass', merchant: 'WeWork', project: 'Remote Work', costCenter: 'CC-500', expenseDate: daysAgo(3), submittedAt: daysAgo(2), approvedAt: null },
  ]

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp })
  }
  console.log(`  Created ${expensesData.length} expenses`)

  // ─── 10. Audit Logs (20) ───────────────────────────────────────
  console.log('  Creating audit logs...')

  const auditLogsData = [
    { id: 'al_01', tenantId: tenantAcme.id, userId: userAcmeAdmin.id, action: 'LOGIN', entityType: 'User', entityId: userAcmeAdmin.id, details: JSON.stringify({ method: 'password', success: true }), ipAddress: '192.168.1.100', timestamp: daysAgo(1) },
    { id: 'al_02', tenantId: tenantAcme.id, userId: userAcmeAdmin.id, action: 'CONFIGURED', entityType: 'Setting', entityId: tenantAcme.id, details: JSON.stringify({ changed: ['approvalThreshold'], oldValue: 3000, newValue: 5000 }), ipAddress: '192.168.1.100', timestamp: daysAgo(1) },
    { id: 'al_03', tenantId: tenantAcme.id, userId: userAcmeClerk.id, action: 'CREATED', entityType: 'Invoice', entityId: 'inv_001', details: JSON.stringify({ source: 'upload', fileName: 'invoice_001.pdf' }), ipAddress: '192.168.1.105', timestamp: daysAgo(10) },
    { id: 'al_04', tenantId: tenantAcme.id, userId: userAcmeApprover.id, action: 'APPROVED', entityType: 'Invoice', entityId: 'inv_001', details: JSON.stringify({ workflowId: 'wf_01', stepId: 'as_01' }), ipAddress: '192.168.1.110', timestamp: daysAgo(5) },
    { id: 'al_05', tenantId: tenantAcme.id, userId: userAcmeApprover.id, action: 'REJECTED', entityType: 'Invoice', entityId: 'inv_005', details: JSON.stringify({ reason: 'New vendor not verified', workflowId: 'wf_04' }), ipAddress: '192.168.1.110', timestamp: daysAgo(4) },
    { id: 'al_06', tenantId: tenantAcme.id, userId: userAcmeAdmin.id, action: 'CREATED', entityType: 'Supplier', entityId: 'tp_01', details: JSON.stringify({ name: 'TechStar Solutions' }), ipAddress: '192.168.1.100', timestamp: daysAgo(30) },
    { id: 'al_07', tenantId: tenantAcme.id, userId: userAcmeAdmin.id, action: 'EXPORT', entityType: 'Report', entityId: 'rpt_01', details: JSON.stringify({ format: 'CSV', reportType: 'SPEND_ANALYSIS', rows: 150 }), ipAddress: '192.168.1.100', timestamp: daysAgo(3) },
    { id: 'al_08', tenantId: tenantAcme.id, userId: null, action: 'CREATED', entityType: 'Payment', entityId: 'pb_01', details: JSON.stringify({ method: 'ACH', totalAmount: 35000, invoiceCount: 4 }), ipAddress: null, timestamp: daysAgo(5) },
    { id: 'al_09', tenantId: tenantAcme.id, userId: userAcmeAdmin.id, action: 'UPDATED', entityType: 'User', entityId: userAcmeClerk.id, details: JSON.stringify({ changed: ['role'], oldValue: 'VIEWER', newValue: 'AP_CLERK' }), ipAddress: '192.168.1.100', timestamp: daysAgo(20) },
    { id: 'al_10', tenantId: tenantAcme.id, userId: userAcmeClerk.id, action: 'CREATED', entityType: 'Invoice', entityId: 'inv_015', details: JSON.stringify({ source: 'email', parsedBy: 'ai-agent' }), ipAddress: '192.168.1.105', timestamp: daysAgo(8) },
    { id: 'al_11', tenantId: tenantGlobal.id, userId: userGlobalAdmin.id, action: 'LOGIN', entityType: 'User', entityId: userGlobalAdmin.id, details: JSON.stringify({ method: 'sso', provider: 'azure-ad' }), ipAddress: '10.0.0.50', timestamp: daysAgo(1) },
    { id: 'al_12', tenantId: tenantGlobal.id, userId: userGlobalAdmin.id, action: 'CONFIGURED', entityType: 'Setting', entityId: tenantGlobal.id, details: JSON.stringify({ changed: ['multiCurrency'], enabled: true }), ipAddress: '10.0.0.50', timestamp: daysAgo(15) },
    { id: 'al_13', tenantId: tenantGlobal.id, userId: userGlobalApprover.id, action: 'APPROVED', entityType: 'Invoice', entityId: 'inv_026', details: JSON.stringify({ workflowId: 'wf_06', complianceVerified: true }), ipAddress: '10.0.0.55', timestamp: daysAgo(7) },
    { id: 'al_14', tenantId: tenantGlobal.id, userId: userGlobalAdmin.id, action: 'APPROVED', entityType: 'Invoice', entityId: 'inv_026', details: JSON.stringify({ workflowId: 'wf_06', finalApproval: true }), ipAddress: '10.0.0.50', timestamp: daysAgo(6) },
    { id: 'al_15', tenantId: tenantGlobal.id, userId: userGlobalAdmin.id, action: 'CREATED', entityType: 'Approval', entityId: 'wf_06', details: JSON.stringify({ workflowName: 'EU Compliance Workflow' }), ipAddress: '10.0.0.50', timestamp: daysAgo(30) },
    { id: 'al_16', tenantId: tenantGlobal.id, userId: null, action: 'CREATED', entityType: 'Payment', entityId: 'pb_03', details: JSON.stringify({ method: 'SEPA', totalAmount: 87000, invoiceCount: 5 }), ipAddress: null, timestamp: daysAgo(3) },
    { id: 'al_17', tenantId: tenantStartup.id, userId: userStartupAdmin.id, action: 'LOGIN', entityType: 'User', entityId: userStartupAdmin.id, details: JSON.stringify({ method: 'password', success: true }), ipAddress: '172.16.0.10', timestamp: daysAgo(1) },
    { id: 'al_18', tenantId: tenantStartup.id, userId: userStartupAdmin.id, action: 'APPROVED', entityType: 'Invoice', entityId: 'inv_041', details: JSON.stringify({ workflowId: 'wf_10' }), ipAddress: '172.16.0.10', timestamp: daysAgo(3) },
    { id: 'al_19', tenantId: tenantStartup.id, userId: userStartupAdmin.id, action: 'DELETED', entityType: 'Invoice', entityId: 'inv_050', details: JSON.stringify({ reason: 'Duplicate entry' }), ipAddress: '172.16.0.10', timestamp: daysAgo(2) },
    { id: 'al_20', tenantId: tenantStartup.id, userId: userStartupClerk.id, action: 'CREATED', entityType: 'Invoice', entityId: 'inv_045', details: JSON.stringify({ source: 'upload' }), ipAddress: '172.16.0.15', timestamp: daysAgo(5) },
  ]

  for (const log of auditLogsData) {
    await prisma.auditLog.create({ data: log })
  }
  console.log(`  Created ${auditLogsData.length} audit logs`)

  // ─── 11. Risk Alerts (5) ───────────────────────────────────────
  console.log('  Creating risk alerts...')

  const riskAlertsData = [
    { id: 'ra_01', tenantId: tenantAcme.id, invoiceId: 'inv_005', riskType: 'DUPLICATE', severity: 'HIGH', description: 'Potential duplicate invoice detected - similar amount and vendor within 7 days', status: 'OPEN', details: JSON.stringify({ matchedInvoiceId: 'inv_004', similarityScore: 0.92, amountDifference: 0 }), detectedAt: daysAgo(4) },
    { id: 'ra_02', tenantId: tenantAcme.id, invoiceId: 'inv_008', riskType: 'FRAUD', severity: 'CRITICAL', description: 'Vendor bank account changed just before payment - potential BEC fraud', status: 'INVESTIGATING', details: JSON.stringify({ previousBank: 'Chase', newBank: 'Unknown Bank', changeDate: daysAgo(2).toISOString() }), detectedAt: daysAgo(2) },
    { id: 'ra_03', tenantId: tenantAcme.id, invoiceId: 'inv_012', riskType: 'ANOMALY', severity: 'MEDIUM', description: 'Invoice amount 3x higher than average for this vendor', status: 'OPEN', details: JSON.stringify({ averageAmount: 5000, invoiceAmount: 15000, standardDeviations: 3.2 }), detectedAt: daysAgo(6) },
    { id: 'ra_04', tenantId: tenantGlobal.id, invoiceId: 'inv_030', riskType: 'COMPLIANCE', severity: 'HIGH', description: 'Missing VAT registration number for EU cross-border transaction', status: 'OPEN', details: JSON.stringify({ requiredField: 'vatNumber', regulation: 'EU VAT Directive', country: 'DE' }), detectedAt: daysAgo(3) },
    { id: 'ra_05', tenantId: tenantStartup.id, invoiceId: 'inv_045', riskType: 'ANOMALY', severity: 'LOW', description: 'Unusual payment terms requested by vendor - NET_7 instead of NET_30', status: 'RESOLVED', details: JSON.stringify({ requestedTerms: 'NET_7', standardTerms: 'NET_30', reason: 'Year-end cash flow' }), detectedAt: daysAgo(10), resolvedAt: daysAgo(8) },
  ]

  for (const ra of riskAlertsData) {
    await prisma.riskAlert.create({ data: ra })
  }
  console.log(`  Created ${riskAlertsData.length} risk alerts`)

  // ─── 12. ERP Connections (3) ───────────────────────────────────
  console.log('  Creating ERP connections...')

  const erpConnectionsData = [
    { id: 'erp_01', tenantId: tenantAcme.id, erpType: 'SAP', name: 'SAP S/4HANA Production', status: 'ACTIVE', config: JSON.stringify({ host: 'sap.acme.internal', client: '100', systemId: 'PRD', encrypted: true }), lastSyncAt: daysAgo(0) },
    { id: 'erp_02', tenantId: tenantGlobal.id, erpType: 'ORACLE', name: 'Oracle EBS R12', status: 'ACTIVE', config: JSON.stringify({ host: 'oracle.global.internal', instance: 'PROD', module: 'AP', encrypted: true }), lastSyncAt: daysAgo(1) },
    { id: 'erp_03', tenantId: tenantStartup.id, erpType: 'QUICKBOOKS', name: 'QuickBooks Online', status: 'ACTIVE', config: JSON.stringify({ realmId: 'qb-12345', environment: 'production', encrypted: true }), lastSyncAt: daysAgo(0) },
  ]

  for (const erp of erpConnectionsData) {
    await prisma.eRPConnection.create({ data: erp })
  }
  console.log(`  Created ${erpConnectionsData.length} ERP connections`)

  // ─── 13. Feature Flags (5) ─────────────────────────────────────
  console.log('  Creating feature flags...')

  const featureFlagsData = [
    { id: 'ff_01', key: 'dynamic_discounting', name: 'Dynamic Discounting', description: 'Enable dynamic early-payment discounts based on vendor terms and cash position', isEnabled: true, tenantOverrides: JSON.stringify({ [tenantStartup.id]: false }), planRequirement: 'PROFESSIONAL' },
    { id: 'ff_02', key: 'virtual_cards', name: 'Virtual Card Payments', description: 'Generate single-use virtual cards for vendor payments to earn rebates', isEnabled: true, tenantOverrides: null, planRequirement: 'PROFESSIONAL' },
    { id: 'ff_03', key: 'scf', name: 'Supply Chain Finance', description: 'Enable supply chain financing programs with third-party funders', isEnabled: false, tenantOverrides: JSON.stringify({ [tenantGlobal.id]: true }), planRequirement: 'ENTERPRISE' },
    { id: 'ff_04', key: 'supplier_portal', name: 'Supplier Self-Service Portal', description: 'Allow suppliers to log in, view payment status, and submit invoices', isEnabled: true, tenantOverrides: null, planRequirement: 'STARTER' },
    { id: 'ff_05', key: 'ai_copilot', name: 'AI Copilot', description: 'Natural language assistant for AP operations, analytics, and workflow automation', isEnabled: true, tenantOverrides: JSON.stringify({ [tenantStartup.id]: false }), planRequirement: 'PROFESSIONAL' },
  ]

  for (const ff of featureFlagsData) {
    await prisma.featureFlag.create({ data: ff })
  }
  console.log(`  Created ${featureFlagsData.length} feature flags`)

  // ─── 14. Cash Flow Forecasts (8) ──────────────────────────────
  console.log('  Creating cash flow forecasts...')

  const cashFlowData = [
    { id: 'cf_01', tenantId: tenantAcme.id, forecastDate: daysFromNow(7), expectedInflow: 125000, expectedOutflow: 85000, netPosition: 40000, confidence: 0.92 },
    { id: 'cf_02', tenantId: tenantAcme.id, forecastDate: daysFromNow(14), expectedInflow: 98000, expectedOutflow: 110000, netPosition: -12000, confidence: 0.87 },
    { id: 'cf_03', tenantId: tenantAcme.id, forecastDate: daysFromNow(21), expectedInflow: 145000, expectedOutflow: 72000, netPosition: 73000, confidence: 0.81 },
    { id: 'cf_04', tenantId: tenantGlobal.id, forecastDate: daysFromNow(7), expectedInflow: 340000, expectedOutflow: 280000, netPosition: 60000, confidence: 0.94 },
    { id: 'cf_05', tenantId: tenantGlobal.id, forecastDate: daysFromNow(14), expectedInflow: 290000, expectedOutflow: 310000, netPosition: -20000, confidence: 0.88 },
    { id: 'cf_06', tenantId: tenantGlobal.id, forecastDate: daysFromNow(21), expectedInflow: 380000, expectedOutflow: 250000, netPosition: 130000, confidence: 0.82 },
    { id: 'cf_07', tenantId: tenantStartup.id, forecastDate: daysFromNow(7), expectedInflow: 18000, expectedOutflow: 22000, netPosition: -4000, confidence: 0.78 },
    { id: 'cf_08', tenantId: tenantStartup.id, forecastDate: daysFromNow(14), expectedInflow: 25000, expectedOutflow: 15000, netPosition: 10000, confidence: 0.72 },
  ]

  for (const cf of cashFlowData) {
    await prisma.cashFlowForecast.create({ data: cf })
  }
  console.log(`  Created ${cashFlowData.length} cash flow forecasts`)

  // ─── 15. Reports (3) ───────────────────────────────────────────
  console.log('  Creating reports...')

  const reportsData = [
    { id: 'rpt_01', tenantId: tenantAcme.id, name: 'Monthly Spend Analysis', type: 'SPEND_ANALYSIS', config: JSON.stringify({ dateRange: 'last_30_days', groupBy: ['vendor', 'category'], includeForecasts: true }), schedule: JSON.stringify({ cron: '0 8 1 * *', enabled: true, recipients: ['sarah.chen@acme.com'] }), lastRunAt: daysAgo(2) },
    { id: 'rpt_02', tenantId: tenantGlobal.id, name: 'Quarterly Compliance Report', type: 'COMPLIANCE', config: JSON.stringify({ dateRange: 'last_90_days', regions: ['EU', 'UK'], includeVAT: true }), schedule: JSON.stringify({ cron: '0 9 1 1,4,7,10 *', enabled: true, recipients: ['anna.schmidt@global.com', 'tom.wilson@global.com'] }), lastRunAt: daysAgo(30) },
    { id: 'rpt_03', tenantId: tenantStartup.id, name: 'Cash Flow Dashboard', type: 'CASH_FLOW', config: JSON.stringify({ dateRange: 'next_30_days', includeForecasts: true, alerts: true }), schedule: JSON.stringify({ cron: '0 7 * * 1', enabled: true, recipients: ['lisa.nguyen@startupxyz.com'] }), lastRunAt: daysAgo(5) },
  ]

  for (const rpt of reportsData) {
    await prisma.report.create({ data: rpt })
  }
  console.log(`  Created ${reportsData.length} reports`)

  // ─── 16. Supplier Users (for supplier portal) ─────────────────
  console.log('  Creating supplier users...')

  const supplierUsersData = [
    { id: 'su_01', supplierId: 'tp_01', email: 'portal@techstar.com', name: 'Alex Turner', passwordHash, isActive: true, lastLoginAt: daysAgo(2) },
    { id: 'su_02', supplierId: 'tp_03', email: 'portal@deloitte.com', name: 'Maria Santos', passwordHash, isActive: true, lastLoginAt: daysAgo(5) },
    { id: 'su_03', supplierId: 'tp_06', email: 'portal@cloudvault.io', name: 'Chris Lee', passwordHash, isActive: true, lastLoginAt: null },
    { id: 'su_04', supplierId: 'tp_13', email: 'portal@nordictech.se', name: 'Erik Johansson', passwordHash, isActive: true, lastLoginAt: daysAgo(1) },
    { id: 'su_05', supplierId: 'tp_18', email: 'portal@securenet.com', name: 'Priya Patel', passwordHash, isActive: false, lastLoginAt: daysAgo(30) },
  ]

  for (const su of supplierUsersData) {
    await prisma.supplierUser.create({ data: su })
  }
  console.log(`  Created ${supplierUsersData.length} supplier users`)

  // ─── Done ──────────────────────────────────────────────────────
  console.log('')
  console.log('Seeding complete!')
  console.log('  Summary:')
  console.log('  - 3 tenants (Acme Corp, Global Inc, StartupXYZ)')
  console.log('  - 8 users across tenants')
  console.log('  - 20 trading partners')
  console.log('  - 50 invoices')
  console.log('  - 10 purchase orders')
  console.log('  - 15 approval workflows + 15 steps')
  console.log('  - 5 contracts')
  console.log('  - 5 payment batches + 17 transactions')
  console.log('  - 10 expenses')
  console.log('  - 20 audit logs')
  console.log('  - 5 risk alerts')
  console.log('  - 3 ERP connections')
  console.log('  - 5 feature flags')
  console.log('  - 8 cash flow forecasts')
  console.log('  - 3 reports')
  console.log('  - 5 supplier users')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
