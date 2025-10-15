import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ error: '', loading: false });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: '', loading: true });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to sign in.');
      }

      login(result.data);
      navigate(`/${result.data.role}/dashboard`, { replace: true });
    } catch (error) {
      setStatus({ error: error.message, loading: false });
      return;
    }

    setStatus({ error: '', loading: false });
  };

  return (
    <section className="page centered">
      <div className="panel">
        <h1 className="title">Welcome Back</h1>
        <p className="subtitle">Use your email and password to access the portal.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          {status.error && <p className="form-error">{status.error}</p>}
          <button className="button primary" type="submit" disabled={status.loading}>
            {status.loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="form-footer">
          <span>Need an account?</span>
          <div className="form-links">
            <Link to="/register/user">Register as reader</Link>
            <Link to="/register/author">Register as author</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
