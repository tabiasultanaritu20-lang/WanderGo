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

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getBlogs = async (req, res) => {
  try {
    const { category = "", location = "", page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category && category.trim()) {
      const cat = escapeRegex(category.trim());
      filter.categories = { $elemMatch: { $regex: cat, $options: "i" } };
    }
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
    res.status(500).json({ message: "Server error while fetching blogs" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching blog" });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { id: userId, name, email } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Extract fields from body
    // IMPORTANT: We prefer the 'authorName' sent from the frontend form.
    // If it's empty, we fallback to the user's profile name.
    const { title, content, location, categories, authorName } = req.body;
    
    const finalAuthorName = (authorName && authorName.trim()) 
        ? authorName 
        : (name || email || "Anonymous Traveler");

    const categoriesArr = categories ? categories.split(",").map((s) => s.trim()).filter(Boolean) : [];

    // Handle Images
    const imageUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);
    
    // The first image in the list is the Cover. 
    // The rest (plus the cover) are the gallery.
    const coverImageUrl = imageUrls.length > 0 ? imageUrls[0] : "";
    
    const blog = await Blog.create({
      title,
      content,
      author: userId,
      authorName: finalAuthorName, // Use the determined name
      location,
      categories: categoriesArr,
      coverImageUrl,
      images: imageUrls, 
    });

    res.status(201).json({ message: "Blog created", data: blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating blog" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id: userId, role } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (!isOwnerOrAdmin(blog, userId, role)) return res.status(403).json({ message: "Not allowed" });

    const { title, content, authorName, location, categories } = req.body;

    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (authorName !== undefined) blog.authorName = authorName;
    if (location !== undefined) blog.location = location;
    if (categories !== undefined) {
      blog.categories = typeof categories === "string" ? categories.split(",").map(c => c.trim()) : categories;
    }

    // Append new images if uploaded
    if (req.files && req.files.length) {
      const newUrls = req.files.map((f) => `/uploads/${f.filename}`);
      
      // Add to existing gallery
      blog.images = [...(blog.images || []), ...newUrls];

      // If no cover image existed, make the first new one the cover
      if (!blog.coverImageUrl) {
        blog.coverImageUrl = newUrls[0];
      }
    }

    await blog.save();
    res.json({ message: "Blog updated", data: blog });
  } catch (err) {
    res.status(500).json({ message: "Server error while updating blog" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id: userId, role } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (!isOwnerOrAdmin(blog, userId, role)) return res.status(403).json({ message: "Not allowed" });
    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error while deleting blog" });
  }
};

exports.getSavedBlogs = async (req, res) => {
  try {
    const { id: userId } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(userId).populate("savedBlogs");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, data: user.savedBlogs || [] });
  } catch (err) {
    console.error("Error fetching saved blogs:", err);
    res.status(500).json({ message: "Server error" });
  }
};

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
    res.status(500).json({ message: "Server error" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id: userId } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { text } = req.body;
    const blog = await Blog.findById(req.params.id);
    const user = await User.findById(userId).select("name");
    const comment = { user: userId, name: user?.name || "Traveler", text };
    blog.comments.push(comment);
    await blog.save();
    res.status(201).json({ message: "Comment added", data: comment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { id: userId, role } = getUserFromReq(req);
    const blog = await Blog.findById(id);
    blog.comments = blog.comments.filter((c) => String(c._id) !== String(commentId));
    await blog.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.shareBlog = async (req, res) => {
  try {
    const { id: userId } = getUserFromReq(req);
    const blog = await Blog.findById(req.params.id);
    blog.shares = blog.shares || [];
    if (!blog.shares.some((id) => id.toString() === String(userId))) {
      blog.shares.push(new mongoose.Types.ObjectId(userId));
    }
    await blog.save();
    res.json({ message: "Blog shared", sharesCount: blog.shares.length });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleSaveBlog = async (req, res) => {
  try {
    const { id: userId } = getUserFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const blogId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.savedBlogs) user.savedBlogs = [];
    const isSaved = user.savedBlogs.includes(blogId);
    if (isSaved) {
      user.savedBlogs = user.savedBlogs.filter((id) => id.toString() !== blogId);
    } else {
      user.savedBlogs.push(blogId);
    }
    await user.save();
    res.json({ message: isSaved ? "Removed from saved" : "Saved for later", isSaved: !isSaved });
  } catch (err) {
    res.status(500).json({ message: "Server error while saving blog" });
  }
};