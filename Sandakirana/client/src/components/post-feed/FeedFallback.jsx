import React from 'react';

const messages = {
  loading: 'Loading posts...',
  empty: 'No posts yet. Stay tuned for new updates.',
};

export const FeedFallback = ({ variant, errorMessage, onRetry }) => {
  if (variant === 'loading') {
    return (
      <div className="feed-state">
        <p>{messages.loading}</p>
      </div>
    );
  }

  if (variant === 'error') {
    return (
      <div className="feed-state">
        <p className="inline-error">{errorMessage}</p>
        {onRetry && (
          <button className="button outline" type="button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="feed-state">
      <p>{messages.empty}</p>
    </div>
  );
};
