import React, { useRef, useState } from 'react';
import PostFeed from '../../components/PostFeed';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';

const MAX_FILE_SIZE = 2.5 * 1024 * 1024; // ~2.5 MB

const AuthorDashboard = () => {
  const { user } = useAuth();
  const {
    posts,
    loading: postsLoading,
    error: postsError,
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
  } = usePosts(user);

  const [form, setForm] = useState({ content: '', imageData: '' });
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState({ error: '', loading: false, success: '' });
  const fileInputRef = useRef(null);

  const canPublish = user?.role === 'author';

  const handleContentChange = (event) => {
    setForm((prev) => ({ ...prev, content: event.target.value }));
  };

  const handleImageChange = (event) => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageData: reader.result }));
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
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
        error: 'Only authors can publish posts.',
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
        <div className="panel full-width">
          <h1 className="title">Author Dashboard</h1>
          <p className="subtitle">
            {user?.name
              ? `Greetings ${user.name}, share your latest work with the community.`
              : 'Welcome back.'}
          </p>
          <form className="form post-form" onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="content">
              Post content
            </label>
            <textarea
              id="content"
              name="content"
              className="form-input text-area"
              placeholder="Announce new releases, events, or share updates..."
              value={form.content}
              onChange={handleContentChange}
              minLength={5}
              required
            />
            <label className="form-label" htmlFor="image">
              Featured image
            </label>
            <div className="file-upload-wrapper">
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="file-input-hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <div className="file-upload-control">
                <span className="file-upload-button">Choose image</span>
                <span className="file-upload-text">{fileName || 'No file chosen'}</span>
              </div>
            </div>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Post preview" />
              </div>
            )}
            {status.error && <p className="form-error">{status.error}</p>}
            {status.success && <p className="form-success">{status.success}</p>}
            <div className="post-actions">
              <button
                className="button outline"
                type="button"
                onClick={resetForm}
                disabled={status.loading}
              >
                Clear
              </button>
              <button className="button primary" type="submit" disabled={status.loading}>
                {status.loading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
        <div className="panel full-width">
          <h2 className="title">Community feed</h2>
          <PostFeed
            currentUser={user}
            posts={posts}
            loading={postsLoading}
            error={postsError}
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
      </div>
    </section>
  );
};

export default AuthorDashboard;
