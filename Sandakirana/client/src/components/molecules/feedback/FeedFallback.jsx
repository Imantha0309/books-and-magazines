import React from 'react';
import { Button } from '../../atoms/Button';

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
          <Button variant="outline" type="button" onClick={onRetry}>
            Retry
          </Button>
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
