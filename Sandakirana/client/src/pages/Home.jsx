import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeSearch } from '../components/molecules/home/HomeSearch';
import { HomeHighlights } from '../components/organisms/home/HomeHighlights';
import PostFeed from '../components/organisms/feed/PostFeed';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import '../styles/home.css';

const Home = () => {
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
    downloadPostReport,
    updateComment,
    deleteComment,
    updateReply,
    deleteReply,
  } = usePosts(user);

  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    if (!normalizedSearch) {
      return posts;
    }
    return posts.filter((post) => {
      const content = post.content?.toLowerCase() || '';
      const author = post.author?.name?.toLowerCase() || '';
      return content.includes(normalizedSearch) || author.includes(normalizedSearch);
    });
  }, [posts, normalizedSearch]);

  const featuredPosts = useMemo(() => posts.slice(0, 3), [posts]);
  const isSearching = normalizedSearch.length > 0;
  const feedPosts = isSearching ? filteredPosts : posts;
  const showSearchEmpty = isSearching && !loading && !error && feedPosts.length === 0;

  return (
    <section className="home-landing">
      <div className="home-search-wrap">
        <HomeSearch value={searchTerm} onChange={setSearchTerm} />
      </div>
      <div className="home-hero">
        <span className="home-badge">For readers &amp; authors</span>
        <h1 className="home-title">Share discoveries and spotlight local magazines.</h1>
        <p className="home-subtitle">
          Sandakirana brings storytellers and book lovers together. Browse fresh updates
          from authors and let the community know what you would love to read next.
        </p>
        <div className="home-cta-group">
          <Link className="button primary" to="/register/user">
            Start reading
          </Link>
          <Link className="button outline" to="/register/author">
            Publish with us
          </Link>
        </div>
      </div>
      {!isSearching && (
        <div className="home-section home-section--highlights">
          <div className="home-section-header">
            <h2>Latest from our authors</h2>
            <p>Catch a glimpse of what the community is sharing.</p>
          </div>
          <HomeHighlights posts={featuredPosts} loading={loading} error={error} />
        </div>
      )}
      <div className="home-section">
        <div className="home-section-header">
          <h2>{isSearching ? `Results for "${searchTerm}"` : 'All published posts'}</h2>
          <p>
            {isSearching
              ? 'Browse posts that match your search.'
              : 'Every story published by our authors, newest first.'}
          </p>
        </div>
        {showSearchEmpty ? (
          <div className="home-feed-empty">
            <p>No posts match your search just yet. Try another keyword.</p>
          </div>
        ) : (
          <PostFeed
            currentUser={user}
            posts={feedPosts}
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
            onDownloadReport={user?.role === 'author' ? downloadPostReport : undefined}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
            onUpdateReply={updateReply}
            onDeleteReply={deleteReply}
          />
        )}
        {!isSearching && (
          <div className="home-suggestion">
            <div className="home-suggestion-copy">
              <h3>Suggest a post</h3>
              <p>
                Have a topic in mind? Share your idea and help inspire the next author
                update.
              </p>
            </div>
            <Link className="button outline" to="/login">
              Suggest now
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;
