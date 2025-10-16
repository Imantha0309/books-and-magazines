import React from 'react';
import { PostPreviewCard } from '../../molecules/home/PostPreviewCard';

const EmptyState = () => (
  <div className="home-preview-empty">
    <p>No posts yet. Check back soon to see what our authors share.</p>
  </div>
);

export const HomeHighlights = ({ posts, loading, error }) => {
  if (loading) {
    return (
      <div className="home-preview-empty">
        <p>Loading community highlights…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-preview-empty">
        <p>{error}</p>
      </div>
    );
  }

  if (!posts?.length) {
    return <EmptyState />;
  }

  return (
    <div className="home-preview-grid">
      {posts.map((post) => (
        <PostPreviewCard key={post.id} post={post} />
      ))}
    </div>
  );
};
