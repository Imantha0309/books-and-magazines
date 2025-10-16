import React from 'react';
import '../../../styles/feed/post-form.css';
import '../../../styles/feed/post-card.css';
import '../../../styles/feed/comments.css';
import '../../../styles/feed/feed-utilities.css';
import '../../../styles/feed/feed-responsive.css';
import { usePostFeedController } from '../../../hooks/usePostFeedController';
import { PostFeedTemplate } from '../../templates/feed/PostFeedTemplate';

const PostFeed = (props) => {
  const controller = usePostFeedController(props);
  return <PostFeedTemplate controller={controller} />;
};

export default PostFeed;
