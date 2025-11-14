import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBlogBanner = () => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    // later this can go to actual "create blog" page
    // for now, requirement: send them to login/signup flow
    navigate('/login');
  };

  return (
    <section className="create-blog-banner glass-card">
      <div className="create-blog-avatar">✈</div>
      <div className="create-blog-main">
        <p className="create-blog-text">
          Share a new travel memory, itinerary or tip with the WanderGo community.
        </p>
        <div className="create-blog-buttons">
          <button onClick={handleCreateClick}>➕ Create travel blog</button>
          <button disabled>📷 Add photos (coming soon)</button>
          <button disabled>🎬 Add reel (coming soon)</button>
        </div>
      </div>
    </section>
  );
};

export default CreateBlogBanner;