import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimestamp } from '../../organisms/feed/feedUtils';

const buildExcerpt = (content) => {
  if (!content) {
    return 'No description available.';
  }
  if (content.length <= 160) {
    return content;
  }
  return `${content.slice(0, 157).trim()}…`;
};

export const PostPreviewCard = ({ post }) => {
  if (!post) {
    return null;
  }

  const authorName = post.author?.name || 'Unknown author';
  const publishedAt = post.createdAt ? formatTimestamp(post.createdAt) : 'Recently shared';
  const excerpt = buildExcerpt(post.content);

  return (
    <article className="home-preview-card">
      <div className="home-preview-meta">
        <span className="home-preview-author">{authorName}</span>
        <time className="home-preview-date">{publishedAt}</time>
      </div>
      <p className="home-preview-content">{excerpt}</p>
      <div className="home-preview-footer">
        <span className="home-preview-reactions">
          {post.likes?.length || 0} {post.likes?.length === 1 ? 'reaction' : 'reactions'}
        </span>
        <Link className="home-preview-link" to="/login">
          Join the discussion
        </Link>
      </div>
    </article>
  );
};
