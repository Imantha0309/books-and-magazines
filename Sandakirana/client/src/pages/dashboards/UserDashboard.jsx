import React, { useRef, useState } from 'react';
import PostFeed from '../../components/organisms/feed/PostFeed';
import { PostComposer } from '../../components/organisms/forms/PostComposer';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import { resizeImageFile } from '../../utils/image';

const MAX_FILE_SIZE = 2.5 * 1024 * 1024; // ~2.5 MB
const IMAGE_DIMENSIONS = { maxWidth: 1024, maxHeight: 1024 };

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
    updateComment,
    deleteComment,
    updateReply,
    deleteReply,
    prependPost,
  } = usePosts(user, { authorOnly: true });

  const [form, setForm] = useState({ content: '', imageData: '' });
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState({ error: '', loading: false, success: '' });
  const fileInputRef = useRef(null);

  const canPublish = ['author', 'user'].includes(user?.role);

  const handleContentChange = (event) => {
    setForm((prev) => ({ ...prev, content: event.target.value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName('');
      setForm((prev) => ({ ...prev, imageData: '' }));
      setPreview('');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileName('');
      event.target.value = '';
      setStatus({
        error: 'Please choose an image smaller than 2.5 MB.',
        loading: false,
        success: '',
      });
      return;
    }

    setFileName(file.name);

    try {
      const { dataUrl } = await resizeImageFile(file, IMAGE_DIMENSIONS);
      setForm((prev) => ({ ...prev, imageData: dataUrl }));
      setPreview(dataUrl);
      setStatus((prev) => ({ ...prev, error: '', success: '' }));
    } catch (_error) {
      setForm((prev) => ({ ...prev, imageData: '' }));
      setPreview('');
      setFileName('');
      event.target.value = '';
      setStatus({
        error: 'Unable to process image. Please try a different file.',
        loading: false,
        success: '',
      });
    }
  };

  const resetForm = () => {
    setForm({ content: '', imageData: '' });
    setPreview('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canPublish) {
      setStatus({
        error: 'You do not have permission to publish posts.',
        loading: false,
        success: '',
      });
      return;
    }

    setStatus({ error: '', loading: true, success: '' });

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          content: form.content,
          image: form.imageData,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        throw new Error(
          result?.message || `Unable to publish post (status ${response.status}).`
        );
      }

      if (result?.data) {
        prependPost(result.data);
      }

      setStatus({
        error: '',
        loading: false,
        success: 'Post published successfully.',
      });
      resetForm();
    } catch (error) {
      setStatus({
        error: error.message || 'Something went wrong while publishing.',
        loading: false,
        success: '',
      });
    }
  };

  return (
    <section className="page centered">
      <div className="dashboard-grid">
        <PostComposer
          title="Reader Dashboard"
          subtitle={
            user?.name
              ? `${user.name}, let others know what you are exploring right now.`
              : 'Welcome back.'
          }
          content={form.content}
          onContentChange={handleContentChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
          onImageChange={handleImageChange}
          preview={preview}
          fileName={fileName}
          status={status}
          canPublish={canPublish}
          fileInputRef={fileInputRef}
        />
        <div className="panel full-width">
          <h2 className="title">Your posts</h2>
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
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
            onUpdateReply={updateReply}
            onDeleteReply={deleteReply}
          />
        </div>
      </div>
    </section>
  );
};

export default UserDashboard;
