import React from 'react';
import { FeedFallback } from './FeedFallback';
import { PostCard } from './PostCard';

export const PostFeedView = ({ controller }) => {
  const { loading, error, onRetry, posts, currentUser } = controller;

  if (loading) {
    return <FeedFallback variant="loading" />;
  }

  if (error) {
    return (
      <FeedFallback
        variant="error"
        errorMessage={error}
        onRetry={onRetry ? () => onRetry() : undefined}
      />
    );
  }

  if (!posts.length) {
    return <FeedFallback variant="empty" />;
  }

  return (
    <div className="post-list">
      {posts.map((post) => {
        const postLiked = post.likes?.includes(currentUser?.id);
        const isEditing = controller.isEditingPost(post.id);
        const postDraft = controller.getPostDraft(post.id, post.content);
        const postPreview = controller.getPostPreview(post.id, post.image);

        return (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            postLiked={postLiked}
            canManagePost={controller.canManagePost(post)}
            isEditing={isEditing}
            postDraft={postDraft}
            setPostDraft={controller.setPostDraft}
            postPreview={postPreview}
            isDownloading={controller.isDownloading(post.id)}
            controller={controller}
          />
        );
      })}
    </div>
  );
};
