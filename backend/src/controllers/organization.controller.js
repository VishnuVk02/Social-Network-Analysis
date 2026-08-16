const organizationService = require('../services/organizationService');

async function createEmployee(req, res, next) {
  try {
    const employee = await organizationService.createEmployee({
      adminUser: req.user,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      groupId: req.body.groupId
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      employee
    });
  } catch (error) {
    next(error);
  }
}

async function getEmployees(req, res, next) {
  try {
    const employees = await organizationService.getEmployees(req.user);
    return res.status(200).json({
      success: true,
      employees
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const result = await organizationService.deleteEmployee({
      adminUser: req.user,
      employeeId: req.params.id
    });
    return res.status(200).json({
      success: true,
      message: 'Employee removed successfully.',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEmployee,
  getEmployees,
  deleteEmployee
};
