import React from 'react';
import { useGetIdDocumentsQuery } from '../../api/idDocumentsApiSlice';
import { Link } from 'react-router-dom';

const IdDocumentsList = () => {
  const { data: docs = [], isLoading, isError, error } = useGetIdDocumentsQuery();

  if (isLoading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (isError) return <div>Error: {error?.error || 'Failed to load ID documents.'}</div>;

  return (
    <div>
      <h2>ID Documents</h2>
      <ul>
        {docs.map(doc => (
          <li key={doc.id}>
            <Link to={`/id-documents/${doc.id}`}>{doc.name || doc.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IdDocumentsList; 