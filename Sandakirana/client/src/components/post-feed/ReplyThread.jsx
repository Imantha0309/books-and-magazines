import React from 'react';
import { buildReplyKey, buildReplyTargetKey, formatTimestamp } from './feedUtils';

export const ReplyThread = ({
  postId,
  commentId,
  replies,
  currentUser,
  postAuthorId,
  onReplyLike,
  onBeginReplyEdit,
  onCancelReplyEdit,
  onSaveReplyEdit,
  onDeleteReply,
  isReplyEditing,
  getReplyEditDraft,
  setReplyEditDraft,
  getMessage,
}) => {
  if (!replies?.length) {
    return null;
  }

  const replyKeyRoot = buildReplyKey(postId, commentId);

  return (
    <div className="reply-list">
      {replies.map((reply) => {
        const targetKey = buildReplyTargetKey(postId, commentId, reply.id);
        const isEditing = isReplyEditing(postId, commentId, reply.id);
        const draft = getReplyEditDraft(postId, commentId, reply.id, reply.content);
        const replyLiked = reply.likes?.includes(currentUser?.id);
        const canManage =
          !!currentUser?.id &&
          (currentUser.id === reply.author?.id || currentUser.id === postAuthorId);

        return (
          <div className="reply-card" key={reply.id}>
            <div className="comment-meta">
              <span className="comment-author">{reply.author?.name || 'Unknown user'}</span>
              <time className="comment-date">{formatTimestamp(reply.createdAt)}</time>
            </div>
            {!isEditing ? (
              <p>{reply.content}</p>
            ) : (
              <div className="inline-form edit-form">
                <textarea
                  className="form-input text-area"
                  value={draft}
                  onChange={(event) =>
                    setReplyEditDraft(postId, commentId, reply.id, event.target.value)
                  }
                />
                <div className="reply-actions">
                  <button
                    className="button outline"
                    type="button"
                    onClick={() => onCancelReplyEdit(targetKey)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    type="button"
                    onClick={() => onSaveReplyEdit(postId, commentId, reply.id)}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            <div className="comment-actions">
              <button
                className={`interaction-button ${
                  replyLiked ? 'active' : ''
                }`}
                type="button"
                onClick={() => onReplyLike(postId, commentId, reply.id)}
              >
                {replyLiked ? 'Liked' : 'Like'}
              </button>
              <span className="comment-like-count">
                {reply.likes?.length || 0} {reply.likes?.length === 1 ? 'like' : 'likes'}
              </span>
              {canManage && (
                <div className="comment-manage">
                  {!isEditing && (
                    <button
                      className="link-button"
                      type="button"
                      onClick={() => onBeginReplyEdit(postId, commentId, reply)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="link-button danger"
                    type="button"
                    onClick={() => onDeleteReply(postId, commentId, reply.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {getMessage(`reply-like-${replyKeyRoot}-${reply.id}`) ? (
              <p className="inline-error">
                {getMessage(`reply-like-${replyKeyRoot}-${reply.id}`)}
              </p>
            ) : null}
            {getMessage(`edit-reply-${targetKey}`) ? (
              <p className="inline-error">{getMessage(`edit-reply-${targetKey}`)}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
