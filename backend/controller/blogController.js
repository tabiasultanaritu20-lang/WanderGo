const User = require("../model/userModel");
const Blog = require("../model/Blog");
const mongoose = require("mongoose");

const getUserFromReq = (req) => {
  const u = req.user || {};
  const p = u.playLoad || u.payload || u;
  return {
    id: p.id || p._id || u.id || u._id || null,
    role: p.role || u.role || null,
    name: p.name || p.fullName || p.username || null,
    email: p.email || u.email || null,
  };
};

const isOwnerOrAdmin = (blog, userId, role) => {
  if (!blog?.author) return false;
  if (role === "admin") return true;
  return blog.author.toString() === String(userId);
};

// GET /api/blogs?category=&location=
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/blogs?category=&location=
exports.getBlogs = async (req, res) => {
  try {
    const { category = "", location = "", page = 1, limit = 10 } = req.query;

    const filter = {};

    // CATEGORY: partial match, case-insensitive, works with categories array
    if (category && category.trim()) {
      const cat = escapeRegex(category.trim());
      filter.categories = { $elemMatch: { $regex: cat, $options: "i" } };
    }

    // LOCATION: partial match, case-insensitive
    // Works if user types only city OR only country OR both
    if (location && location.trim()) {
      const loc = escapeRegex(location.trim());
      filter.location = { $regex: loc, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);

    res.json({
      data: blogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: "Server error while fetching blogs" });
  }
};

// GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    console.error("Error fetching blog by id:", err);
    res.status(500).json({ message: "Server error while fetching blog" });
  }
};

// POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    const { id: userId, name, email } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, content, authorName, location, categories } = req.body;

    const categoriesArr = categories
      ? categories.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const blog = await Blog.create({
      title,
      content,
      author: userId, // ✅ owner saved
      authorName: (authorName && authorName.trim()) || name || email || "Anonymous Traveler",
      location,
      categories: categoriesArr,
      coverImageUrl,
    });

    res.status(201).json({ message: "Blog created", data: blog });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: "Server error while creating blog", error: err.message });
  }
};

// PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const { id: userId, role } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // ✅ enforce ownership
    if (!isOwnerOrAdmin(blog, userId, role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { title, content, authorName, location, categories } = req.body;

    let categoriesArr;
    if (typeof categories === "string") {
      categoriesArr = categories.split(",").map((c) => c.trim()).filter(Boolean);
    } else if (Array.isArray(categories)) {
      categoriesArr = categories;
    }

    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (authorName !== undefined) blog.authorName = authorName;
    if (location !== undefined) blog.location = location;
    if (categoriesArr !== undefined) blog.categories = categoriesArr;
    if (req.file) blog.coverImageUrl = `/uploads/${req.file.filename}`;

    await blog.save();
    res.json({ message: "Blog updated", data: blog });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: "Server error while updating blog" });
  }
};

// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const { id: userId, role } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // ✅ enforce ownership
    if (!isOwnerOrAdmin(blog, userId, role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ message: "Server error while deleting blog" });
  }
};

// POST /api/blogs/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const { id: userId } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const idx = (blog.likes || []).findIndex((id) => id.toString() === String(userId));
    let liked;

    if (idx === -1) {
      blog.likes.push(new mongoose.Types.ObjectId(userId));
      liked = true;
    } else {
      blog.likes.splice(idx, 1);
      liked = false;
    }

    await blog.save();
    res.json({ liked, likesCount: blog.likes.length });
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ message: "Server error while liking blog" });
  }
};

// POST /api/blogs/:id/comments
exports.addComment = async (req, res) => {
  try {
    const userId =
      req.user.playLoad?.id ||
      req.user.id ||
      req.user._id;

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // 🔹 Fetch user to get NAME (not email)
    const user = await User.findById(userId).select("name");
    const commenterName = user?.name || "Traveler";

    const comment = {
      user: userId,
      name: commenterName,
      text,
    };

    blog.comments.push(comment);
    await blog.save();

    res.status(201).json({
      message: "Comment added",
      data: comment,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error while adding comment" });
  }
};

// DELETE /api/blogs/:id/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { id: userId, role } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id, commentId } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const c = (blog.comments || []).find((x) => x._id.toString() === commentId);
    if (!c) return res.status(404).json({ message: "Comment not found" });

    if (role !== "admin" && c.user?.toString() !== String(userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    blog.comments = blog.comments.filter((x) => x._id.toString() !== commentId);
    await blog.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
};

// POST /api/blogs/:id/share
exports.shareBlog = async (req, res) => {
  try {
    const { id: userId } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.shares = blog.shares || [];
    if (!blog.shares.some((id) => id.toString() === String(userId))) {
      blog.shares.push(new mongoose.Types.ObjectId(userId));
    }

    await blog.save();
    res.json({ message: "Blog shared", sharesCount: blog.shares.length });
  } catch (err) {
    console.error("Error sharing blog:", err);
    res.status(500).json({ message: "Server error while sharing blog" });
  }
};
