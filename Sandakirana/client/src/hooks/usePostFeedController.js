import { useMemo, useState } from 'react';
import {
  MAX_POST_FILE_SIZE,
  buildCommentKey,
  buildReplyKey,
  buildReplyTargetKey,
} from '../components/organisms/feed/feedUtils';
import { resizeImageFile } from '../utils/image';

export const usePostFeedController = ({
  currentUser,
  posts,
  loading,
  error,
  onRetry,
  onTogglePostLike,
  onUpdatePost,
  onDeletePost,
  onAddComment,
  onToggleCommentLike,
  onAddReply,
  onToggleReplyLike,
  onUpdateComment,
  onDeleteComment,
  onUpdateReply,
  onDeleteReply,
  onDownloadReport,
}) => {
  const IMAGE_DIMENSIONS = { maxWidth: 1024, maxHeight: 1024 };
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyBoxes, setReplyBoxes] = useState({});
  const [messages, setMessages] = useState({});
  const [editingComments, setEditingComments] = useState({});
  const [editingCommentDrafts, setEditingCommentDrafts] = useState({});
  const [editingReplies, setEditingReplies] = useState({});
  const [editingReplyDrafts, setEditingReplyDrafts] = useState({});
  const [editingPosts, setEditingPosts] = useState({});
  const [postEditDrafts, setPostEditDrafts] = useState({});
  const [postEditImages, setPostEditImages] = useState({});
  const [postEditPreviews, setPostEditPreviews] = useState({});
  const [postEditFileNames, setPostEditFileNames] = useState({});
  const [downloadingPosts, setDownloadingPosts] = useState({});

  const sortedPosts = useMemo(() => posts ?? [], [posts]);

  const updateMessage = (key, value) => {
    setMessages((prev) => {
      if (!value) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const getMessage = (key) => messages[key];

  const getCommentDraft = (postId) => commentDrafts[postId] || '';

  const setCommentDraft = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const getReplyDraft = (replyKey) => replyDrafts[replyKey] || '';

  const setReplyDraft = (replyKey, value) => {
    setReplyDrafts((prev) => ({ ...prev, [replyKey]: value }));
  };

  const isReplyBoxOpen = (replyKey) => !!replyBoxes[replyKey];

  const toggleReplyBox = (postId, commentId) => {
    const key = buildReplyKey(postId, commentId);
    setReplyBoxes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePostLike = async (postId) => {
    const result = await onTogglePostLike(postId);
    if (!result?.success) {
      updateMessage(`post-${postId}`, result?.message || 'Unable to like this post.');
    } else {
      updateMessage(`post-${postId}`, '');
    }
  };

  const handleCommentSubmit = async (postId) => {
    const draft = getCommentDraft(postId).trim();
    if (!draft) {
      updateMessage(`comment-${postId}`, 'Comment cannot be empty.');
      return;
    }
    const result = await onAddComment(postId, draft);
    if (!result?.success) {
      updateMessage(`comment-${postId}`, result?.message || 'Unable to add comment.');
      return;
    }
    updateMessage(`comment-${postId}`, '');
    setCommentDraft(postId, '');
  };

  const handleCommentLike = async (postId, commentId) => {
    const result = await onToggleCommentLike(postId, commentId);
    if (!result?.success) {
      updateMessage(
        `comment-like-${postId}-${commentId}`,
        result?.message || 'Unable to react to this comment.'
      );
    } else {
      updateMessage(`comment-like-${postId}-${commentId}`, '');
    }
  };

  const handleReplySubmit = async (postId, commentId) => {
    const replyKey = buildReplyKey(postId, commentId);
    const draft = getReplyDraft(replyKey).trim();
    if (!draft) {
      updateMessage(`reply-${replyKey}`, 'Reply cannot be empty.');
      return;
    }
    const result = await onAddReply(postId, commentId, draft);
    if (!result?.success) {
      updateMessage(`reply-${replyKey}`, result?.message || 'Unable to add reply.');
      return;
    }
    updateMessage(`reply-${replyKey}`, '');
    setReplyDraft(replyKey, '');
    setReplyBoxes((prev) => ({ ...prev, [replyKey]: false }));
  };

  const handleReplyLike = async (postId, commentId, replyId) => {
    const replyKey = buildReplyKey(postId, commentId);
    const result = await onToggleReplyLike(postId, commentId, replyId);
    if (!result?.success) {
      updateMessage(
        `reply-like-${replyKey}-${replyId}`,
        result?.message || 'Unable to react to this reply.'
      );
    } else {
      updateMessage(`reply-like-${replyKey}-${replyId}`, '');
    }
  };

  const beginPostEdit = (post) => {
    if (!post?.id) {
      return;
    }
    setEditingPosts((prev) => ({ ...prev, [post.id]: true }));
    setPostEditDrafts((prev) => ({ ...prev, [post.id]: post.content }));
    setPostEditImages((prev) => ({ ...prev, [post.id]: post.image || '' }));
    setPostEditPreviews((prev) => ({ ...prev, [post.id]: post.image || '' }));
    setPostEditFileNames((prev) => ({
      ...prev,
      [post.id]: post.image ? 'Current image' : '',
    }));
    updateMessage(`post-edit-${post.id}`, '');
  };

  const cancelPostEdit = (postId) => {
    setEditingPosts((prev) => {
      const { [postId]: _, ...rest } = prev;
      return rest;
    });
    setPostEditDrafts((prev) => {
      const { [postId]: _, ...rest } = prev;
      return rest;
    });
    setPostEditImages((prev) => {
      const { [postId]: _, ...rest } = prev;
      return rest;
    });
    setPostEditPreviews((prev) => {
      const { [postId]: _, ...rest } = prev;
      return rest;
    });
    setPostEditFileNames((prev) => {
      const { [postId]: _, ...rest } = prev;
      return rest;
    });
    updateMessage(`post-edit-${postId}`, '');
  };

  const handlePostImageChange = async (postId, file, target) => {
    if (!file) {
      setPostEditImages((prev) => ({ ...prev, [postId]: '' }));
      setPostEditPreviews((prev) => ({ ...prev, [postId]: '' }));
      setPostEditFileNames((prev) => ({ ...prev, [postId]: '' }));
      if (target) {
        target.value = '';
      }
      return;
    }

    if (file.size > MAX_POST_FILE_SIZE) {
      setPostEditFileNames((prev) => ({ ...prev, [postId]: '' }));
      if (target) {
        target.value = '';
      }
      updateMessage(`post-edit-${postId}`, 'Please choose an image smaller than 2.5 MB.');
      return;
    }

    setPostEditFileNames((prev) => ({ ...prev, [postId]: file.name }));

    try {
      const { dataUrl } = await resizeImageFile(file, IMAGE_DIMENSIONS);
      setPostEditImages((prev) => ({ ...prev, [postId]: dataUrl }));
      setPostEditPreviews((prev) => ({ ...prev, [postId]: dataUrl }));
      updateMessage(`post-edit-${postId}`, '');
    } catch (_error) {
      setPostEditFileNames((prev) => ({ ...prev, [postId]: '' }));
      if (target) {
        target.value = '';
      }
      updateMessage(
        `post-edit-${postId}`,
        'Unable to process this image. Please try a different file.'
      );
    }
  };

  const clearPostImage = (postId) => {
    setPostEditImages((prev) => ({ ...prev, [postId]: '' }));
    setPostEditPreviews((prev) => ({ ...prev, [postId]: '' }));
    setPostEditFileNames((prev) => ({ ...prev, [postId]: '' }));
    const input = document.getElementById(`post-edit-image-${postId}`);
    if (input) {
      input.value = '';
    }
  };

  const savePostEdit = async (postId) => {
    if (!onUpdatePost) {
      return;
    }

    const draft = (postEditDrafts[postId] || '').trim();
    if (!draft) {
      updateMessage(`post-edit-${postId}`, 'Post content cannot be empty.');
      return;
    }

    const imageData = postEditImages[postId] !== undefined ? postEditImages[postId] : '';

    const result = await onUpdatePost(postId, draft, imageData);
    if (!result?.success) {
      updateMessage(`post-edit-${postId}`, result?.message || 'Unable to update this post.');
      return;
    }

    cancelPostEdit(postId);
    updateMessage(`post-edit-${postId}`, '');
  };

  const handlePostDelete = async (postId) => {
    if (!onDeletePost) {
      return;
    }
    const result = await onDeletePost(postId);
    if (!result?.success) {
      updateMessage(
        `post-manage-${postId}`,
        result?.message || 'Unable to delete this post.'
      );
      return;
    }
    cancelPostEdit(postId);
    updateMessage(`post-manage-${postId}`, '');
  };

  const handleDownloadReport = async (postId) => {
    if (!onDownloadReport) {
      return;
    }

    setDownloadingPosts((prev) => ({ ...prev, [postId]: true }));
    const result = await onDownloadReport(postId);
    setDownloadingPosts((prev) => {
      const { [postId]: _, ...rest } = prev;
      return rest;
    });

    if (!result?.success) {
      updateMessage(
        `post-report-${postId}`,
        result?.message || 'Unable to prepare the download.'
      );
    } else {
      if (result.blob) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `post-report-${postId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      updateMessage(`post-report-${postId}`, '');
    }
  };

  const beginCommentEdit = (postId, comment) => {
    const key = buildCommentKey(postId, comment.id);
    setEditingComments((prev) => ({ ...prev, [key]: true }));
    setEditingCommentDrafts((prev) => ({ ...prev, [key]: comment.content }));
    updateMessage(`edit-comment-${key}`, '');
  };

  const cancelCommentEdit = (key) => {
    setEditingComments((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setEditingCommentDrafts((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    updateMessage(`edit-comment-${key}`, '');
  };

  const saveCommentEdit = async (postId, commentId) => {
    const key = buildCommentKey(postId, commentId);
    const draft = (editingCommentDrafts[key] || '').trim();
    if (!draft) {
      updateMessage(`edit-comment-${key}`, 'Comment cannot be empty.');
      return;
    }

    const result = await onUpdateComment(postId, commentId, draft);
    if (!result?.success) {
      updateMessage(
        `edit-comment-${key}`,
        result?.message || 'Unable to update this comment.'
      );
      return;
    }

    cancelCommentEdit(key);
  };

  const deleteComment = async (postId, commentId) => {
    const key = buildCommentKey(postId, commentId);
    const result = await onDeleteComment(postId, commentId);
    if (!result?.success) {
      updateMessage(
        `edit-comment-${key}`,
        result?.message || 'Unable to delete this comment.'
      );
      return;
    }
    cancelCommentEdit(key);
  };

  const beginReplyEdit = (postId, commentId, reply) => {
    const key = buildReplyTargetKey(postId, commentId, reply.id);
    setEditingReplies((prev) => ({ ...prev, [key]: true }));
    setEditingReplyDrafts((prev) => ({ ...prev, [key]: reply.content }));
    updateMessage(`edit-reply-${key}`, '');
  };

  const cancelReplyEdit = (key) => {
    setEditingReplies((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setEditingReplyDrafts((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    updateMessage(`edit-reply-${key}`, '');
  };

  const saveReplyEdit = async (postId, commentId, replyId) => {
    const key = buildReplyTargetKey(postId, commentId, replyId);
    const draft = (editingReplyDrafts[key] || '').trim();
    if (!draft) {
      updateMessage(`edit-reply-${key}`, 'Reply cannot be empty.');
      return;
    }

    const result = await onUpdateReply(postId, commentId, replyId, draft);
    if (!result?.success) {
      updateMessage(
        `edit-reply-${key}`,
        result?.message || 'Unable to update this reply.'
      );
      return;
    }

    cancelReplyEdit(key);
  };

  const deleteReply = async (postId, commentId, replyId) => {
    const key = buildReplyTargetKey(postId, commentId, replyId);
    const result = await onDeleteReply(postId, commentId, replyId);
    if (!result?.success) {
      updateMessage(
        `edit-reply-${key}`,
        result?.message || 'Unable to delete this reply.'
      );
      return;
    }
    cancelReplyEdit(key);
  };

  const clearMessage = (key) => updateMessage(key, '');

  return {
    currentUser,
    loading,
    error,
    onRetry,
    posts: sortedPosts,
    getMessage,
    hasDownloadReport: !!onDownloadReport,
    canManagePost: (post) =>
      !!onUpdatePost &&
      !!onDeletePost &&
      !!currentUser?.id &&
      currentUser.id === post.author?.id,
    clearMessage,
    handlePostLike,
    handleCommentSubmit,
    handleCommentLike,
    toggleReplyBox,
    handleReplySubmit,
    handleReplyLike,
    beginPostEdit,
    cancelPostEdit,
    handlePostImageChange,
    clearPostImage,
    savePostEdit,
    handlePostDelete,
    handleDownloadReport,
    beginCommentEdit,
    cancelCommentEdit,
    saveCommentEdit,
    deleteComment,
    beginReplyEdit,
    cancelReplyEdit,
    saveReplyEdit,
    deleteReply,
    isEditingPost: (postId) => !!editingPosts[postId],
    getPostDraft: (postId, fallback) =>
      postEditDrafts[postId] !== undefined ? postEditDrafts[postId] : fallback,
    setPostDraft: (postId, value) =>
      setPostEditDrafts((prev) => ({
        ...prev,
        [postId]: value,
      })),
    getPostPreview: (postId, fallback) =>
      postEditPreviews[postId] !== undefined ? postEditPreviews[postId] : fallback,
    getPostFileLabel: (postId, hasImage) => {
      if (postEditFileNames[postId] !== undefined) {
        const label = postEditFileNames[postId];
        return label || 'No file chosen';
      }
      return hasImage ? 'Current image' : 'No file chosen';
    },
    getCommentDraft,
    setCommentDraft,
    getReplyDraft,
    setReplyDraft,
    isReplyBoxOpen,
    isCommentEditing: (postId, commentId) =>
      !!editingComments[buildCommentKey(postId, commentId)],
    getCommentEditDraft: (postId, commentId, fallback) => {
      const key = buildCommentKey(postId, commentId);
      return editingCommentDrafts[key] !== undefined
        ? editingCommentDrafts[key]
        : fallback;
    },
    setCommentEditDraft: (postId, commentId, value) => {
      const key = buildCommentKey(postId, commentId);
      setEditingCommentDrafts((prev) => ({ ...prev, [key]: value }));
    },
    isReplyEditing: (postId, commentId, replyId) =>
      !!editingReplies[buildReplyTargetKey(postId, commentId, replyId)],
    getReplyEditDraft: (postId, commentId, replyId, fallback) => {
      const key = buildReplyTargetKey(postId, commentId, replyId);
      return editingReplyDrafts[key] !== undefined ? editingReplyDrafts[key] : fallback;
    },
    setReplyEditDraft: (postId, commentId, replyId, value) => {
      const key = buildReplyTargetKey(postId, commentId, replyId);
      setEditingReplyDrafts((prev) => ({ ...prev, [key]: value }));
    },
    isDownloading: (postId) => !!downloadingPosts[postId],
  };
};
