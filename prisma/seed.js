
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({})

async function main() {
    console.log('Start seeding ...')

    // 1. Create Trading Partners
    const acme = await prisma.tradingPartner.create({
        data: {
            name: 'Acme Corp',
            taxId: 'US-99-123456',
            riskScore: 10,
            discountTerms: '2/10 net 30',
        },
    })

    const globalLogistics = await prisma.tradingPartner.create({
        data: {
            name: 'Global Logistics',
            taxId: 'GB-8832-11',
            riskScore: 5,
            discountTerms: 'Net 45',
        },
    })

    const officeSupplies = await prisma.tradingPartner.create({
        data: {
            name: 'Office Supplies Co',
            taxId: 'US-55-987654',
            riskScore: 85, // High risk
            discountTerms: 'Immediate',
        },
    })

    // 2. Create Invoices

    // Invoice 1: Clean, processed, low risk
    await prisma.invoice.create({
        data: {
            tenantId: 'demo_tenant',
            sourceType: 'email',
            status: 'posted',
            invoiceNumber: 'INV-2024-001',
            vendorName: acme.name,
            totalAmount: 499.00,
            currency: 'USD',
            paymentScheduledDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            partnerId: acme.id,
            decisions: {
                create: [
                    {
                        agentId: 'capture-agent-01',
                        action: 'Extraction',
                        reasoning: 'High confidence OCR match',
                        confidenceScore: 0.99,
                        outcome: 'success',
                    },
                    {
                        agentId: 'classification-agent-01',
                        action: 'GL Coding',
                        reasoning: 'Matched historical pattern',
                        confidenceScore: 0.95,
                        outcome: '6001-Software',
                    }
                ]
            },
            complianceLogs: {
                create: [
                    { checkName: 'Tax ID Validation', status: 'PASS', details: 'Valid US Tax ID' }
                ]
            }
        },
    })

    // Invoice 2: High value, pending approval
    await prisma.invoice.create({
        data: {
            tenantId: 'demo_tenant',
            sourceType: 'api',
            status: 'pending_approval',
            invoiceNumber: 'SH-8832',
            vendorName: globalLogistics.name,
            totalAmount: 1250.00,
            currency: 'GBP',
            partnerId: globalLogistics.id,
            decisions: {
                create: [
                    {
                        agentId: 'risk-agent-01',
                        action: 'Risk Assessment',
                        reasoning: 'New vendor address detected',
                        confidenceScore: 0.85,
                        outcome: 'flagged',
                    }
                ]
            }
        },
    })

    // Invoice 3: Risky, flagged
    await prisma.invoice.create({
        data: {
            tenantId: 'demo_tenant',
            sourceType: 'upload',
            status: 'flagged',
            invoiceNumber: 'OFF-Q1',
            vendorName: officeSupplies.name,
            totalAmount: 234.50,
            currency: 'USD',
            partnerId: officeSupplies.id,
            decisions: {
                create: [
                    {
                        agentId: 'risk-agent-01',
                        action: 'Risk Assessment',
                        reasoning: 'High risk partner score (85)',
                        confidenceScore: 0.99,
                        outcome: 'block',
                    }
                ]
            }
        },
    })

    // Invoice 4: Touchless candidate
    await prisma.invoice.create({
        data: {
            tenantId: 'demo_tenant',
            sourceType: 'email',
            status: 'extracted',
            invoiceNumber: 'INV-2024-002',
            vendorName: acme.name,
            totalAmount: 1200.00,
            currency: 'USD',
            partnerId: acme.id,
        }
    })

    console.log('Seeding finished.')
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
