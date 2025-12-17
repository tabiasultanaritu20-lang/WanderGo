const Blog = require("../model/Blog");
const mongoose = require("mongoose");

// helpers
const getUserId = (req) =>
  req.user?.id || req.user?._id || req.user?.playLoad?.id || null;

const getUserName = (req) =>
  req.user?.name || req.user?.playLoad?.name || "Traveler";

// GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { category, location } = req.query;

    const filter = {};
    if (category) filter.categories = category;
    if (location) filter.location = location;

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    res.json({ data: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching blogs" });
  }
};

// GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ data: blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching blog" });
  }
};

// POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    const { title, content, authorName, location, categories } = req.body;

    const categoriesArr = categories
      ? categories.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const blog = await Blog.create({
      title,
      content,
      authorName: authorName?.trim() || "Anonymous Traveler",
      location: location?.trim() || "Unknown",
      categories: categoriesArr,
      coverImageUrl,
    });

    res.status(201).json({ message: "Blog created", data: blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating blog" });
  }
};

// PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, authorName, location, categories } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (authorName !== undefined)
      update.authorName = authorName?.trim() || "Anonymous Traveler";
    if (location !== undefined)
      update.location = location?.trim() || "Unknown";

    if (categories !== undefined) {
      update.categories = typeof categories === "string"
        ? categories.split(",").map((c) => c.trim()).filter(Boolean)
        : categories;
    }

    if (req.file) {
      update.coverImageUrl = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog updated", data: blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating blog" });
  }
};

// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting blog" });
  }
};

// POST /api/blogs/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const idx = blog.likes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    if (idx === -1) blog.likes.push(new mongoose.Types.ObjectId(userId));
    else blog.likes.splice(idx, 1);

    await blog.save();
    res.json({ data: blog, likesCount: blog.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while liking blog" });
  }
};

// POST /api/blogs/:id/comments
exports.addComment = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { text } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ message: "Comment required" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = {
      user: userId,
      name: getUserName(req),
      text: text.trim(),
    };

    blog.comments.push(comment);
    await blog.save();

    res.status(201).json({ data: blog.comments.at(-1) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding comment" });
  }
};

// DELETE /api/blogs/:id/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.comments = blog.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await blog.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
};

// POST /api/blogs/:id/share
exports.shareBlog = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (!blog.shares.includes(userId)) {
      blog.shares.push(new mongoose.Types.ObjectId(userId));
      await blog.save();
    }

    res.json({ sharesCount: blog.shares.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while sharing blog" });
  }
};
