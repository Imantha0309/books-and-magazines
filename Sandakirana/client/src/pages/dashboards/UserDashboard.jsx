import React from 'react';
import PostFeed from '../../components/PostFeed';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';

const UserDashboard = () => {
  const { user } = useAuth();
  const {
    posts,
    loading,
    error,
    refresh,
    togglePostLike,
    addComment,
    toggleCommentLike,
    addReply,
    toggleReplyLike,
    updatePost,
    deletePost,
    downloadPostReport,
    updateComment,
    deleteComment,
    updateReply,
    deleteReply,
  } = usePosts(user);

  return (
    <section className="page centered">
      <div className="panel full-width">
        <h1 className="title">Reader Dashboard</h1>
        <p className="subtitle">
          {user?.name
            ? `Hello ${user.name}, react to the latest author posts and join the discussion.`
            : 'Welcome back.'}
        </p>
        <PostFeed
          currentUser={user}
          posts={posts}
          loading={loading}
          error={error}
          onRetry={refresh}
          onTogglePostLike={togglePostLike}
          onAddComment={addComment}
          onToggleCommentLike={toggleCommentLike}
          onAddReply={addReply}
          onToggleReplyLike={toggleReplyLike}
          onUpdatePost={updatePost}
          onDeletePost={deletePost}
          onDownloadReport={downloadPostReport}
          onUpdateComment={updateComment}
          onDeleteComment={deleteComment}
          onUpdateReply={updateReply}
          onDeleteReply={deleteReply}
        />
      </div>
    </section>
  );
};

export default UserDashboard;
