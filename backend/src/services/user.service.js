const bcrypt = require('bcrypt');
const { prisma } = require('../config/db');

async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      groups: {
        select: {
          group: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      groups: {
        select: {
          role: true,
          joinedAt: true,
          group: true
        }
      }
    }
  });

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  return user;
}

async function createUser(userData) {
  const { email, password, name, role } = userData;

  if (!email || !password || !name) {
    const error = new Error('Email, password, and name are required.');
    error.status = 400;
    throw error;
  }

  // Check unique email
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('Email is already registered.');
    error.status = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'ANALYST'
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });
}

async function updateUser(id, updateData) {
  const { email, password, name, role } = updateData;

  // Verify user exists
  await getUserById(id);

  const data = {};
  if (name) data.name = name;
  if (role) data.role = role;

  if (email) {
    // Check if email taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (existingUser) {
      const error = new Error('Email is already taken.');
      error.status = 409;
      throw error;
    }
    data.email = email;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(password, salt);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });
}

async function deleteUser(id) {
  await getUserById(id);

  return prisma.user.delete({
    where: { id }
  });
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
