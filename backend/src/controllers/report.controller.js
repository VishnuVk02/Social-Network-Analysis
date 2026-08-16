const reportService = require('../services/report.service');

async function generateReport(req, res, next) {
  try {
    const report = await reportService.generateReport({
      user: req.user,
      sourcePlatform: req.body.sourcePlatform || req.body.reportType,
      sourceReference: req.body.sourceReference || req.body.targetReference,
      title: req.body.title,
      description: req.body.description,
      visibility: req.body.visibility,
      sections: req.body.sections
    });

    return res.status(201).json({
      success: true,
      message: 'Formal Telemetron report snapshot generated and saved successfully.',
      data: report
    });
  } catch (error) {
    next(error);
  }
}

async function getSavedReports(req, res, next) {
  try {
    const reports = await reportService.getSavedReports({
      user: req.user,
      search: req.query.search,
      categoryFilter: req.query.category,
      visibilityFilter: req.query.visibility
    });

    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await reportService.getReportById({
      reportId: req.params.reportId,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
}

async function deleteReport(req, res, next) {
  try {
    const result = await reportService.deleteReport({
      reportId: req.params.reportId,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function exportReportPdf(req, res, next) {
  try {
    const pdfBuffer = await reportService.generateReportPdf({
      reportId: req.params.reportId,
      user: req.user
    });

    const filename = `telemetron-report-${req.params.reportId.substring(0, 8)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateReport,
  getSavedReports,
  getReportById,
  deleteReport,
  exportReportPdf
};
