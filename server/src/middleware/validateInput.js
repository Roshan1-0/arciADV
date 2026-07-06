const { body } = require('express-validator');

exports.validateArchitectureInput = [
  body('cloud_provider')
    .isIn(['AWS', 'Azure'])
    .withMessage('Cloud provider must be AWS or Azure'),

  body('app_type')
    .notEmpty()
    .withMessage('Application type is required'),

  body('users_daily')
    .notEmpty()
    .withMessage('Expected daily users is required'),

  body('db_type')
    .isIn(['SQL', 'NoSQL', 'None'])
    .withMessage('Database type must be SQL, NoSQL, or None'),

  body('region')
    .notEmpty()
    .withMessage('Region is required'),

  body('high_availability')
    .isIn(['Yes', 'No'])
    .withMessage('High availability must be Yes or No'),

  body('security_level')
    .notEmpty()
    .withMessage('Security level is required'),

  body('uptime')
    .optional()
    .isFloat({ min: 90, max: 100 })
    .withMessage('Uptime must be between 90 and 100'),

  body('runtime_months')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Runtime months must be between 1 and 120'),
];
