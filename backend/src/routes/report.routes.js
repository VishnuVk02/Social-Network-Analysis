const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/generate', reportController.generateReport);
router.get('/', reportController.getSavedReports);
router.get('/:reportId', reportController.getReportById);
router.delete('/:reportId', reportController.deleteReport);
router.get('/:reportId/pdf', reportController.exportReportPdf);

module.exports = router;
