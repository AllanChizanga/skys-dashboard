import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
      <div style={{ fontSize: 80, color: '#dc3545' }}>
        <i className="bi bi-emoji-frown"></i>
      </div>
      <h1 className="fw-bold mt-3 mb-2 text-danger">Oops! Something went wrong.</h1>
      <p className="lead mb-4 text-muted">
        {error?.statusText || error?.message || 'An unexpected error occurred.'}
      </p>
      <Link to="/" className="btn btn-lg btn-primary shadow-sm px-4 py-2 rounded-pill">
        Go Home
      </Link>
      <div className="mt-4 text-muted" style={{ fontSize: 14 }}>
        If the problem persists, please contact support.
      </div>
    </div>
  );
};

export default ErrorPage; 