import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx ts-node scripts/make-admin.ts <email>')
    process.exit(1)
  }
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })
  console.log('Success:', user.email, '-> role:', user.role)
}

main().catch(console.error).finally(() => prisma.$disconnect())
