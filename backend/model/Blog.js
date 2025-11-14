const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      default: 'Anonymous Traveler',
    },
    location: {
      type: String,
      default: 'Unknown',
    },
    categories: {
      type: [String],
      default: [],
    },
    coverImageUrl: {
      type: String,
      default:
        'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
    },
    // For future features
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;