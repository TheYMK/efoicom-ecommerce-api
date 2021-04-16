const { check } = require('express-validator');

exports.blogcategoryCreateValidator = [ check('name').not().isEmpty().withMessage('Name is required') ];
