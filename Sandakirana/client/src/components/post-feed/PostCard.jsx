import React from 'react';
import { CommentThread } from './CommentThread';
import { formatTimestamp } from './feedUtils';

export const PostCard = ({
  post,
  currentUser,
  postLiked,
  canManagePost,
  isEditing,
  postDraft,
  setPostDraft,
  postPreview,
  isDownloading,
  controller,
}) => {
  const {
    handlePostLike,
    beginPostEdit,
    cancelPostEdit,
    savePostEdit,
    handlePostImageChange,
    clearPostImage,
    handlePostDelete,
    handleDownloadReport,
    getMessage,
    handleCommentSubmit,
    handleCommentLike,
    toggleReplyBox,
    handleReplySubmit,
    handleReplyLike,
    beginCommentEdit,
    cancelCommentEdit,
    saveCommentEdit,
    deleteComment,
    beginReplyEdit,
    cancelReplyEdit,
    saveReplyEdit,
    deleteReply,
    getCommentDraft,
    setCommentDraft,
    isReplyBoxOpen,
    getReplyDraft,
    setReplyDraft,
    isCommentEditing,
    getCommentEditDraft,
    setCommentEditDraft,
    isReplyEditing,
    getReplyEditDraft,
    setReplyEditDraft,
    clearMessage,
    getPostFileLabel,
  } = controller;

  const commentDraft = getCommentDraft(post.id);

  const focusCommentInput = () => {
    const input = document.getElementById(`comment-input-${post.id}`);
    if (input) {
      input.focus();
    }
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-meta">
          <span className="post-author">{post.author?.name || 'Unknown author'}</span>
          <time className="post-date">{formatTimestamp(post.createdAt)}</time>
        </div>
        <div className="post-meta">
          <span className="post-like-count">
            {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
          </span>
          <span className="post-comment-count">
            {post.comments?.length || 0}{' '}
            {post.comments?.length === 1 ? 'comment' : 'comments'}
          </span>
          {canManagePost ? (
            <div className="post-manage">
              {!isEditing ? (
                <>
                  {controller.hasDownloadReport && (
                    <button
                      className="link-button"
                      type="button"
                      onClick={() => handleDownloadReport(post.id)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? 'Preparing report...' : 'Download report'}
                    </button>
                  )}
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => beginPostEdit(post)}
                  >
                    Edit
                  </button>
                  <button
                    className="link-button danger"
                    type="button"
                    onClick={() => handlePostDelete(post.id)}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  className="link-button"
                  type="button"
                  onClick={() => cancelPostEdit(post.id)}
                >
                  Cancel edit
                </button>
              )}
            </div>
          ) : null}
        </div>
      </header>
      {getMessage(`post-manage-${post.id}`) ? (
        <p className="inline-error">{getMessage(`post-manage-${post.id}`)}</p>
      ) : null}
      {getMessage(`post-report-${post.id}`) ? (
        <p className="inline-error">{getMessage(`post-report-${post.id}`)}</p>
      ) : null}
      {!isEditing ? (
        <>
          {postPreview ? (
            <div className="post-image">
              <img src={postPreview} alt="Post" />
            </div>
          ) : null}
          <p className="post-content">{post.content}</p>
        </>
      ) : (
        <div className="post-edit-form">
          <label className="form-label" htmlFor={`post-edit-content-${post.id}`}>
            Post content
          </label>
          <textarea
            id={`post-edit-content-${post.id}`}
            className="form-input text-area"
            value={postDraft}
            onChange={(event) => setPostDraft(post.id, event.target.value)}
          />
          <label className="form-label" htmlFor={`post-edit-image-${post.id}`}>
            Featured image
          </label>
          <div className="file-upload-wrapper">
            <input
              id={`post-edit-image-${post.id}`}
              type="file"
              accept="image/*"
              className="file-input-hidden"
              onChange={(event) =>
                handlePostImageChange(post.id, event.target.files?.[0] || null, event.target)
              }
            />
            <div className="file-upload-control">
              <span className="file-upload-button">Choose image</span>
              <span className="file-upload-text">
                {getPostFileLabel(post.id, !!post.image)}
              </span>
            </div>
          </div>
          {postPreview ? (
            <div className="image-preview">
              <img src={postPreview} alt="Post preview" />
            </div>
          ) : null}
          <div className="post-actions">
            {postPreview ? (
              <button
                className="button outline"
                type="button"
                onClick={() => clearPostImage(post.id)}
              >
                Remove image
              </button>
            ) : null}
            <button
              className="button outline"
              type="button"
              onClick={() => cancelPostEdit(post.id)}
            >
              Cancel
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => savePostEdit(post.id)}
            >
              Save changes
            </button>
          </div>
          {getMessage(`post-edit-${post.id}`) ? (
            <p className="inline-error">{getMessage(`post-edit-${post.id}`)}</p>
          ) : null}
        </div>
      )}
      <div className="post-actions-bar">
        <button
          className={`interaction-button ${postLiked ? 'active' : ''}`}
          type="button"
          onClick={() => handlePostLike(post.id)}
        >
          {postLiked ? 'Liked' : 'Like'}
        </button>
        <button className="interaction-button" type="button" onClick={focusCommentInput}>
          Comment
        </button>
      </div>
      {getMessage(`post-${post.id}`) ? (
        <p className="inline-error">{getMessage(`post-${post.id}`)}</p>
      ) : null}
      <CommentThread
        post={post}
        currentUser={currentUser}
        commentDraft={commentDraft}
        onCommentDraftChange={(value) => setCommentDraft(post.id, value)}
        onCommentSubmit={() => handleCommentSubmit(post.id)}
        onCommentLike={handleCommentLike}
        onToggleReplyBox={toggleReplyBox}
        isReplyBoxOpen={isReplyBoxOpen}
        getReplyDraft={getReplyDraft}
        setReplyDraft={setReplyDraft}
        onReplySubmit={handleReplySubmit}
        onReplyLike={handleReplyLike}
        onBeginCommentEdit={beginCommentEdit}
        onCancelCommentEdit={cancelCommentEdit}
        onSaveCommentEdit={saveCommentEdit}
        onDeleteComment={deleteComment}
        onBeginReplyEdit={beginReplyEdit}
        onCancelReplyEdit={cancelReplyEdit}
        onSaveReplyEdit={saveReplyEdit}
        onDeleteReply={deleteReply}
        isCommentEditing={isCommentEditing}
        getCommentEditDraft={getCommentEditDraft}
        setCommentEditDraft={setCommentEditDraft}
        isReplyEditing={isReplyEditing}
        getReplyEditDraft={getReplyEditDraft}
        setReplyEditDraft={setReplyEditDraft}
        getMessage={getMessage}
        clearMessage={clearMessage}
      />
    </article>
  );
};
