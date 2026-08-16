const express = require('express');
const organizationController = require('../controllers/organization.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Employee Management
router.get('/employees', organizationController.getEmployees);
router.post('/employees', authorize('ADMIN'), organizationController.createEmployee);
router.delete('/employees/:id', authorize('ADMIN'), organizationController.deleteEmployee);

module.exports = router;
