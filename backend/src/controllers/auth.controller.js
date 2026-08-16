const authService = require('../services/auth.service');
const logger = require('../utils/logger');

async function register(req, res, next) {
  try {
    logger.info(`Registration attempt for email: ${req.body.email || req.body.adminEmail} (Type: ${req.body.accountType})`);
    
    const result = await authService.registerUser(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Account registration completed successfully.',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);
    
    const result = await authService.loginUser({ email, password });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe
};
