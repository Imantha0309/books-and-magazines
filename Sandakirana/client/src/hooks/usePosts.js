import { useCallback, useEffect, useState } from 'react';

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const usePosts = (currentUser, options = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authorOnly = false } = options;
  const userId = currentUser?.id;

  const buildPostsUrl = useCallback(() => {
    if (authorOnly && userId) {
      return `/api/posts?authorId=${encodeURIComponent(userId)}`;
    }
    return '/api/posts';
  }, [authorOnly, userId]);

  const refresh = useCallback(async () => {
    if (authorOnly && !userId) {
      setPosts([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(buildPostsUrl());
      const json = await parseJson(response);
      if (!response.ok) {
        throw new Error(json?.message || 'Failed to load posts.');
      }
      setPosts(json?.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [buildPostsUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updatePostInState = useCallback((post) => {
    if (!post?.id) {
      return;
    }
    setPosts((prev) => {
      const exists = prev.some((item) => item.id === post.id);
      if (exists) {
        return prev.map((item) => (item.id === post.id ? post : item));
      }
      return [post, ...prev];
    });
  }, []);

  const removePostFromState = useCallback((postId) => {
    if (!postId) {
      return;
    }
    setPosts((prev) => prev.filter((item) => item.id !== postId));
  }, []);

  const sendRequest = useCallback(async (url, method = 'POST', payload) => {
    try {
      const options = {
        method,
        headers: {},
      };

      if (payload !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(url, {
        ...options,
      });

      const contentType = response.headers.get('content-type') || '';
      const json =
        contentType.includes('application/json') ? await parseJson(response) : null;

      if (!response.ok) {
        throw new Error(json?.message || `Request failed with status ${response.status}`);
      }

      return { success: true, data: json?.data || null };
    } catch (err) {
      return { success: false, message: err.message || 'Request failed.' };
    }
  }, []);

  const togglePostLike = useCallback(
    async (postId) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/like`,
        'POST',
        {
          userId: currentUser.id,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const addComment = useCallback(
    async (postId, content) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments`,
        'POST',
        {
          userId: currentUser.id,
          content,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const toggleCommentLike = useCallback(
    async (postId, commentId) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments/${commentId}/like`,
        'POST',
        {
          userId: currentUser.id,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const addReply = useCallback(
    async (postId, commentId, content) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments/${commentId}/replies`,
        'POST',
        {
          userId: currentUser.id,
          content,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const toggleReplyLike = useCallback(
    async (postId, commentId, replyId) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`,
        'POST',
        {
          userId: currentUser.id,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const updatePost = useCallback(
    async (postId, content, image) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}`,
        'PUT',
        {
          userId: currentUser.id,
          content,
          image,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const deletePost = useCallback(
    async (postId) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}`,
        'DELETE',
        {
          userId: currentUser.id,
        }
      );
      if (result.success) {
        removePostFromState(postId);
      }
      return result;
    },
    [currentUser, sendRequest, removePostFromState]
  );

  const downloadPostReport = useCallback(
    async (postId) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      try {
        const response = await fetch(
          `/api/posts/${postId}/report?userId=${encodeURIComponent(currentUser.id)}`,
          {
            method: 'GET',
          }
        );

        if (!response.ok) {
          const maybeJson = await parseJson(response);
          throw new Error(maybeJson?.message || `Request failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const disposition = response.headers.get('content-disposition') || '';
        const match = disposition.match(/filename="?(.*)"?/i);
        const filename = match ? match[1] : `post-report-${postId}.pdf`;

        return { success: true, blob, filename };
      } catch (error) {
        return { success: false, message: error.message || 'Failed to download report.' };
      }
    },
    [currentUser]
  );

  const updateComment = useCallback(
    async (postId, commentId, content) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments/${commentId}`,
        'PUT',
        {
          userId: currentUser.id,
          content,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const deleteComment = useCallback(
    async (postId, commentId) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments/${commentId}`,
        'DELETE',
        {
          userId: currentUser.id,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const updateReply = useCallback(
    async (postId, commentId, replyId, content) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments/${commentId}/replies/${replyId}`,
        'PUT',
        {
          userId: currentUser.id,
          content,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const deleteReply = useCallback(
    async (postId, commentId, replyId) => {
      if (!currentUser?.id) {
        return { success: false, message: 'You must be signed in to interact.' };
      }

      const result = await sendRequest(
        `/api/posts/${postId}/comments/${commentId}/replies/${replyId}`,
        'DELETE',
        {
          userId: currentUser.id,
        }
      );
      if (result.success && result.data) {
        updatePostInState(result.data);
      }
      return result;
    },
    [currentUser, sendRequest, updatePostInState]
  );

  const prependPost = useCallback(
    (post) => {
      if (!post) return;
      setPosts((prev) => [post, ...prev.filter((item) => item.id !== post.id)]);
    },
    []
  );

  return {
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
    prependPost,
  };
};
