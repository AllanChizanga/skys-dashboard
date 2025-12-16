import React from 'react';
import { useGetIdDocumentQuery } from '../../api/idDocumentsApiSlice';

const IdDocumentDetail = ({ id }) => {
  const { data: doc, isLoading, isError, error } = useGetIdDocumentQuery(id);

  if (!id) return <div>No document selected.</div>;
  if (isLoading) return <div>Loading document...</div>;
  if (isError) return <div>Error: {error?.error || 'Failed to load document.'}</div>;

  return (
    <div>
      <h2>ID Document Detail</h2>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
    </div>
  );
};

export default IdDocumentDetail; 