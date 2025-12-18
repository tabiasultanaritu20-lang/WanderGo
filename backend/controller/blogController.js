// backend/controller/blogController.js
const Blog = require('../model/Blog');

// GET /api/blogs?category=...&location=...&page=1&limit=5
exports.getBlogs = async (req, res) => {
  try {
    const { category, location, page = 1, limit = 5 } = req.query;

    const filter = {};
    if (category) filter.categories = category;
    if (location) filter.location = location;

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);

    res.json({
      data: blogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
};

// POST /api/blogs -> create a new blog post
exports.createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);

    res.status(201).json({
      message: 'Blog created',
      data: blog,
    });
  } catch (err) {
    console.error('Error creating blog:', err);
    res
      .status(500)
      .json({ message: 'Server error while creating blog', error: err.message });
  }
};

// POST /api/blogs/seed -> insert some starter blogs (used earlier)
exports.seedBlogs = async (req, res) => {
  try {
    const existing = await Blog.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ message: 'Blogs already seeded' });
    }

    const seedData = [
      {
        title: 'A Rainy Day in Cox’s Bazar',
        content:
          'Spent the whole day walking on the beach with hot tea and street food. The waves were wild but the vibe was peaceful...',
        authorName: 'Tabia S.',
        location: 'Cox’s Bazar, Bangladesh',
        categories: ['Beach', 'Relax'],
        tags: ['Cox’s Bazar', 'Rain', 'Chill'],
      },
      {
        title: 'Budget Backpacking in Nepal',
        content:
          'Took local buses, stayed in homestays, and still managed to see incredible mountain views. Sharing my exact budget and route...',
        authorName: 'Ishaq A.',
        location: 'Pokhara, Nepal',
        categories: ['Adventure', 'Backpacking'],
        tags: ['Nepal', 'Budget', 'Trekking'],
      },
      {
        title: 'Dhaka Night Street Food Crawl',
        content:
          'From fuchka to tehari – here’s my mini guide to doing a safe but fun night food crawl in Dhaka with friends...',
        authorName: 'WanderGo Team',
        location: 'Dhaka, Bangladesh',
        categories: ['Food', 'City Life'],
        tags: ['Dhaka', 'Street Food'],
      },
    ];

    const blogs = await Blog.insertMany(seedData);
    res.status(201).json({ message: 'Seeded blogs', data: blogs });
  } catch (err) {
    console.error('Error seeding blogs:', err);
    res.status(500).json({ message: 'Server error while seeding blogs' });
  }
};

exports.ensureSeeded = async () => {
  try {
    const existing = await Blog.countDocuments();
    if (existing > 0) return;
    const seedData = [
      {
        title: 'A Rainy Day in Cox’s Bazar',
        content:
          'Spent the whole day walking on the beach with hot tea and street food. The waves were wild but the vibe was peaceful...',
        authorName: 'Tabia S.',
        location: 'Cox’s Bazar, Bangladesh',
        categories: ['Beach', 'Relax'],
        tags: ['Cox’s Bazar', 'Rain', 'Chill'],
      },
      {
        title: 'Budget Backpacking in Nepal',
        content:
          'Took local buses, stayed in homestays, and still managed to see incredible mountain views. Sharing my exact budget and route...',
        authorName: 'Ishaq A.',
        location: 'Pokhara, Nepal',
        categories: ['Adventure', 'Backpacking'],
        tags: ['Nepal', 'Budget', 'Trekking'],
      },
      {
        title: 'Dhaka Night Street Food Crawl',
        content:
          'From fuchka to tehari – here’s my mini guide to doing a safe but fun night food crawl in Dhaka with friends...',
        authorName: 'WanderGo Team',
        location: 'Dhaka, Bangladesh',
        categories: ['Food', 'City Life'],
        tags: ['Dhaka', 'Street Food'],
      },
    ];
    await Blog.insertMany(seedData);
    console.log('Seeded default blogs');
  } catch (err) {
    console.error('ensureSeeded blogs failed:', err.message);
  }
};
