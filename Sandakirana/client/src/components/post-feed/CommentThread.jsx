import React from 'react';
import {
  buildCommentKey,
  buildReplyKey,
  formatTimestamp,
} from './feedUtils';
import { ReplyThread } from './ReplyThread';

export const CommentThread = ({
  post,
  currentUser,
  commentDraft,
  onCommentDraftChange,
  onCommentSubmit,
  onCommentLike,
  onToggleReplyBox,
  isReplyBoxOpen,
  getReplyDraft,
  setReplyDraft,
  onReplySubmit,
  onReplyLike,
  onBeginCommentEdit,
  onCancelCommentEdit,
  onSaveCommentEdit,
  onDeleteComment,
  onBeginReplyEdit,
  onCancelReplyEdit,
  onSaveReplyEdit,
  onDeleteReply,
  isCommentEditing,
  getCommentEditDraft,
  setCommentEditDraft,
  isReplyEditing,
  getReplyEditDraft,
  setReplyEditDraft,
  getMessage,
  clearMessage,
}) => (
  <div className="comment-section">
    <div className="inline-form">
      <textarea
        id={`comment-input-${post.id}`}
        className="form-input text-area"
        placeholder="Write a comment..."
        value={commentDraft}
        onChange={(event) => onCommentDraftChange(event.target.value)}
      />
      <button className="button primary" type="button" onClick={() => onCommentSubmit()}>
        Post comment
      </button>
    </div>
    {getMessage(`comment-${post.id}`) ? (
      <p className="inline-error">{getMessage(`comment-${post.id}`)}</p>
    ) : null}
    <div className="comment-list">
      {post.comments?.map((comment) => {
        const replyKey = buildReplyKey(post.id, comment.id);
        const commentKey = buildCommentKey(post.id, comment.id);
        const isEditing = isCommentEditing(post.id, comment.id);
        const draft = getCommentEditDraft(post.id, comment.id, comment.content);
        const commentLiked = comment.likes?.includes(currentUser?.id);
        const canManage =
          !!currentUser?.id &&
          (currentUser.id === comment.author?.id || currentUser.id === post.author?.id);

        return (
          <div className="comment-card" key={comment.id}>
            <div className="comment-body">
              <div className="comment-meta">
                <span className="comment-author">{comment.author?.name || 'Unknown user'}</span>
                <time className="comment-date">{formatTimestamp(comment.createdAt)}</time>
              </div>
              {!isEditing ? (
                <p>{comment.content}</p>
              ) : (
                <div className="inline-form edit-form">
                  <textarea
                    className="form-input text-area"
                    value={draft}
                    onChange={(event) =>
                      setCommentEditDraft(post.id, comment.id, event.target.value)
                    }
                  />
                  <div className="reply-actions">
                    <button
                      className="button outline"
                      type="button"
                      onClick={() => onCancelCommentEdit(commentKey)}
                    >
                      Cancel
                    </button>
                    <button
                      className="button primary"
                      type="button"
                      onClick={() => onSaveCommentEdit(post.id, comment.id)}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="comment-actions">
              <button
                className={`interaction-button ${commentLiked ? 'active' : ''}`}
                type="button"
                onClick={() => onCommentLike(post.id, comment.id)}
              >
                {commentLiked ? 'Liked' : 'Like'}
              </button>
              <button
                className="interaction-button"
                type="button"
                onClick={() => onToggleReplyBox(post.id, comment.id)}
              >
                Reply
              </button>
              <span className="comment-like-count">
                {comment.likes?.length || 0} {comment.likes?.length === 1 ? 'like' : 'likes'}
              </span>
              {canManage && (
                <div className="comment-manage">
                  {!isEditing && (
                    <button
                      className="link-button"
                      type="button"
                      onClick={() => onBeginCommentEdit(post.id, comment)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="link-button danger"
                    type="button"
                    onClick={() => onDeleteComment(post.id, comment.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {getMessage(`comment-like-${post.id}-${comment.id}`) ? (
              <p className="inline-error">
                {getMessage(`comment-like-${post.id}-${comment.id}`)}
              </p>
            ) : null}
            {getMessage(`edit-comment-${commentKey}`) ? (
              <p className="inline-error">{getMessage(`edit-comment-${commentKey}`)}</p>
            ) : null}
            {isReplyBoxOpen(replyKey) ? (
              <div className="inline-form reply-form">
                <textarea
                  className="form-input text-area"
                  placeholder="Write a reply..."
                  value={getReplyDraft(replyKey)}
                  onChange={(event) => setReplyDraft(replyKey, event.target.value)}
                />
                <div className="reply-actions">
                  <button
                    className="button outline"
                    type="button"
                  onClick={() => {
                    onToggleReplyBox(post.id, comment.id);
                    setReplyDraft(replyKey, '');
                    clearMessage(`reply-${replyKey}`);
                  }}
                >
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    type="button"
                    onClick={() => onReplySubmit(post.id, comment.id)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            ) : null}
            {getMessage(`reply-${replyKey}`) ? (
              <p className="inline-error">{getMessage(`reply-${replyKey}`)}</p>
            ) : null}
            <ReplyThread
              postId={post.id}
              commentId={comment.id}
              replies={comment.replies}
              currentUser={currentUser}
              postAuthorId={post.author?.id}
              onReplyLike={onReplyLike}
              onBeginReplyEdit={onBeginReplyEdit}
              onCancelReplyEdit={onCancelReplyEdit}
              onSaveReplyEdit={onSaveReplyEdit}
              onDeleteReply={onDeleteReply}
              isReplyEditing={isReplyEditing}
              getReplyEditDraft={getReplyEditDraft}
              setReplyEditDraft={setReplyEditDraft}
              getMessage={getMessage}
            />
          </div>
        );
      })}
    </div>
  </div>
);
