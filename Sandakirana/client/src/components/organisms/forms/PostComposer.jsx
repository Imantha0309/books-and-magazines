import React from 'react';
import { Button } from '../../atoms/Button';
import { TextArea } from '../../atoms/TextArea';

export const PostComposer = ({
  title,
  subtitle,
  content,
  onContentChange,
  onSubmit,
  onReset,
  onImageChange,
  preview,
  fileName,
  status,
  canPublish = true,
  fileInputRef,
}) => (
  <div className="panel full-width">
    <h1 className="title">{title}</h1>
    <p className="subtitle">{subtitle}</p>
    <form className="form post-form" onSubmit={onSubmit}>
      <label className="form-label" htmlFor="content">
        Post content
      </label>
      <TextArea
        id="content"
        name="content"
        placeholder="Share an update, recommendation, or discovery..."
        value={content}
        onChange={onContentChange}
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
          onChange={onImageChange}
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
        <Button variant="outline" type="button" onClick={onReset} disabled={status.loading}>
          Clear
        </Button>
        <Button variant="primary" type="submit" disabled={status.loading || !canPublish}>
          {status.loading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
      {!canPublish && (
        <p className="form-error">You do not have permission to publish posts.</p>
      )}
    </form>
  </div>
);
