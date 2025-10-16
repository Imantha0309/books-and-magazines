export const MAX_POST_FILE_SIZE = 2.5 * 1024 * 1024;

export const buildCommentKey = (postId, commentId) => `${postId}::${commentId}`;

export const buildReplyKey = (postId, commentId) => `${postId}:${commentId}`;

export const buildReplyTargetKey = (postId, commentId, replyId) =>
  `${postId}:${commentId}:${replyId}`;

export const formatTimestamp = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch (_error) {
    return '';
  }
};
