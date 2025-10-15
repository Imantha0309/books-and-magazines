import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => (
  <section className="figbook-page">
    <div className="figbook-card">
      <header className="figbook-card__header">
        <span className="figbook-wordmark">figbook</span>
      </header>
      <div className="figbook-card__hero">
        <div className="figbook-hero-surface">
          <Link className="figbook-share-button" to="/login">
            Share something
          </Link>
        </div>
      </div>
      <p className="figbook-card__caption">
        Sandakirana helps readers and authors share discoveries, drafts, and favourite
        magazines in one cosy space.
      </p>
      <Link className="figbook-pill figbook-pill--wide" to="/login">
        Sign in to continue
      </Link>
      <div className="figbook-pill-group">
        <Link className="figbook-pill" to="/register/user">
          Reader registration
        </Link>
        <Link className="figbook-pill" to="/register/author">
          Author registration
        </Link>
      </div>
      <div className="figbook-card__spark" aria-hidden="true" />
    </div>
  </section>
);

export default Home;
