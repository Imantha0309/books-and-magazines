import React from 'react';
import '../styles/feed/post-form.css';
import '../styles/feed/post-card.css';
import '../styles/feed/comments.css';
import '../styles/feed/feed-utilities.css';
import '../styles/feed/feed-responsive.css';
import { usePostFeedController } from './post-feed/usePostFeedController';
import { PostFeedView } from './post-feed/PostFeedView';

const PostFeed = (props) => {
  const controller = usePostFeedController(props);
  return <PostFeedView controller={controller} />;
};

export default PostFeed;
