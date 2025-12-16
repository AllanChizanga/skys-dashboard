import React from 'react';
import { useGetResultDocumentsQuery } from '../../api/resultDocumentsApiSlice';
import { Link } from 'react-router-dom';

const ResultDocumentsList = () => {
  const { data: docs = [], isLoading, isError, error } = useGetResultDocumentsQuery();

  if (isLoading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (isError) return <div>Error: {error?.error || 'Failed to load result documents.'}</div>;

  return (
    <div>
      <h2>Result Documents</h2>
      <ul>
        {docs.map(doc => (
          <li key={doc.id}>
            <Link to={`/result-documents/${doc.id}`}>{doc.name || doc.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultDocumentsList; 