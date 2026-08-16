const bcrypt = require('bcrypt');
const { prisma } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Creates an employee user in the Admin's organization.
 */
async function createEmployee({ adminUser, name, email, password, groupId }) {
  if (adminUser.accountType !== 'ORGANIZATION' || adminUser.role !== 'ADMIN') {
    const error = new Error('Forbidden: Only Organization Administrators can add employee accounts.');
    error.status = 403;
    throw error;
  }

  if (!adminUser.organizationId) {
    const error = new Error('Admin is not associated with an organization.');
    error.status = 400;
    throw error;
  }

  if (!name || !email || !password) {
    const error = new Error('Full Name, Email, and Password are required for employee creation.');
    error.status = 400;
    throw error;
  }

  // Check existing user email
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.status = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const employee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ANALYST',
      accountType: 'ORGANIZATION',
      organizationId: adminUser.organizationId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      organizationId: true,
      createdAt: true
    }
  });

  // Assign to group if specified
  if (groupId) {
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: adminUser.organizationId
      }
    });

    if (group) {
      await prisma.userGroup.create({
        data: {
          userId: employee.id,
          groupId: group.id,
          role: 'MEMBER'
        }
      });
    }
  }

  logger.info(`Organization Admin (${adminUser.email}) created employee (${employee.email}) in Org ${adminUser.organizationId}`);

  return employee;
}

/**
 * Returns all employees belonging to the requesting user's organization.
 */
async function getEmployees(user) {
  if (user.accountType !== 'ORGANIZATION' || !user.organizationId) {
    const error = new Error('Forbidden: Employee roster is only available for Organization accounts.');
    error.status = 403;
    throw error;
  }

  const employees = await prisma.user.findMany({
    where: {
      organizationId: user.organizationId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accountType: true,
      createdAt: true,
      groups: {
        include: {
          group: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    createdAt: emp.createdAt,
    groups: emp.groups.map(g => g.group)
  }));
}

/**
 * Deletes an employee within the requesting Admin's organization.
 */
async function deleteEmployee({ adminUser, employeeId }) {
  if (adminUser.accountType !== 'ORGANIZATION' || adminUser.role !== 'ADMIN') {
    const error = new Error('Forbidden: Only Organization Administrators can remove employees.');
    error.status = 403;
    throw error;
  }

  const employee = await prisma.user.findFirst({
    where: {
      id: employeeId,
      organizationId: adminUser.organizationId
    }
  });

  if (!employee) {
    const error = new Error('Employee not found in your organization.');
    error.status = 404;
    throw error;
  }

  if (employee.id === adminUser.id) {
    const error = new Error('Cannot delete your own Organization Admin account.');
    error.status = 400;
    throw error;
  }

  await prisma.user.delete({
    where: { id: employeeId }
  });

  logger.info(`Organization Admin (${adminUser.email}) removed employee (${employee.email})`);

  return { id: employeeId };
}

module.exports = {
  createEmployee,
  getEmployees,
  deleteEmployee
};
