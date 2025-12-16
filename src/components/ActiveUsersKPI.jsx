import React from 'react';
import { useGetActiveUsersLast7DaysQuery } from '../redux/chatAnalyticsSlice';

const ActiveUsersKPI = () => {
  const { data, isLoading, error } = useGetActiveUsersLast7DaysQuery();

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div className="card border-primary shadow-sm h-100">
        <div className="card-body text-center">
          <h5 className="card-title mb-2 text-primary">Active Users (7 Days)</h5>
          {isLoading ? (
            <div className="display-6 fw-bold text-muted">...</div>
          ) : error ? (
            <div className="text-danger">Error</div>
          ) : (
            <div className="display-6 fw-bold text-primary">{data?.active_users ?? 0}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveUsersKPI; 