import React from 'react';
import { useGetUserQuery } from '../../api/usersApiSlice';

const UserDetail = ({ userId }) => {
  const { data: user, isLoading, isError, error } = useGetUserQuery(userId);

  if (!userId) return <div>No user selected.</div>;
  if (isLoading) return <div>Loading user...</div>;
  if (isError) return <div>Error: {error?.error || 'Failed to load user.'}</div>;

  return (
    <div>
      <h2>User Detail</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default UserDetail; 