
const express = require('express');
const router = express.Router();
const blogController = require('../controller/blogController');

// GET /api/blogs
router.get('/', blogController.getBlogs);

// POST /api/blogs
router.post('/', blogController.createBlog);

// POST /api/blogs/seed
router.post('/seed', blogController.seedBlogs);

module.exports = router;
