const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Updating user credentials in database...');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Update all users' password to 'password123'
  await prisma.user.updateMany({
    data: {
      password: hashedPassword
    }
  });

  const users = await prisma.user.findMany({
    include: {
      organization: true
    }
  });

  console.log('\n==================================================');
  console.log('TELEMETRON USER CREDENTIALS UPDATED');
  console.log('==================================================\n');

  users.forEach((u, idx) => {
    console.log(`[User #${idx + 1}]`);
    console.log(`- Account Type: ${u.accountType}`);
    console.log(`- Role:         ${u.role}`);
    console.log(`- Name:         ${u.name}`);
    console.log(`- Email:        ${u.email}`);
    console.log(`- Password:     password123`);
    console.log(`- Organization: ${u.organization ? u.organization.name : 'N/A'}`);
    console.log('--------------------------------------------------');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
