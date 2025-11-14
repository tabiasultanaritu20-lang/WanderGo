import React from 'react';

const BlogCard = ({ blog }) => {
  const {
    title,
    authorName,
    location,
    categories = [],
    tags = [],
    coverImageUrl,
    createdAt,
  } = blog;

  // backend uses "body" for content, but we also support "content" just in case
  const textContent = blog.content || blog.body || '';

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : 'Recently';

  const shortContent =
    textContent && textContent.length > 260
      ? textContent.slice(0, 260) + '…'
      : textContent || 'No content yet.';

  const categoryList = [
    ...(categories || []),
    ...(tags || []),
  ];

  const handleLike = () => {
    console.log('Like clicked for blog:', blog._id);
  };

  const handleComment = () => {
    console.log('Comment clicked for blog:', blog._id);
  };

  const handleShare = () => {
    console.log('Share clicked for blog:', blog._id);
  };

  return (
    <article className="blog-card glass-card">
      <div className="blog-card-header">
        <div className="blog-avatar-circle">
          {authorName ? authorName.charAt(0).toUpperCase() : 'T'}
        </div>
        <div>
          <h2 className="blog-title">{title}</h2>
          <p className="blog-meta">
            <span>{authorName || 'Anonymous traveler'}</span>
            <span>• {location || 'Somewhere on Earth'}</span>
            <span>• {formattedDate}</span>
          </p>
        </div>
      </div>

      {coverImageUrl && (
        <div className="blog-cover-wrapper">
          <img src={coverImageUrl} alt={title} className="blog-cover-img" />
        </div>
      )}

      <p className="blog-content">{shortContent}</p>

      {categoryList.length > 0 && (
        <div className="blog-chip-row">
          {categoryList.map((cat) => (
            <span key={cat} className="blog-chip">
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="blog-actions">
        <button onClick={handleLike}>👍 Like</button>
        <button onClick={handleComment}>💬 Comment</button>
        <button onClick={handleShare}>↗ Share</button>
      </div>
    </article>
  );
};

export default BlogCard;