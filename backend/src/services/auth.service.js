const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

/**
 * Registers an Individual user or Organization + Organization Admin.
 */
async function registerUser(payload) {
  const { 
    accountType = 'INDIVIDUAL',
    name,
    email,
    password,
    orgName,
    orgEmail,
    orgType,
    industry,
    country,
    orgSize,
    adminName,
    adminEmail
  } = payload;

  const targetEmail = accountType === 'ORGANIZATION' ? (adminEmail || email) : email;
  const targetName = accountType === 'ORGANIZATION' ? (adminName || name) : name;

  if (!targetEmail || !password || !targetName) {
    const error = new Error('Name, email, and password are required fields.');
    error.status = 400;
    throw error;
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.status = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user;
  let organization = null;

  if (accountType === 'ORGANIZATION') {
    if (!orgName) {
      const error = new Error('Organization name is required for organization registration.');
      error.status = 400;
      throw error;
    }

    // Atomic transaction: Create Organization + Admin User
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          email: orgEmail || targetEmail,
          type: orgType || 'Company',
          industry: industry || 'Technology',
          country: country || 'United States',
          size: orgSize || '11-50'
        }
      });

      const adminUser = await tx.user.create({
        data: {
          name: targetName,
          email: targetEmail,
          password: hashedPassword,
          role: 'ADMIN',
          accountType: 'ORGANIZATION',
          organizationId: org.id
        }
      });

      return { org, adminUser };
    });

    organization = result.org;
    user = result.adminUser;
  } else {
    // Individual User Registration
    user = await prisma.user.create({
      data: {
        name: targetName,
        email: targetEmail,
        password: hashedPassword,
        role: 'USER',
        accountType: 'INDIVIDUAL',
        organizationId: null
      }
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      accountType: user.accountType,
      organizationId: user.organizationId
    },
    process.env.JWT_SECRET || 'super_secret_social_media_analytics_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountType: user.accountType,
      organizationId: user.organizationId,
      organization
    }
  };
}

/**
 * Authenticates user login and returns full user object.
 */
async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.status = 400;
    throw error;
  }

  // Find user with Organization relation
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true }
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  // Generate token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      accountType: user.accountType,
      organizationId: user.organizationId
    },
    process.env.JWT_SECRET || 'super_secret_social_media_analytics_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountType: user.accountType,
      organizationId: user.organizationId,
      organization: user.organization
    }
  };
}

module.exports = {
  registerUser,
  loginUser
};
