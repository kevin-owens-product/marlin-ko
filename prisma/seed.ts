
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding ...')

    // ─── 0. Clean existing data (idempotent) ──────────────────────
    console.log('  Cleaning existing data...')
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

    // ─── 1. Create Tenant ───────────────────────────────────────────
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Medius Demo Corp',
            slug: 'medius-demo',
            plan: 'PROFESSIONAL',
            settings: JSON.stringify({
                locale: 'en-US',
                timezone: 'America/New_York',
                defaultCurrency: 'USD',
                approvalThreshold: 5000,
                touchlessEnabled: true,
            }),
        },
    })
    console.log(`  Created tenant: ${tenant.name}`)

    // ─── 2. Create Users ────────────────────────────────────────────
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@medius-demo.com',
            name: 'Sarah Chen',
            role: 'ADMIN',
            tenantId: tenant.id,
            preferences: JSON.stringify({ theme: 'light', notifications: true }),
        },
    })

    const approverUser = await prisma.user.create({
        data: {
            email: 'approver@medius-demo.com',
            name: 'James Rodriguez',
            role: 'APPROVER',
            tenantId: tenant.id,
            preferences: JSON.stringify({ theme: 'dark', notifications: true }),
        },
    })

    const apClerkUser = await prisma.user.create({
        data: {
            email: 'clerk@medius-demo.com',
            name: 'Emily Watson',
            role: 'AP_CLERK',
            tenantId: tenant.id,
            preferences: JSON.stringify({ theme: 'light', notifications: true }),
        },
    })

    const viewerUser = await prisma.user.create({
        data: {
            email: 'viewer@medius-demo.com',
            name: 'Michael Park',
            role: 'VIEWER',
            tenantId: tenant.id,
        },
    })
    const controllerUser = await prisma.user.create({
        data: {
            email: 'controller@medius-demo.com',
            name: 'Linda Thompson',
            role: 'CONTROLLER',
            tenantId: tenant.id,
            preferences: JSON.stringify({ theme: 'light', notifications: true }),
        },
    })

    const analystUser = await prisma.user.create({
        data: {
            email: 'analyst@medius-demo.com',
            name: 'David Kim',
            role: 'ANALYST',
            tenantId: tenant.id,
            preferences: JSON.stringify({ theme: 'dark', notifications: false }),
        },
    })
    console.log(`  Created ${6} users`)

    // ─── 3. Create Trading Partners ─────────────────────────────────
    const acme = await prisma.tradingPartner.create({
        data: {
            name: 'Acme Corp',
            taxId: 'US-99-123456',
            email: 'billing@acme.com',
            category: 'IT_SERVICES',
            riskScore: 10,
            discountTerms: '2/10 net 30',
            paymentTerms: 'NET_30',
            address: '100 Innovation Drive, San Francisco, CA 94105',
            complianceStatus: 'compliant',
        },
    })

    const globalLogistics = await prisma.tradingPartner.create({
        data: {
            name: 'Global Logistics',
            taxId: 'GB-8832-11',
            email: 'accounts@globallogistics.co.uk',
            category: 'LOGISTICS',
            riskScore: 5,
            discountTerms: 'Net 45',
            paymentTerms: 'NET_45',
            address: '22 Dock Street, London, E1 8JP',
            complianceStatus: 'compliant',
        },
    })

    const officeSupplies = await prisma.tradingPartner.create({
        data: {
            name: 'Office Supplies Co',
            taxId: 'US-55-987654',
            email: 'invoices@officesupplies.com',
            category: 'OFFICE_SUPPLIES',
            riskScore: 85,
            discountTerms: 'Immediate',
            paymentTerms: 'NET_15',
            complianceStatus: 'non_compliant',
        },
    })

    const techConsulting = await prisma.tradingPartner.create({
        data: {
            name: 'TechPro Consulting',
            taxId: 'US-77-445566',
            email: 'finance@techpro.io',
            category: 'PROFESSIONAL_SERVICES',
            riskScore: 15,
            discountTerms: '1/15 net 60',
            paymentTerms: 'NET_60',
            address: '555 Market Street, Suite 300, San Francisco, CA 94105',
            complianceStatus: 'compliant',
        },
    })
    // Additional trading partners
    const cloudInfra = await prisma.tradingPartner.create({
        data: { name: 'CloudInfra Solutions', taxId: 'US-44-112233', email: 'billing@cloudinfra.com', category: 'IT_SERVICES', riskScore: 8, discountTerms: '2/10 net 30', paymentTerms: 'NET_30', address: '200 Cloud Ave, Seattle, WA 98101', complianceStatus: 'compliant' },
    })
    const greenEnergy = await prisma.tradingPartner.create({
        data: { name: 'Green Energy Partners', taxId: 'DE-293847561', email: 'finance@greenenergy.de', category: 'UTILITIES', riskScore: 12, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: 'Energiestraße 15, Berlin 10115', complianceStatus: 'compliant' },
    })
    const nordicDesign = await prisma.tradingPartner.create({
        data: { name: 'Nordic Design Studio', taxId: 'SE-556677-0012', email: 'invoices@nordicdesign.se', category: 'PROFESSIONAL_SERVICES', riskScore: 5, discountTerms: 'Net 45', paymentTerms: 'NET_45', address: 'Designgatan 8, Stockholm 11120', complianceStatus: 'compliant' },
    })
    const rapidFleet = await prisma.tradingPartner.create({
        data: { name: 'Rapid Fleet Management', taxId: 'US-33-445566', email: 'accounts@rapidfleet.com', category: 'LOGISTICS', riskScore: 22, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: '500 Transport Blvd, Dallas, TX 75201', complianceStatus: 'compliant' },
    })
    const primeManufacturing = await prisma.tradingPartner.create({
        data: { name: 'Prime Manufacturing Ltd', taxId: 'GB-9921-33', email: 'ap@primemanufacturing.co.uk', category: 'MANUFACTURING', riskScore: 18, discountTerms: '1/10 net 45', paymentTerms: 'NET_45', address: '12 Industrial Park, Birmingham B1 2AA', complianceStatus: 'compliant' },
    })
    const safeGuardSec = await prisma.tradingPartner.create({
        data: { name: 'SafeGuard Security', taxId: 'US-88-776655', email: 'billing@safeguardsec.com', category: 'FACILITIES', riskScore: 30, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: '1200 Security Lane, Chicago, IL 60601', complianceStatus: 'pending_review' },
    })
    const dataCoreAnalytics = await prisma.tradingPartner.create({
        data: { name: 'DataCore Analytics', taxId: 'US-22-334455', email: 'finance@datacore.ai', category: 'IT_SERVICES', riskScore: 7, discountTerms: '2/15 net 60', paymentTerms: 'NET_60', address: '800 Data Drive, Austin, TX 73301', complianceStatus: 'compliant' },
    })
    const euroPackaging = await prisma.tradingPartner.create({
        data: { name: 'Euro Packaging GmbH', taxId: 'DE-198765432', email: 'rechnungen@europack.de', category: 'PACKAGING', riskScore: 14, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: 'Verpackungsweg 22, Munich 80331', complianceStatus: 'compliant' },
    })
    const alphaLegal = await prisma.tradingPartner.create({
        data: { name: 'Alpha Legal Services', taxId: 'US-66-998877', email: 'billing@alphalegal.com', category: 'LEGAL', riskScore: 3, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: '300 Law Center, New York, NY 10001', complianceStatus: 'compliant' },
    })
    const freshFoodSupply = await prisma.tradingPartner.create({
        data: { name: 'Fresh Food Supply Co', taxId: 'US-11-223344', email: 'orders@freshfood.com', category: 'CATERING', riskScore: 45, discountTerms: 'Net 15', paymentTerms: 'NET_15', address: '50 Market Street, Portland, OR 97201', complianceStatus: 'non_compliant' },
    })
    const mediTech = await prisma.tradingPartner.create({
        data: { name: 'MediTech Instruments', taxId: 'US-77-556677', email: 'sales@meditech.com', category: 'MEDICAL_SUPPLIES', riskScore: 9, discountTerms: 'Net 60', paymentTerms: 'NET_60', address: '900 Health Ave, Boston, MA 02101', complianceStatus: 'compliant' },
    })
    const quantumResearch = await prisma.tradingPartner.create({
        data: { name: 'Quantum Research Labs', taxId: 'US-99-887766', email: 'finance@quantumresearch.com', category: 'R_AND_D', riskScore: 11, discountTerms: '1/10 net 30', paymentTerms: 'NET_30', address: '1500 Innovation Pkwy, San Jose, CA 95110', complianceStatus: 'compliant' },
    })
    const swiftCourier = await prisma.tradingPartner.create({
        data: { name: 'Swift Courier Services', taxId: 'US-44-556677', email: 'dispatch@swiftcourier.com', category: 'LOGISTICS', riskScore: 28, discountTerms: 'Immediate', paymentTerms: 'NET_15', complianceStatus: 'pending_review' },
    })
    const proClean = await prisma.tradingPartner.create({
        data: { name: 'ProClean Facilities', taxId: 'US-55-667788', email: 'invoices@proclean.com', category: 'FACILITIES', riskScore: 35, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: '400 Clean St, Denver, CO 80201', complianceStatus: 'compliant' },
    })
    const digitalMarketPro = await prisma.tradingPartner.create({
        data: { name: 'Digital Market Pro', taxId: 'US-33-998877', email: 'billing@digitalmktpro.com', category: 'MARKETING', riskScore: 16, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: '650 Ads Blvd, Los Angeles, CA 90001', complianceStatus: 'compliant' },
    })
    const titanSteel = await prisma.tradingPartner.create({
        data: { name: 'Titan Steel Works', taxId: 'US-88-112233', email: 'accounts@titansteel.com', category: 'RAW_MATERIALS', riskScore: 20, discountTerms: '2/10 net 45', paymentTerms: 'NET_45', address: '1800 Steel Way, Pittsburgh, PA 15201', complianceStatus: 'compliant' },
    })
    const insightHR = await prisma.tradingPartner.create({
        data: { name: 'Insight HR Solutions', taxId: 'US-22-665544', email: 'billing@insighthr.com', category: 'HR_SERVICES', riskScore: 6, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: '700 People Ave, Charlotte, NC 28201', complianceStatus: 'compliant' },
    })
    const azureTelecom = await prisma.tradingPartner.create({
        data: { name: 'Azure Telecom', taxId: 'FR-44556677899', email: 'facturation@azuretelecom.fr', category: 'TELECOM', riskScore: 10, discountTerms: 'Net 30', paymentTerms: 'NET_30', address: '25 Rue des Télécoms, Paris 75008', complianceStatus: 'compliant' },
    })
    console.log(`  Created ${22} trading partners`)

    // ─── 4. Create Purchase Orders ──────────────────────────────────
    const po1 = await prisma.purchaseOrder.create({
        data: {
            poNumber: 'PO-2024-001',
            supplierId: acme.id,
            tenantId: tenant.id,
            totalAmount: 15000.00,
            currency: 'USD',
            status: 'APPROVED',
            description: 'Annual software license renewal',
            lineItems: JSON.stringify([
                { description: 'Enterprise License - Annual', quantity: 1, unitPrice: 12000, totalAmount: 12000 },
                { description: 'Premium Support Package', quantity: 1, unitPrice: 3000, totalAmount: 3000 },
            ]),
        },
    })

    const po2 = await prisma.purchaseOrder.create({
        data: {
            poNumber: 'PO-2024-002',
            supplierId: globalLogistics.id,
            tenantId: tenant.id,
            totalAmount: 8500.00,
            currency: 'GBP',
            status: 'PARTIALLY_RECEIVED',
            description: 'Q1 shipping services',
            lineItems: JSON.stringify([
                { description: 'Standard Freight - January', quantity: 10, unitPrice: 350, totalAmount: 3500 },
                { description: 'Standard Freight - February', quantity: 10, unitPrice: 250, totalAmount: 2500 },
                { description: 'Express Freight - Q1', quantity: 5, unitPrice: 500, totalAmount: 2500 },
            ]),
        },
    })

    const po3 = await prisma.purchaseOrder.create({
        data: {
            poNumber: 'PO-2024-003',
            supplierId: techConsulting.id,
            tenantId: tenant.id,
            totalAmount: 45000.00,
            currency: 'USD',
            status: 'APPROVED',
            description: 'Cloud migration consulting engagement',
            lineItems: JSON.stringify([
                { description: 'Senior Consultant - 200 hrs', quantity: 200, unitPrice: 175, totalAmount: 35000 },
                { description: 'Project Manager - 50 hrs', quantity: 50, unitPrice: 200, totalAmount: 10000 },
            ]),
        },
    })
    // Additional POs
    const po4 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-004', supplierId: cloudInfra.id, tenantId: tenant.id, totalAmount: 24000.00, currency: 'USD', status: 'APPROVED', description: 'Cloud hosting services Q1-Q2', lineItems: JSON.stringify([{ description: 'AWS hosting - 6 months', quantity: 6, unitPrice: 4000, totalAmount: 24000 }]) } })
    const po5 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-005', supplierId: greenEnergy.id, tenantId: tenant.id, totalAmount: 18000.00, currency: 'EUR', status: 'APPROVED', description: 'Renewable energy certificates', lineItems: JSON.stringify([{ description: 'Green certificates - Annual', quantity: 12, unitPrice: 1500, totalAmount: 18000 }]) } })
    const po6 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-006', supplierId: nordicDesign.id, tenantId: tenant.id, totalAmount: 35000.00, currency: 'SEK', status: 'DRAFT', description: 'Brand redesign project', lineItems: JSON.stringify([{ description: 'Logo redesign', quantity: 1, unitPrice: 15000, totalAmount: 15000 }, { description: 'Brand guidelines', quantity: 1, unitPrice: 20000, totalAmount: 20000 }]) } })
    const po7 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-007', supplierId: rapidFleet.id, tenantId: tenant.id, totalAmount: 52000.00, currency: 'USD', status: 'APPROVED', description: 'Vehicle fleet lease - annual', lineItems: JSON.stringify([{ description: 'Sedan lease x10', quantity: 10, unitPrice: 4000, totalAmount: 40000 }, { description: 'SUV lease x2', quantity: 2, unitPrice: 6000, totalAmount: 12000 }]) } })
    const po8 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-008', supplierId: primeManufacturing.id, tenantId: tenant.id, totalAmount: 78000.00, currency: 'GBP', status: 'PARTIALLY_RECEIVED', description: 'Custom parts manufacturing', lineItems: JSON.stringify([{ description: 'Widget A - 1000 units', quantity: 1000, unitPrice: 45, totalAmount: 45000 }, { description: 'Widget B - 500 units', quantity: 500, unitPrice: 66, totalAmount: 33000 }]) } })
    const po9 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-009', supplierId: safeGuardSec.id, tenantId: tenant.id, totalAmount: 36000.00, currency: 'USD', status: 'APPROVED', description: 'Annual security services', lineItems: JSON.stringify([{ description: 'On-site security - 12 months', quantity: 12, unitPrice: 3000, totalAmount: 36000 }]) } })
    const po10 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-010', supplierId: dataCoreAnalytics.id, tenantId: tenant.id, totalAmount: 42000.00, currency: 'USD', status: 'APPROVED', description: 'Data analytics platform license', lineItems: JSON.stringify([{ description: 'Enterprise license - annual', quantity: 1, unitPrice: 36000, totalAmount: 36000 }, { description: 'Training package', quantity: 1, unitPrice: 6000, totalAmount: 6000 }]) } })
    const po11 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-011', supplierId: euroPackaging.id, tenantId: tenant.id, totalAmount: 15500.00, currency: 'EUR', status: 'APPROVED', description: 'Packaging supplies Q2', lineItems: JSON.stringify([{ description: 'Boxes - 5000 units', quantity: 5000, unitPrice: 2.1, totalAmount: 10500 }, { description: 'Bubble wrap rolls', quantity: 100, unitPrice: 50, totalAmount: 5000 }]) } })
    const po12 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-012', supplierId: alphaLegal.id, tenantId: tenant.id, totalAmount: 25000.00, currency: 'USD', status: 'PENDING', description: 'Legal retainer - H2', lineItems: JSON.stringify([{ description: 'Legal retainer - 6 months', quantity: 6, unitPrice: 4166.67, totalAmount: 25000 }]) } })
    const po13 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-013', supplierId: mediTech.id, tenantId: tenant.id, totalAmount: 8900.00, currency: 'USD', status: 'APPROVED', description: 'Lab equipment maintenance', lineItems: JSON.stringify([{ description: 'Calibration service', quantity: 5, unitPrice: 1200, totalAmount: 6000 }, { description: 'Replacement parts', quantity: 1, unitPrice: 2900, totalAmount: 2900 }]) } })
    const po14 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-014', supplierId: quantumResearch.id, tenantId: tenant.id, totalAmount: 120000.00, currency: 'USD', status: 'APPROVED', description: 'Research partnership - Phase 1', lineItems: JSON.stringify([{ description: 'Research services - 6 months', quantity: 6, unitPrice: 20000, totalAmount: 120000 }]) } })
    const po15 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-015', supplierId: digitalMarketPro.id, tenantId: tenant.id, totalAmount: 18500.00, currency: 'USD', status: 'APPROVED', description: 'Digital marketing campaign Q3', lineItems: JSON.stringify([{ description: 'Social media ads', quantity: 1, unitPrice: 10000, totalAmount: 10000 }, { description: 'SEO optimization', quantity: 1, unitPrice: 8500, totalAmount: 8500 }]) } })
    const po16 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-016', supplierId: titanSteel.id, tenantId: tenant.id, totalAmount: 95000.00, currency: 'USD', status: 'PARTIALLY_RECEIVED', description: 'Raw steel supply - annual', lineItems: JSON.stringify([{ description: 'Steel plate - 50 tons', quantity: 50, unitPrice: 1500, totalAmount: 75000 }, { description: 'Steel rod - 20 tons', quantity: 20, unitPrice: 1000, totalAmount: 20000 }]) } })
    const po17 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-017', supplierId: insightHR.id, tenantId: tenant.id, totalAmount: 22000.00, currency: 'USD', status: 'APPROVED', description: 'HR consulting engagement', lineItems: JSON.stringify([{ description: 'Compensation benchmarking', quantity: 1, unitPrice: 12000, totalAmount: 12000 }, { description: 'Org design workshop', quantity: 1, unitPrice: 10000, totalAmount: 10000 }]) } })
    const po18 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-2024-018', supplierId: azureTelecom.id, tenantId: tenant.id, totalAmount: 9600.00, currency: 'EUR', status: 'APPROVED', description: 'Telecom services - annual', lineItems: JSON.stringify([{ description: 'VOIP service - 12 months', quantity: 12, unitPrice: 800, totalAmount: 9600 }]) } })
    console.log(`  Created ${18} purchase orders`)

    // ─── 5. Create Invoices ─────────────────────────────────────────

    // Invoice 1: Clean, processed, low risk
    const inv1 = await prisma.invoice.create({
        data: {
            tenantId: tenant.id,
            sourceType: 'email',
            status: 'approved',
            invoiceNumber: 'INV-2024-001',
            vendorName: acme.name,
            totalAmount: 499.00,
            currency: 'USD',
            poNumber: 'PO-2024-001',
            glCode: '6001-Software',
            aiConfidence: 0.98,
            processingTimeMs: 1250,
            paymentScheduledDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            partnerId: acme.id,
            decisions: {
                create: [
                    {
                        agentId: 'capture-agent-01',
                        action: 'Extraction',
                        reasoning: 'High confidence OCR match on all fields',
                        confidenceScore: 0.99,
                        outcome: 'executed',
                    },
                    {
                        agentId: 'classification-agent-01',
                        action: 'GL Coding',
                        reasoning: 'Matched historical pattern for Acme Corp software invoices',
                        confidenceScore: 0.95,
                        outcome: 'executed',
                    },
                ],
            },
            complianceLogs: {
                create: [
                    { checkName: 'Tax ID Validation', status: 'PASS', details: 'Valid US Tax ID verified' },
                    { checkName: 'Duplicate Check', status: 'PASS', details: 'No duplicate found in last 12 months' },
                ],
            },
        },
    })

    // Invoice 2: High value, pending approval
    const inv2 = await prisma.invoice.create({
        data: {
            tenantId: tenant.id,
            sourceType: 'api',
            status: 'flagged_for_review',
            invoiceNumber: 'SH-8832',
            vendorName: globalLogistics.name,
            totalAmount: 12500.00,
            currency: 'GBP',
            poNumber: 'PO-2024-002',
            aiConfidence: 0.72,
            processingTimeMs: 3400,
            partnerId: globalLogistics.id,
            decisions: {
                create: [
                    {
                        agentId: 'risk-agent-01',
                        action: 'Risk Assessment',
                        reasoning: 'Invoice amount exceeds PO total by 47%. New vendor address detected.',
                        confidenceScore: 0.85,
                        outcome: 'queued_for_review',
                    },
                ],
            },
        },
    })

    // Invoice 3: Risky, flagged
    const inv3 = await prisma.invoice.create({
        data: {
            tenantId: tenant.id,
            sourceType: 'upload',
            status: 'flagged_for_review',
            invoiceNumber: 'OFF-Q1',
            vendorName: officeSupplies.name,
            totalAmount: 234.50,
            currency: 'USD',
            aiConfidence: 0.45,
            processingTimeMs: 890,
            partnerId: officeSupplies.id,
            decisions: {
                create: [
                    {
                        agentId: 'risk-agent-01',
                        action: 'Risk Assessment',
                        reasoning: 'High risk partner score (85). Vendor flagged as non-compliant.',
                        confidenceScore: 0.99,
                        outcome: 'blocked',
                    },
                ],
            },
        },
    })

    // Invoice 4: Touchless candidate
    const inv4 = await prisma.invoice.create({
        data: {
            tenantId: tenant.id,
            sourceType: 'email',
            status: 'extracted',
            invoiceNumber: 'INV-2024-002',
            vendorName: acme.name,
            totalAmount: 1200.00,
            currency: 'USD',
            poNumber: 'PO-2024-001',
            aiConfidence: 0.97,
            processingTimeMs: 980,
            partnerId: acme.id,
        },
    })

    // Invoice 5: Consulting invoice matched to PO
    const inv5 = await prisma.invoice.create({
        data: {
            tenantId: tenant.id,
            sourceType: 'email',
            status: 'matched',
            invoiceNumber: 'TP-INV-0042',
            vendorName: techConsulting.name,
            totalAmount: 17500.00,
            currency: 'USD',
            poNumber: 'PO-2024-003',
            glCode: '7200-Consulting',
            aiConfidence: 0.94,
            processingTimeMs: 1100,
            partnerId: techConsulting.id,
            decisions: {
                create: [
                    {
                        agentId: 'matching-agent-01',
                        action: 'PO Matching',
                        reasoning: 'Two-way match successful: PO-2024-003, variance within 0.5% tolerance',
                        confidenceScore: 0.96,
                        outcome: 'executed',
                    },
                ],
            },
        },
    })
    // Additional invoices
    const inv6 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'approved', invoiceNumber: 'CI-2024-0089', vendorName: cloudInfra.name, totalAmount: 4000.00, currency: 'USD', poNumber: 'PO-2024-004', glCode: '6100-Hosting', aiConfidence: 0.99, processingTimeMs: 850, partnerId: cloudInfra.id } })
    const inv7 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'api', status: 'approved', invoiceNumber: 'GE-2024-001', vendorName: greenEnergy.name, totalAmount: 1500.00, currency: 'EUR', poNumber: 'PO-2024-005', glCode: '6300-Utilities', aiConfidence: 0.96, processingTimeMs: 1100, partnerId: greenEnergy.id } })
    const inv8 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'upload', status: 'extracted', invoiceNumber: 'ND-INV-412', vendorName: nordicDesign.name, totalAmount: 15000.00, currency: 'SEK', aiConfidence: 0.88, processingTimeMs: 2200, partnerId: nordicDesign.id } })
    const inv9 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'matched', invoiceNumber: 'RF-2024-Q1', vendorName: rapidFleet.name, totalAmount: 13500.00, currency: 'USD', poNumber: 'PO-2024-007', glCode: '6500-Fleet', aiConfidence: 0.93, processingTimeMs: 1300, partnerId: rapidFleet.id } })
    const inv10 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'api', status: 'flagged_for_review', invoiceNumber: 'PM-INV-2288', vendorName: primeManufacturing.name, totalAmount: 52000.00, currency: 'GBP', poNumber: 'PO-2024-008', aiConfidence: 0.65, processingTimeMs: 4100, partnerId: primeManufacturing.id } })
    const inv11 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'approved', invoiceNumber: 'SG-2024-MAR', vendorName: safeGuardSec.name, totalAmount: 3000.00, currency: 'USD', poNumber: 'PO-2024-009', glCode: '6600-Security', aiConfidence: 0.97, processingTimeMs: 920, partnerId: safeGuardSec.id } })
    const inv12 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'approved', invoiceNumber: 'DC-LIC-2024', vendorName: dataCoreAnalytics.name, totalAmount: 36000.00, currency: 'USD', poNumber: 'PO-2024-010', glCode: '6001-Software', aiConfidence: 0.99, processingTimeMs: 780, partnerId: dataCoreAnalytics.id } })
    const inv13 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'upload', status: 'extracted', invoiceNumber: 'EP-R-55012', vendorName: euroPackaging.name, totalAmount: 10500.00, currency: 'EUR', poNumber: 'PO-2024-011', aiConfidence: 0.91, processingTimeMs: 1450, partnerId: euroPackaging.id } })
    const inv14 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'approved', invoiceNumber: 'AL-2024-RET-H1', vendorName: alphaLegal.name, totalAmount: 12500.00, currency: 'USD', poNumber: 'PO-2024-012', glCode: '7100-Legal', aiConfidence: 0.95, processingTimeMs: 1050, partnerId: alphaLegal.id } })
    const inv15 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'upload', status: 'flagged_for_review', invoiceNumber: 'FF-2024-0455', vendorName: freshFoodSupply.name, totalAmount: 875.00, currency: 'USD', aiConfidence: 0.42, processingTimeMs: 3200, partnerId: freshFoodSupply.id } })
    const inv16 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'matched', invoiceNumber: 'MT-SVC-2024-Q1', vendorName: mediTech.name, totalAmount: 6000.00, currency: 'USD', poNumber: 'PO-2024-013', glCode: '6800-Maintenance', aiConfidence: 0.94, processingTimeMs: 1100, partnerId: mediTech.id } })
    const inv17 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'api', status: 'approved', invoiceNumber: 'QR-2024-PH1-A', vendorName: quantumResearch.name, totalAmount: 20000.00, currency: 'USD', poNumber: 'PO-2024-014', glCode: '7300-Research', aiConfidence: 0.98, processingTimeMs: 900, partnerId: quantumResearch.id } })
    const inv18 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'ingested', invoiceNumber: 'QR-2024-PH1-B', vendorName: quantumResearch.name, totalAmount: 20000.00, currency: 'USD', poNumber: 'PO-2024-014', aiConfidence: 0.87, processingTimeMs: 1800, partnerId: quantumResearch.id } })
    const inv19 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'matched', invoiceNumber: 'SC-2024-0112', vendorName: swiftCourier.name, totalAmount: 1250.00, currency: 'USD', glCode: '6500-Shipping', aiConfidence: 0.92, processingTimeMs: 1050, partnerId: swiftCourier.id } })
    const inv20 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'upload', status: 'approved', invoiceNumber: 'PC-CLN-MAR24', vendorName: proClean.name, totalAmount: 2800.00, currency: 'USD', glCode: '6600-Facilities', aiConfidence: 0.96, processingTimeMs: 950, partnerId: proClean.id } })
    const inv21 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'api', status: 'approved', invoiceNumber: 'DMP-Q3-2024', vendorName: digitalMarketPro.name, totalAmount: 10000.00, currency: 'USD', poNumber: 'PO-2024-015', glCode: '7400-Marketing', aiConfidence: 0.97, processingTimeMs: 870, partnerId: digitalMarketPro.id } })
    const inv22 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'flagged_for_review', invoiceNumber: 'TS-STEEL-0044', vendorName: titanSteel.name, totalAmount: 82000.00, currency: 'USD', poNumber: 'PO-2024-016', aiConfidence: 0.71, processingTimeMs: 3800, partnerId: titanSteel.id } })
    const inv23 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'approved', invoiceNumber: 'IHR-2024-COMP', vendorName: insightHR.name, totalAmount: 12000.00, currency: 'USD', poNumber: 'PO-2024-017', glCode: '7500-HR', aiConfidence: 0.98, processingTimeMs: 820, partnerId: insightHR.id } })
    const inv24 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'api', status: 'matched', invoiceNumber: 'AT-VOIP-2024-01', vendorName: azureTelecom.name, totalAmount: 800.00, currency: 'EUR', poNumber: 'PO-2024-018', glCode: '6200-Telecom', aiConfidence: 0.99, processingTimeMs: 650, partnerId: azureTelecom.id } })
    const inv25 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'approved', invoiceNumber: 'INV-2024-003', vendorName: acme.name, totalAmount: 3000.00, currency: 'USD', poNumber: 'PO-2024-001', glCode: '6001-Software', aiConfidence: 0.99, processingTimeMs: 700, partnerId: acme.id } })
    const inv26 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'upload', status: 'extracted', invoiceNumber: 'GL-SH-Q2-001', vendorName: globalLogistics.name, totalAmount: 3500.00, currency: 'GBP', poNumber: 'PO-2024-002', aiConfidence: 0.89, processingTimeMs: 1650, partnerId: globalLogistics.id } })
    const inv27 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'email', status: 'rejected', invoiceNumber: 'OS-2024-DUP', vendorName: officeSupplies.name, totalAmount: 234.50, currency: 'USD', aiConfidence: 0.35, processingTimeMs: 750, partnerId: officeSupplies.id } })
    const inv28 = await prisma.invoice.create({ data: { tenantId: tenant.id, sourceType: 'api', status: 'ingested', invoiceNumber: 'TP-INV-0043', vendorName: techConsulting.name, totalAmount: 10000.00, currency: 'USD', poNumber: 'PO-2024-003', aiConfidence: 0.90, processingTimeMs: 1200, partnerId: techConsulting.id } })
    console.log(`  Created ${28} invoices`)

    // ─── 6. Create PO Match Results ─────────────────────────────────
    await prisma.pOMatchResult.create({
        data: {
            invoiceId: inv5.id,
            purchaseOrderId: po3.id,
            matchType: 'TWO_WAY',
            status: 'MATCHED',
            tolerance: 0.05,
            varianceAmount: 0.0,
            variancePercent: 0.0,
            details: JSON.stringify({
                matchedFields: ['poNumber', 'vendorName', 'amount'],
                lineItemMatches: 1,
            }),
        },
    })

    await prisma.pOMatchResult.create({
        data: {
            invoiceId: inv2.id,
            purchaseOrderId: po2.id,
            matchType: 'TWO_WAY',
            status: 'EXCEPTION',
            tolerance: 0.05,
            varianceAmount: 4000.00,
            variancePercent: 0.47,
            details: JSON.stringify({
                matchedFields: ['poNumber', 'vendorName'],
                exceptions: ['Amount exceeds PO total by 47%'],
            }),
        },
    })
    console.log(`  Created ${2} PO match results`)

    // ─── 7. Create Approval Workflows ───────────────────────────────
    const standardWorkflow = await prisma.approvalWorkflow.create({
        data: {
            name: 'Standard Invoice Approval',
            description: 'Two-tier approval for invoices between $1,000 and $10,000',
            tenantId: tenant.id,
            isActive: true,
            rules: JSON.stringify({
                conditions: [
                    { field: 'totalAmount', operator: 'gte', value: 1000 },
                    { field: 'totalAmount', operator: 'lt', value: 10000 },
                ],
                thresholds: { autoApprove: 500, escalate: 10000 },
            }),
        },
    })

    const highValueWorkflow = await prisma.approvalWorkflow.create({
        data: {
            name: 'High Value Invoice Approval',
            description: 'Three-tier approval for invoices over $10,000 requiring VP sign-off',
            tenantId: tenant.id,
            isActive: true,
            rules: JSON.stringify({
                conditions: [
                    { field: 'totalAmount', operator: 'gte', value: 10000 },
                ],
                thresholds: { escalate: 50000 },
                requiredApprovers: 3,
            }),
        },
    })
    const expenseWorkflow = await prisma.approvalWorkflow.create({
        data: {
            name: 'Expense Report Approval',
            description: 'Standard expense approval with manager sign-off for amounts over $200',
            tenantId: tenant.id,
            isActive: true,
            rules: JSON.stringify({
                conditions: [{ field: 'amount', operator: 'gte', value: 200 }],
                thresholds: { autoApprove: 200, escalate: 5000 },
            }),
        },
    })
    const poWorkflow = await prisma.approvalWorkflow.create({
        data: {
            name: 'Purchase Order Approval',
            description: 'PO approval requiring department head and finance sign-off',
            tenantId: tenant.id,
            isActive: true,
            rules: JSON.stringify({
                conditions: [{ field: 'totalAmount', operator: 'gte', value: 5000 }],
                thresholds: { autoApprove: 5000, escalate: 50000 },
                requiredApprovers: 2,
            }),
        },
    })
    const contractWorkflow = await prisma.approvalWorkflow.create({
        data: {
            name: 'Contract Approval',
            description: 'Legal review and executive approval for new vendor contracts',
            tenantId: tenant.id,
            isActive: false,
            rules: JSON.stringify({
                conditions: [{ field: 'value', operator: 'gte', value: 10000 }],
                requiredApprovers: 3,
                requiresLegalReview: true,
            }),
        },
    })
    console.log(`  Created ${5} approval workflows`)

    // ─── 8. Create Approval Steps ───────────────────────────────────
    await prisma.approvalStep.create({
        data: {
            workflowId: standardWorkflow.id,
            invoiceId: inv1.id,
            stepOrder: 1,
            approverId: apClerkUser.id,
            status: 'APPROVED',
            comments: 'Verified against PO. All amounts match.',
            approvedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        },
    })

    await prisma.approvalStep.create({
        data: {
            workflowId: standardWorkflow.id,
            invoiceId: inv1.id,
            stepOrder: 2,
            approverId: approverUser.id,
            status: 'APPROVED',
            comments: 'Final approval granted.',
            approvedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
    })

    await prisma.approvalStep.create({
        data: {
            workflowId: highValueWorkflow.id,
            invoiceId: inv2.id,
            stepOrder: 1,
            approverId: approverUser.id,
            status: 'PENDING',
        },
    })
    console.log(`  Created ${3} approval steps`)

    // ─── 9. Create Expenses ─────────────────────────────────────────
    await prisma.expense.create({
        data: {
            userId: approverUser.id,
            tenantId: tenant.id,
            category: 'TRAVEL',
            amount: 1250.00,
            currency: 'USD',
            status: 'APPROVED',
            description: 'Client site visit - NYC',
            merchant: 'Delta Airlines',
            project: 'Acme Corp Onboarding',
            costCenter: 'CC-SALES-001',
            expenseDate: new Date(new Date().setDate(new Date().getDate() - 14)),
            submittedAt: new Date(new Date().setDate(new Date().getDate() - 12)),
            approvedAt: new Date(new Date().setDate(new Date().getDate() - 10)),
            receiptUrl: '/receipts/exp-001.pdf',
        },
    })

    await prisma.expense.create({
        data: {
            userId: apClerkUser.id,
            tenantId: tenant.id,
            category: 'SOFTWARE',
            amount: 49.99,
            currency: 'USD',
            status: 'SUBMITTED',
            description: 'Notion team plan - monthly',
            merchant: 'Notion Labs Inc',
            costCenter: 'CC-OPS-001',
            expenseDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            submittedAt: new Date(new Date().setDate(new Date().getDate() - 4)),
        },
    })

    await prisma.expense.create({
        data: {
            userId: adminUser.id,
            tenantId: tenant.id,
            category: 'MEALS',
            amount: 187.50,
            currency: 'USD',
            status: 'SUBMITTED',
            description: 'Team dinner - Q1 kickoff',
            merchant: 'The Capital Grille',
            project: 'Internal',
            costCenter: 'CC-EXEC-001',
            expenseDate: new Date(new Date().setDate(new Date().getDate() - 3)),
            submittedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
            receiptUrl: '/receipts/exp-003.pdf',
        },
    })

    await prisma.expense.create({
        data: {
            userId: approverUser.id,
            tenantId: tenant.id,
            category: 'EQUIPMENT',
            amount: 2499.00,
            currency: 'USD',
            status: 'DRAFT',
            description: 'Standing desk and ergonomic chair',
            merchant: 'Herman Miller',
            costCenter: 'CC-FACILITIES-001',
            expenseDate: new Date(),
        },
    })
    // Additional expenses
    await prisma.expense.createMany({
        data: [
            { userId: adminUser.id, tenantId: tenant.id, category: 'TRAVEL', amount: 2340.00, currency: 'USD', status: 'APPROVED', description: 'Flight to London - vendor meeting', merchant: 'British Airways', project: 'Global Logistics Onboarding', costCenter: 'CC-EXEC-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 21)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 20)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 18)), receiptUrl: '/receipts/exp-005.pdf' },
            { userId: approverUser.id, tenantId: tenant.id, category: 'TRAVEL', amount: 450.00, currency: 'USD', status: 'APPROVED', description: 'Hotel - 2 nights NYC', merchant: 'Marriott Hotels', project: 'Acme Corp Onboarding', costCenter: 'CC-SALES-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 13)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 11)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 9)), receiptUrl: '/receipts/exp-006.pdf' },
            { userId: apClerkUser.id, tenantId: tenant.id, category: 'SOFTWARE', amount: 14.99, currency: 'USD', status: 'APPROVED', description: 'Figma - monthly subscription', merchant: 'Figma Inc', costCenter: 'CC-OPS-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 30)) },
            { userId: controllerUser.id, tenantId: tenant.id, category: 'MEALS', amount: 65.00, currency: 'USD', status: 'SUBMITTED', description: 'Client lunch - Q2 planning', merchant: 'Nobu Restaurant', project: 'Client Relations', costCenter: 'CC-FINANCE-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 7)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 6)), receiptUrl: '/receipts/exp-008.pdf' },
            { userId: analystUser.id, tenantId: tenant.id, category: 'SOFTWARE', amount: 29.99, currency: 'USD', status: 'SUBMITTED', description: 'Tableau Desktop - monthly', merchant: 'Tableau Software', costCenter: 'CC-ANALYTICS-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 10)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 9)) },
            { userId: approverUser.id, tenantId: tenant.id, category: 'TRAVEL', amount: 180.00, currency: 'USD', status: 'APPROVED', description: 'Uber rides - client visits', merchant: 'Uber', project: 'Client Relations', costCenter: 'CC-SALES-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 8)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 7)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 5)) },
            { userId: adminUser.id, tenantId: tenant.id, category: 'EQUIPMENT', amount: 1299.00, currency: 'USD', status: 'APPROVED', description: 'MacBook Pro charger + dock', merchant: 'Apple Store', costCenter: 'CC-IT-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 15)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 14)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 12)), receiptUrl: '/receipts/exp-011.pdf' },
            { userId: apClerkUser.id, tenantId: tenant.id, category: 'OFFICE', amount: 89.50, currency: 'USD', status: 'APPROVED', description: 'Office supplies - pens, paper, folders', merchant: 'Staples', costCenter: 'CC-OPS-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 20)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 19)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 17)) },
            { userId: controllerUser.id, tenantId: tenant.id, category: 'TRAINING', amount: 599.00, currency: 'USD', status: 'SUBMITTED', description: 'CPA continuing education course', merchant: 'AICPA', costCenter: 'CC-FINANCE-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 4)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 3)) },
            { userId: analystUser.id, tenantId: tenant.id, category: 'TRAVEL', amount: 320.00, currency: 'USD', status: 'DRAFT', description: 'Train tickets - data conference', merchant: 'Amtrak', project: 'Conference Attendance', costCenter: 'CC-ANALYTICS-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 2)) },
            { userId: approverUser.id, tenantId: tenant.id, category: 'MEALS', amount: 142.00, currency: 'USD', status: 'APPROVED', description: 'Team celebration dinner', merchant: 'Ruth\'s Chris', costCenter: 'CC-SALES-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 6)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 5)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 3)), receiptUrl: '/receipts/exp-015.pdf' },
            { userId: adminUser.id, tenantId: tenant.id, category: 'SOFTWARE', amount: 199.00, currency: 'USD', status: 'APPROVED', description: 'Zoom Business - annual', merchant: 'Zoom Video', costCenter: 'CC-IT-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 45)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 44)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 42)) },
            { userId: viewerUser.id, tenantId: tenant.id, category: 'TRAVEL', amount: 75.00, currency: 'USD', status: 'REJECTED', description: 'Parking - personal errand', merchant: 'LAZ Parking', costCenter: 'CC-OPS-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 25)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 24)) },
            { userId: apClerkUser.id, tenantId: tenant.id, category: 'OFFICE', amount: 245.00, currency: 'USD', status: 'SUBMITTED', description: 'Ergonomic keyboard and mouse', merchant: 'Logitech', costCenter: 'CC-OPS-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 1)), submittedAt: new Date() },
            { userId: controllerUser.id, tenantId: tenant.id, category: 'TRAVEL', amount: 890.00, currency: 'USD', status: 'APPROVED', description: 'Flight to Chicago - audit meeting', merchant: 'United Airlines', project: 'Internal Audit', costCenter: 'CC-FINANCE-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 18)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 17)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 15)), receiptUrl: '/receipts/exp-019.pdf' },
            { userId: analystUser.id, tenantId: tenant.id, category: 'SOFTWARE', amount: 39.99, currency: 'USD', status: 'APPROVED', description: 'GitHub Copilot - monthly', merchant: 'GitHub', costCenter: 'CC-ANALYTICS-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 30)), submittedAt: new Date(new Date().setDate(new Date().getDate() - 29)), approvedAt: new Date(new Date().setDate(new Date().getDate() - 27)) },
            { userId: adminUser.id, tenantId: tenant.id, category: 'MEALS', amount: 95.00, currency: 'USD', status: 'SUBMITTED', description: 'Working lunch with board member', merchant: 'Per Se', project: 'Board Relations', costCenter: 'CC-EXEC-001', expenseDate: new Date(new Date().setDate(new Date().getDate() - 1)), submittedAt: new Date(), receiptUrl: '/receipts/exp-021.pdf' },
            { userId: approverUser.id, tenantId: tenant.id, category: 'EQUIPMENT', amount: 549.00, currency: 'USD', status: 'DRAFT', description: 'Monitor arm + webcam', merchant: 'Amazon', costCenter: 'CC-SALES-001', expenseDate: new Date() },
        ],
    })
    console.log(`  Created ${22} expenses`)

    // ─── 10. Create Expense Policies ────────────────────────────────
    await prisma.expensePolicy.create({
        data: {
            tenantId: tenant.id,
            name: 'Standard Expense Policy',
            isActive: true,
            rules: JSON.stringify([
                { category: 'TRAVEL', maxAmount: 5000, requiresReceipt: true, requiresApproval: true },
                { category: 'MEALS', maxAmount: 200, requiresReceipt: true, requiresApproval: false },
                { category: 'SOFTWARE', maxAmount: 500, requiresReceipt: false, requiresApproval: false },
                { category: 'EQUIPMENT', maxAmount: 2000, requiresReceipt: true, requiresApproval: true },
                { category: 'OFFICE', maxAmount: 300, requiresReceipt: true, requiresApproval: false },
            ]),
        },
    })
    await prisma.expensePolicy.create({
        data: {
            tenantId: tenant.id,
            name: 'Executive Travel Policy',
            isActive: true,
            rules: JSON.stringify([
                { category: 'TRAVEL', maxAmount: 15000, requiresReceipt: true, requiresApproval: true },
                { category: 'MEALS', maxAmount: 500, requiresReceipt: true, requiresApproval: false },
                { category: 'EQUIPMENT', maxAmount: 5000, requiresReceipt: true, requiresApproval: true },
            ]),
        },
    })
    await prisma.expensePolicy.create({
        data: {
            tenantId: tenant.id,
            name: 'Remote Worker Policy',
            isActive: true,
            rules: JSON.stringify([
                { category: 'EQUIPMENT', maxAmount: 3000, requiresReceipt: true, requiresApproval: true, description: 'Home office setup' },
                { category: 'SOFTWARE', maxAmount: 200, requiresReceipt: false, requiresApproval: false },
                { category: 'OFFICE', maxAmount: 500, requiresReceipt: true, requiresApproval: false },
            ]),
        },
    })
    await prisma.expensePolicy.create({
        data: {
            tenantId: tenant.id,
            name: 'Conference & Training Policy',
            isActive: true,
            rules: JSON.stringify([
                { category: 'TRAINING', maxAmount: 3000, requiresReceipt: true, requiresApproval: true },
                { category: 'TRAVEL', maxAmount: 2000, requiresReceipt: true, requiresApproval: true },
                { category: 'MEALS', maxAmount: 100, requiresReceipt: true, requiresApproval: false },
            ]),
        },
    })
    await prisma.expensePolicy.create({
        data: {
            tenantId: tenant.id,
            name: 'Client Entertainment Policy',
            isActive: false,
            rules: JSON.stringify([
                { category: 'MEALS', maxAmount: 300, requiresReceipt: true, requiresApproval: true },
                { category: 'TRAVEL', maxAmount: 1000, requiresReceipt: true, requiresApproval: true },
            ]),
        },
    })
    console.log(`  Created ${5} expense policies`)

    // ─── 11. Create Contracts ───────────────────────────────────────
    await prisma.contract.create({
        data: {
            tenantId: tenant.id,
            supplierId: acme.id,
            title: 'Enterprise Software License Agreement',
            value: 144000.00,
            currency: 'USD',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2026-12-31'),
            status: 'ACTIVE',
            autoRenew: true,
            terms: JSON.stringify({
                paymentSchedule: 'annual',
                sla: '99.9% uptime',
                terminationNotice: '90 days',
                priceEscalation: '3% annually',
            }),
            documentUrl: '/contracts/acme-license-2024.pdf',
        },
    })

    await prisma.contract.create({
        data: {
            tenantId: tenant.id,
            supplierId: globalLogistics.id,
            title: 'Freight Services Master Agreement',
            value: 96000.00,
            currency: 'GBP',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2025-02-28'),
            status: 'ACTIVE',
            autoRenew: false,
            terms: JSON.stringify({
                paymentSchedule: 'monthly',
                deliveryGuarantee: '48 hours domestic',
                liabilityLimit: 50000,
            }),
            documentUrl: '/contracts/global-logistics-2024.pdf',
        },
    })

    await prisma.contract.create({
        data: {
            tenantId: tenant.id,
            supplierId: techConsulting.id,
            title: 'Cloud Migration Consulting SOW',
            value: 45000.00,
            currency: 'USD',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-12-31'),
            status: 'EXPIRING',
            terms: JSON.stringify({
                paymentSchedule: 'milestone',
                milestones: [
                    { name: 'Assessment Complete', amount: 10000 },
                    { name: 'Migration Phase 1', amount: 20000 },
                    { name: 'Final Delivery', amount: 15000 },
                ],
            }),
        },
    })
    // Additional contracts
    await prisma.contract.createMany({
        data: [
            { tenantId: tenant.id, supplierId: cloudInfra.id, title: 'Cloud Infrastructure Services Agreement', value: 288000.00, currency: 'USD', startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ paymentSchedule: 'monthly', sla: '99.99% uptime', dataResidency: 'US-East' }), documentUrl: '/contracts/cloudinfra-2024.pdf' },
            { tenantId: tenant.id, supplierId: greenEnergy.id, title: 'Renewable Energy Supply Contract', value: 18000.00, currency: 'EUR', startDate: new Date('2024-03-01'), endDate: new Date('2025-02-28'), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ paymentSchedule: 'monthly', certificationType: 'EU-GREEN-2024' }) },
            { tenantId: tenant.id, supplierId: nordicDesign.id, title: 'Brand Redesign Project Agreement', value: 35000.00, currency: 'SEK', startDate: new Date('2024-09-01'), endDate: new Date('2025-03-31'), status: 'DRAFT', terms: JSON.stringify({ paymentSchedule: 'milestone', milestones: [{ name: 'Concept', amount: 10000 }, { name: 'Design', amount: 15000 }, { name: 'Delivery', amount: 10000 }] }) },
            { tenantId: tenant.id, supplierId: rapidFleet.id, title: 'Fleet Management & Leasing Agreement', value: 624000.00, currency: 'USD', startDate: new Date('2024-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE', autoRenew: false, terms: JSON.stringify({ paymentSchedule: 'monthly', vehicleCount: 12, maintenanceIncluded: true }), documentUrl: '/contracts/rapidfleet-2024.pdf' },
            { tenantId: tenant.id, supplierId: primeManufacturing.id, title: 'Custom Parts Manufacturing MSA', value: 250000.00, currency: 'GBP', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ paymentSchedule: 'per-order', qualityStandard: 'ISO-9001', defectTolerance: '0.5%' }) },
            { tenantId: tenant.id, supplierId: safeGuardSec.id, title: 'Physical Security Services Contract', value: 36000.00, currency: 'USD', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'EXPIRING', autoRenew: false, terms: JSON.stringify({ paymentSchedule: 'monthly', coverage: '24/7', sites: 2 }) },
            { tenantId: tenant.id, supplierId: dataCoreAnalytics.id, title: 'Data Analytics Platform License', value: 42000.00, currency: 'USD', startDate: new Date('2024-06-01'), endDate: new Date('2025-05-31'), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ paymentSchedule: 'annual', seats: 25, dataVolume: '10TB' }), documentUrl: '/contracts/datacore-2024.pdf' },
            { tenantId: tenant.id, supplierId: alphaLegal.id, title: 'Legal Services Retainer', value: 50000.00, currency: 'USD', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ paymentSchedule: 'monthly', hoursIncluded: 20, overageRate: 350 }) },
            { tenantId: tenant.id, supplierId: quantumResearch.id, title: 'Research Partnership Agreement', value: 240000.00, currency: 'USD', startDate: new Date('2024-04-01'), endDate: new Date('2025-09-30'), status: 'ACTIVE', terms: JSON.stringify({ paymentSchedule: 'quarterly', phases: 3, ipOwnership: 'joint' }) },
            { tenantId: tenant.id, supplierId: digitalMarketPro.id, title: 'Digital Marketing Services Agreement', value: 74000.00, currency: 'USD', startDate: new Date('2024-07-01'), endDate: new Date('2025-06-30'), status: 'ACTIVE', autoRenew: false, terms: JSON.stringify({ paymentSchedule: 'monthly', kpis: ['CTR > 2%', 'CPA < $50'] }) },
            { tenantId: tenant.id, supplierId: titanSteel.id, title: 'Raw Materials Supply Agreement', value: 380000.00, currency: 'USD', startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), status: 'ACTIVE', autoRenew: true, terms: JSON.stringify({ paymentSchedule: 'per-shipment', priceFixedUntil: '2025-06-30', volumeCommitment: '100 tons/year' }), documentUrl: '/contracts/titansteel-2024.pdf' },
            { tenantId: tenant.id, supplierId: insightHR.id, title: 'HR Consulting Engagement Letter', value: 22000.00, currency: 'USD', startDate: new Date('2024-08-01'), endDate: new Date('2024-11-30'), status: 'EXPIRED', terms: JSON.stringify({ paymentSchedule: 'milestone', deliverables: ['Comp study', 'Org design', 'Implementation plan'] }) },
        ],
    })
    console.log(`  Created ${15} contracts`)

    // ─── 12. Create Risk Alerts ─────────────────────────────────────
    await prisma.riskAlert.create({
        data: {
            tenantId: tenant.id,
            invoiceId: inv3.id,
            riskType: 'COMPLIANCE',
            severity: 'HIGH',
            description: 'Vendor Office Supplies Co has non-compliant tax documentation. Invoice processing blocked pending vendor remediation.',
            status: 'OPEN',
            details: JSON.stringify({
                vendorRiskScore: 85,
                complianceIssues: ['Missing W-9', 'Tax ID mismatch'],
                recommendedAction: 'Contact vendor for updated documentation',
            }),
        },
    })

    await prisma.riskAlert.create({
        data: {
            tenantId: tenant.id,
            invoiceId: inv2.id,
            riskType: 'ANOMALY',
            severity: 'MEDIUM',
            description: 'Invoice SH-8832 amount ($12,500) exceeds PO-2024-002 total ($8,500) by 47%. Possible scope change or billing error.',
            status: 'INVESTIGATING',
            details: JSON.stringify({
                invoiceAmount: 12500,
                poAmount: 8500,
                variancePercent: 47,
                historicalAverage: 3200,
            }),
        },
    })

    await prisma.riskAlert.create({
        data: {
            tenantId: tenant.id,
            riskType: 'DUPLICATE',
            severity: 'LOW',
            description: 'Potential duplicate detected: INV-2024-001 and INV-2024-002 from same vendor within 7 days with similar amounts.',
            status: 'RESOLVED',
            resolvedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
            details: JSON.stringify({
                invoiceA: 'INV-2024-001',
                invoiceB: 'INV-2024-002',
                similarity: 0.72,
                resolution: 'Confirmed as separate legitimate invoices',
            }),
        },
    })

    await prisma.riskAlert.create({
        data: {
            tenantId: tenant.id,
            riskType: 'FRAUD',
            severity: 'CRITICAL',
            description: 'Bank account change detected for vendor Acme Corp. New routing number does not match registered financial institution records.',
            status: 'OPEN',
            details: JSON.stringify({
                vendorName: 'Acme Corp',
                previousBank: 'Chase - ****4521',
                newBank: 'Unknown - ****7789',
                changeDate: new Date().toISOString(),
                recommendedAction: 'Verify bank details via phone callback to registered vendor contact',
            }),
        },
    })
    console.log(`  Created ${4} risk alerts`)

    // ─── 13. Create Payment Batches ─────────────────────────────────
    const batch1 = await prisma.paymentBatch.create({
        data: {
            tenantId: tenant.id,
            totalAmount: 499.00,
            currency: 'USD',
            paymentCount: 1,
            status: 'COMPLETED',
            method: 'ACH',
            processedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
    })

    const batch2 = await prisma.paymentBatch.create({
        data: {
            tenantId: tenant.id,
            totalAmount: 17500.00,
            currency: 'USD',
            paymentCount: 1,
            status: 'PENDING',
            method: 'WIRE',
        },
    })

    const batch3 = await prisma.paymentBatch.create({
        data: {
            tenantId: tenant.id,
            totalAmount: 1487.49,
            currency: 'USD',
            paymentCount: 2,
            status: 'PROCESSING',
            method: 'VIRTUAL_CARD',
        },
    })
    const batch4 = await prisma.paymentBatch.create({
        data: {
            tenantId: tenant.id,
            totalAmount: 42800.00,
            currency: 'USD',
            paymentCount: 4,
            status: 'PENDING',
            method: 'ACH',
        },
    })
    const batch5 = await prisma.paymentBatch.create({
        data: {
            tenantId: tenant.id,
            totalAmount: 9600.00,
            currency: 'EUR',
            paymentCount: 2,
            status: 'COMPLETED',
            method: 'SEPA',
            processedAt: new Date(new Date().setDate(new Date().getDate() - 3)),
        },
    })
    console.log(`  Created ${5} payment batches`)

    // ─── 14. Create Payment Transactions ────────────────────────────
    await prisma.paymentTransaction.create({
        data: {
            batchId: batch1.id,
            invoiceId: inv1.id,
            amount: 499.00,
            currency: 'USD',
            status: 'COMPLETED',
            reference: 'ACH-2024-001-REF',
            processedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
    })

    await prisma.paymentTransaction.create({
        data: {
            batchId: batch2.id,
            invoiceId: inv5.id,
            amount: 17500.00,
            currency: 'USD',
            status: 'PENDING',
            reference: 'WIRE-2024-002-REF',
        },
    })
    console.log(`  Created ${2} payment transactions`)

    // ─── 14B. Create Virtual Cards ────────────────────────────────
    await prisma.virtualCard.createMany({
        data: [
            { tenantId: tenant.id, supplierId: acme.id, cardNumber: 'VC-4532-0001', amount: 15000.00, currency: 'USD', status: 'ACTIVE', expiresAt: new Date('2025-06-30') },
            { tenantId: tenant.id, supplierId: cloudInfra.id, cardNumber: 'VC-4532-0002', amount: 24000.00, currency: 'USD', status: 'ACTIVE', expiresAt: new Date('2025-12-31') },
            { tenantId: tenant.id, supplierId: globalLogistics.id, cardNumber: 'VC-4532-0003', amount: 8500.00, currency: 'GBP', status: 'ACTIVE', expiresAt: new Date('2025-03-31') },
            { tenantId: tenant.id, supplierId: techConsulting.id, cardNumber: 'VC-4532-0004', amount: 45000.00, currency: 'USD', status: 'ACTIVE', expiresAt: new Date('2025-09-30') },
            { tenantId: tenant.id, supplierId: nordicDesign.id, cardNumber: 'VC-4532-0005', amount: 35000.00, currency: 'SEK', status: 'PENDING', expiresAt: new Date('2025-06-30') },
            { tenantId: tenant.id, supplierId: dataCoreAnalytics.id, cardNumber: 'VC-4532-0006', amount: 42000.00, currency: 'USD', status: 'ACTIVE', expiresAt: new Date('2025-12-31') },
            { tenantId: tenant.id, supplierId: euroPackaging.id, cardNumber: 'VC-4532-0007', amount: 15500.00, currency: 'EUR', status: 'ACTIVE', expiresAt: new Date('2025-04-30') },
            { tenantId: tenant.id, supplierId: alphaLegal.id, cardNumber: 'VC-4532-0008', amount: 25000.00, currency: 'USD', status: 'ACTIVE', expiresAt: new Date('2025-06-30') },
            { tenantId: tenant.id, supplierId: digitalMarketPro.id, cardNumber: 'VC-4532-0009', amount: 18500.00, currency: 'USD', status: 'ACTIVE', expiresAt: new Date('2025-09-30') },
            { tenantId: tenant.id, supplierId: quantumResearch.id, cardNumber: 'VC-4532-0010', amount: 120000.00, currency: 'USD', status: 'ACTIVE', expiresAt: new Date('2025-12-31') },
            { tenantId: tenant.id, supplierId: officeSupplies.id, cardNumber: 'VC-4532-0011', amount: 5000.00, currency: 'USD', status: 'FROZEN', expiresAt: new Date('2025-01-31') },
            { tenantId: tenant.id, supplierId: insightHR.id, cardNumber: 'VC-4532-0012', amount: 22000.00, currency: 'USD', status: 'EXPIRED', expiresAt: new Date('2024-11-30') },
        ],
    })
    console.log(`  Created ${12} virtual cards`)

    // ─── 14C. Create SCF Programs ─────────────────────────────────
    await prisma.sCFProgram.createMany({
        data: [
            { tenantId: tenant.id, funder: 'JPMorgan Chase', programSize: 5000000.00, utilization: 0.42, rateRangeMin: 2.5, rateRangeMax: 4.0, suppliers: 8, status: 'ACTIVE' },
            { tenantId: tenant.id, funder: 'HSBC Trade Finance', programSize: 3000000.00, utilization: 0.67, rateRangeMin: 3.0, rateRangeMax: 5.5, suppliers: 5, status: 'ACTIVE' },
            { tenantId: tenant.id, funder: 'Citibank SCF', programSize: 10000000.00, utilization: 0.23, rateRangeMin: 2.0, rateRangeMax: 3.5, suppliers: 15, status: 'ACTIVE' },
            { tenantId: tenant.id, funder: 'BNP Paribas', programSize: 2000000.00, utilization: 0.85, rateRangeMin: 3.5, rateRangeMax: 6.0, suppliers: 3, status: 'PAUSED' },
            { tenantId: tenant.id, funder: 'Deutsche Bank Trade', programSize: 7500000.00, utilization: 0.0, rateRangeMin: 2.8, rateRangeMax: 4.5, suppliers: 0, status: 'PENDING' },
        ],
    })
    console.log(`  Created ${5} SCF programs`)

    // ─── 15. Create Audit Logs ──────────────────────────────────────
    await prisma.auditLog.create({
        data: {
            tenantId: tenant.id,
            userId: adminUser.id,
            action: 'CREATED',
            entityType: 'ApprovalWorkflow',
            entityId: standardWorkflow.id,
            details: JSON.stringify({ workflowName: 'Standard Invoice Approval' }),
            ipAddress: '192.168.1.100',
        },
    })

    await prisma.auditLog.create({
        data: {
            tenantId: tenant.id,
            userId: approverUser.id,
            action: 'APPROVED',
            entityType: 'Invoice',
            entityId: inv1.id,
            details: JSON.stringify({ invoiceNumber: 'INV-2024-001', amount: 499.00 }),
            ipAddress: '10.0.0.42',
        },
    })

    await prisma.auditLog.create({
        data: {
            tenantId: tenant.id,
            userId: adminUser.id,
            action: 'CONFIGURED',
            entityType: 'Setting',
            entityId: tenant.id,
            details: JSON.stringify({ changed: 'touchlessEnabled', from: false, to: true }),
            ipAddress: '192.168.1.100',
        },
    })
    console.log(`  Created ${3} audit logs`)

    // ─── 16. Create Notifications ───────────────────────────────────
    await prisma.notification.create({
        data: {
            userId: approverUser.id,
            type: 'APPROVAL_REQUIRED',
            title: 'Invoice Pending Approval',
            message: 'Invoice SH-8832 from Global Logistics for $12,500.00 GBP requires your approval.',
            isRead: false,
            actionUrl: `/invoices/${inv2.id}`,
        },
    })

    await prisma.notification.create({
        data: {
            userId: adminUser.id,
            type: 'RISK_ALERT',
            title: 'Critical Risk Alert: Bank Account Change',
            message: 'A bank account change was detected for Acme Corp. Immediate verification required.',
            isRead: false,
            actionUrl: '/risk-alerts',
        },
    })

    await prisma.notification.create({
        data: {
            userId: apClerkUser.id,
            type: 'PAYMENT_PROCESSED',
            title: 'Payment Completed',
            message: 'ACH payment of $499.00 to Acme Corp for INV-2024-001 has been processed successfully.',
            isRead: true,
            actionUrl: `/payments/${batch1.id}`,
        },
    })
    console.log(`  Created ${3} notifications`)

    // ─── 17. Create ERP Connection ──────────────────────────────────
    const erpConn = await prisma.eRPConnection.create({
        data: {
            tenantId: tenant.id,
            erpType: 'SAP',
            name: 'SAP S/4HANA Production',
            status: 'ACTIVE',
            config: JSON.stringify({
                host: 'sap.medius-demo.com',
                port: 443,
                client: '100',
                systemId: 'PRD',
                syncInterval: '15m',
            }),
            lastSyncAt: new Date(new Date().setMinutes(new Date().getMinutes() - 15)),
        },
    })

    await prisma.syncLog.create({
        data: {
            erpConnectionId: erpConn.id,
            direction: 'INBOUND',
            entityType: 'Invoice',
            recordCount: 12,
            status: 'SUCCESS',
            completedAt: new Date(new Date().setMinutes(new Date().getMinutes() - 15)),
        },
    })

    await prisma.syncLog.create({
        data: {
            erpConnectionId: erpConn.id,
            direction: 'OUTBOUND',
            entityType: 'Payment',
            recordCount: 3,
            status: 'SUCCESS',
            completedAt: new Date(new Date().setMinutes(new Date().getMinutes() - 14)),
        },
    })
    console.log(`  Created ERP connection with ${2} sync logs`)

    // ─── 18. Create Reports ─────────────────────────────────────────
    await prisma.report.create({
        data: {
            tenantId: tenant.id,
            name: 'Weekly Spend Analysis',
            type: 'SPEND_ANALYSIS',
            config: JSON.stringify({
                groupBy: 'vendor',
                dateRange: 'last_7_days',
                includeCategories: true,
            }),
            schedule: JSON.stringify({
                cron: '0 8 * * MON',
                enabled: true,
                recipients: ['admin@medius-demo.com', 'approver@medius-demo.com'],
            }),
            lastRunAt: new Date(new Date().setDate(new Date().getDate() - 3)),
        },
    })

    await prisma.report.create({
        data: {
            tenantId: tenant.id,
            name: 'AP Aging Report',
            type: 'AGING',
            config: JSON.stringify({
                buckets: ['0-30', '31-60', '61-90', '90+'],
                groupBy: 'vendor',
            }),
            schedule: JSON.stringify({
                cron: '0 6 1 * *',
                enabled: true,
                recipients: ['admin@medius-demo.com'],
            }),
        },
    })
    // Additional reports
    await prisma.report.createMany({
        data: [
            { tenantId: tenant.id, name: 'Vendor Performance Scorecard', type: 'VENDOR_PERFORMANCE', config: JSON.stringify({ metrics: ['on_time_delivery', 'quality_score', 'price_competitiveness'], period: 'quarterly' }), schedule: JSON.stringify({ cron: '0 8 1 */3 *', enabled: true, recipients: ['admin@medius-demo.com'] }) },
            { tenantId: tenant.id, name: 'Monthly Compliance Audit', type: 'COMPLIANCE', config: JSON.stringify({ checks: ['tax_validation', 'duplicate_detection', 'policy_adherence'], scope: 'all_invoices' }), schedule: JSON.stringify({ cron: '0 6 1 * *', enabled: true, recipients: ['controller@medius-demo.com'] }), lastRunAt: new Date(new Date().setDate(new Date().getDate() - 30)) },
            { tenantId: tenant.id, name: 'Cash Flow Forecast', type: 'CASH_FLOW', config: JSON.stringify({ forecastPeriod: '90_days', includeScheduledPayments: true, includeExpectedReceipts: true }), schedule: JSON.stringify({ cron: '0 7 * * MON', enabled: true, recipients: ['controller@medius-demo.com', 'admin@medius-demo.com'] }), lastRunAt: new Date(new Date().setDate(new Date().getDate() - 5)) },
            { tenantId: tenant.id, name: 'Expense Category Breakdown', type: 'EXPENSE_ANALYSIS', config: JSON.stringify({ groupBy: 'category', period: 'monthly', includeComparison: true }), schedule: JSON.stringify({ cron: '0 8 1 * *', enabled: true, recipients: ['admin@medius-demo.com'] }) },
            { tenantId: tenant.id, name: 'Touchless Processing Rate', type: 'AUTOMATION_KPI', config: JSON.stringify({ metrics: ['touchless_rate', 'exception_rate', 'avg_processing_time'], period: 'weekly' }), schedule: JSON.stringify({ cron: '0 9 * * FRI', enabled: true, recipients: ['admin@medius-demo.com', 'analyst@medius-demo.com'] }), lastRunAt: new Date(new Date().setDate(new Date().getDate() - 2)) },
            { tenantId: tenant.id, name: 'Early Payment Discount Report', type: 'DISCOUNT_ANALYSIS', config: JSON.stringify({ scope: 'captured_and_missed', period: 'monthly' }), schedule: JSON.stringify({ cron: '0 8 1 * *', enabled: false, recipients: ['controller@medius-demo.com'] }) },
            { tenantId: tenant.id, name: 'Risk Assessment Summary', type: 'RISK_SUMMARY', config: JSON.stringify({ riskTypes: ['fraud', 'compliance', 'anomaly', 'duplicate'], severity: ['critical', 'high', 'medium'] }), schedule: JSON.stringify({ cron: '0 8 * * *', enabled: true, recipients: ['admin@medius-demo.com'] }), lastRunAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
        ],
    })
    console.log(`  Created ${9} reports`)

    // ─── 19. Create Cash Flow Forecasts ─────────────────────────────
    const today = new Date()
    for (let i = 0; i < 7; i++) {
        const forecastDate = new Date(today)
        forecastDate.setDate(forecastDate.getDate() + (i * 7))
        const inflow = 45000 + Math.random() * 15000
        const outflow = 35000 + Math.random() * 12000
        await prisma.cashFlowForecast.create({
            data: {
                tenantId: tenant.id,
                forecastDate,
                expectedInflow: Math.round(inflow * 100) / 100,
                expectedOutflow: Math.round(outflow * 100) / 100,
                netPosition: Math.round((inflow - outflow) * 100) / 100,
                confidence: Math.round((0.95 - i * 0.05) * 100) / 100,
            },
        })
    }
    console.log(`  Created ${7} cash flow forecasts`)

    // ─── 20. Create Supplier Conversation ───────────────────────────
    const conversation = await prisma.supplierConversation.create({
        data: {
            supplierId: globalLogistics.id,
            tenantId: tenant.id,
            subject: 'Invoice SH-8832 Amount Discrepancy',
            status: 'PENDING_RESPONSE',
            priority: 'HIGH',
        },
    })

    await prisma.conversationMessage.create({
        data: {
            conversationId: conversation.id,
            senderId: apClerkUser.id,
            senderType: 'USER',
            content: 'Hi, we received invoice SH-8832 for GBP 12,500 but our PO-2024-002 is for GBP 8,500. Could you please clarify the additional charges?',
        },
    })

    await prisma.conversationMessage.create({
        data: {
            conversationId: conversation.id,
            senderId: apClerkUser.id,
            senderType: 'AGENT',
            content: 'Automated follow-up: This invoice has been flagged for review. The variance of 47% exceeds the configured tolerance of 5%. Awaiting supplier response before proceeding with approval workflow.',
            sentAt: new Date(new Date().setHours(new Date().getHours() - 2)),
        },
    })
    console.log(`  Created supplier conversation with ${2} messages`)

    // ─── 21. Create Monetization Logs ───────────────────────────────
    await prisma.monetizationLog.create({
        data: {
            documentId: inv1.id,
            type: 'DISCOUNT_CAPTURED',
            amount: 9.98,
            details: JSON.stringify({
                discountTerms: '2/10 net 30',
                invoiceAmount: 499.00,
                discountPercent: 2,
                paymentDate: new Date().toISOString(),
                daysEarly: 8,
            }),
        },
    })
    console.log(`  Created monetization log`)

    console.log('\nSeeding finished successfully!')
    console.log(`\nSummary:`)
    console.log(`  - 1 tenant`)
    console.log(`  - 6 users`)
    console.log(`  - 22 trading partners (suppliers)`)
    console.log(`  - 18 purchase orders`)
    console.log(`  - 28 invoices`)
    console.log(`  - 2 PO match results`)
    console.log(`  - 5 approval workflows with 3 steps`)
    console.log(`  - 22 expenses with 5 policies`)
    console.log(`  - 15 contracts`)
    console.log(`  - 4 risk alerts`)
    console.log(`  - 5 payment batches with 2 transactions`)
    console.log(`  - 12 virtual cards`)
    console.log(`  - 5 SCF programs`)
    console.log(`  - 3 audit logs`)
    console.log(`  - 3 notifications`)
    console.log(`  - 1 ERP connection with 2 sync logs`)
    console.log(`  - 9 reports`)
    console.log(`  - 7 cash flow forecasts`)
    console.log(`  - 1 supplier conversation with 2 messages`)
    console.log(`  - 1 monetization log`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
