const express = require("express");
const router = express.Router();

const blogController = require("../controller/blogController");
const upload = require("../middleware/imageUpload");
const { authMiddleware } = require("../middleware/authMiddleware");

// =============================================
// 1. SPECIFIC ROUTES (MUST BE DEFINED FIRST)
// =============================================

// This must be above /:id, otherwise "saved-blogs" is treated as an ID
router.get("/saved-blogs", authMiddleware, blogController.getSavedBlogs);

router.get("/", blogController.getBlogs);


// =============================================
// 2. DYNAMIC ROUTES (GENERIC ID HANDLERS)
// =============================================

// If this was at the top, it would steal the request!
router.get("/:id", blogController.getBlogById);

// PROTECTED ROUTES
router.post("/:id/save", authMiddleware, blogController.toggleSaveBlog);
router.post("/", authMiddleware, upload.array("images", 8), blogController.createBlog);
router.put("/:id", authMiddleware, upload.array("images", 8), blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

router.post("/:id/like", authMiddleware, blogController.toggleLike);
router.post("/:id/share", authMiddleware, blogController.shareBlog);

router.post("/:id/comments", authMiddleware, blogController.addComment);
router.delete("/:id/comments/:commentId", authMiddleware, blogController.deleteComment);

module.exports = router;
