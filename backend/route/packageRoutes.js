const express = require('express');
const router = express.Router();
const packageController = require('../controller/packageController');

router.get('/', packageController.getPackages);
router.post('/', packageController.createPackage);
router.get('/recommend', packageController.recommendPackages);
router.delete('/:id', packageController.deletePackage);

module.exports = router;
