const express = require("express");
const router = express.Router();

const blogController = require("../controller/blogController");
const upload = require("../middleware/upload");
const { authMiddleware } = require("../middleware/authMiddleware");

// PUBLIC
router.get("/", blogController.getBlogs);
router.get("/:id", blogController.getBlogById);

// PROTECTED
router.post("/", authMiddleware, upload.array("images", 8), blogController.createBlog);
router.put("/:id", authMiddleware, upload.array("images", 8), blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

router.post("/:id/like", authMiddleware, blogController.toggleLike);
router.post("/:id/share", authMiddleware, blogController.shareBlog);

router.post("/:id/comments", authMiddleware, blogController.addComment);
router.delete("/:id/comments/:commentId", authMiddleware, blogController.deleteComment);

module.exports = router;
