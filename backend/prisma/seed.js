const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding / Updating Telemetron User Credentials...');

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // 1. Ensure Organization "MedioCritics" exists
  let org = await prisma.organization.findFirst({
    where: { name: 'MedioCritics' }
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'MedioCritics',
        email: 'info@mediocritics.com',
        type: 'Company',
        industry: 'Technology',
        country: 'United States',
        size: '11-50'
      }
    });
  }

  // 2. Organization Admin
  await prisma.user.upsert({
    where: { email: 'nitishsigma@gmail.com' },
    update: {
      password: defaultPassword,
      name: 'Nitish J',
      role: 'ADMIN',
      accountType: 'ORGANIZATION',
      organizationId: org.id
    },
    create: {
      name: 'Nitish J',
      email: 'nitishsigma@gmail.com',
      password: defaultPassword,
      role: 'ADMIN',
      accountType: 'ORGANIZATION',
      organizationId: org.id
    }
  });

  // 3. Organization Employee
  await prisma.user.upsert({
    where: { email: 'trichitrampazham@gmail.com' },
    update: {
      password: defaultPassword,
      name: 'pazham',
      role: 'ANALYST',
      accountType: 'ORGANIZATION',
      organizationId: org.id
    },
    create: {
      name: 'pazham',
      email: 'trichitrampazham@gmail.com',
      password: defaultPassword,
      role: 'ANALYST',
      accountType: 'ORGANIZATION',
      organizationId: org.id
    }
  });

  // 4. Individual User
  await prisma.user.upsert({
    where: { email: 'kalim@shah.com' },
    update: {
      password: defaultPassword,
      name: 'Kalim Shah',
      role: 'USER',
      accountType: 'INDIVIDUAL',
      organizationId: null
    },
    create: {
      name: 'Kalim Shah',
      email: 'kalim@shah.com',
      password: defaultPassword,
      role: 'USER',
      accountType: 'INDIVIDUAL',
      organizationId: null
    }
  });

  console.log('Successfully updated/seeded user credentials.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
