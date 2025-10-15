import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegistrationForm = ({ role, title, subtitle }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ error: '', loading: false });

  const endpoint = `/api/auth/register/${role}`;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: '', loading: true });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to register.');
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
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            minLength={6}
            required
          />
          {status.error && <p className="form-error">{status.error}</p>}
          <button className="button primary" type="submit" disabled={status.loading}>
            {status.loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="form-footer">
          <span>Already have an account?</span>
          <Link to="/login">Return to login</Link>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
