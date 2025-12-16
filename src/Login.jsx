import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, setUser } from './redux/authSlice';
import { API_ROOT } from './redux/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      // Attempt login request
      let response;
      try {
        response = await fetch(`${API_ROOT}/api/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      } catch (networkErr) {
        // fetch failed before receiving a response (network down, DNS, timeout, CORS, etc.)
        setError('Network error: please check your internet connection and try again.');
        setLoading(false);
        return;
      }

      // Got a response from server - handle status codes
      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid username or password.');
        } else {
          setError(`Login failed (${response.status}). Please try again later.`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      dispatch(loginSuccess({ access: data.access, refresh: data.refresh }));

      // Fetch user info (separate network error handling)
      try {
        const userResponse = await fetch(`${API_ROOT}/api/users-admin/me/`, {
          headers: { Authorization: `Bearer ${data.access}` }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('Fetched userData:', userData);
          dispatch(setUser(userData));
        }
      } catch (userFetchErr) {
        // Non-fatal: user info couldn't be retrieved due to network issue
        console.warn('Could not fetch user info after login:', userFetchErr);
      }

      navigate('/');
    } catch (err) {
      // Fallback catch: unexpected errors
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/student.jpg) center/cover no-repeat',
        minHeight: '100vh',
      }}
    >
      <div className="card shadow p-4" style={{ minWidth: 350, maxWidth: 400, zIndex: 1 }}>
        <div className="text-center mb-4">
          <img src="/skies_logo.jpg" alt="Skies Logo" style={{ width: 100, height: 100, objectFit: 'contain' }} />
          <h2 className="mt-3 mb-0" style={{ fontWeight: 700, color: '#222' }}>Welcome Back</h2>
          <p className="text-muted mb-0">Please login to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 