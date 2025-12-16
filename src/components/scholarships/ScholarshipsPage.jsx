import React, { useState } from 'react';
import ScholarshipsList from './ScholarshipsList';
import ScholarshipForm from './ScholarshipForm';
import {
  useAddScholarshipMutation,
  useEditScholarshipMutation,
} from '../../api/apiSlice';

const ScholarshipsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editScholarship, setEditScholarship] = useState(null);
  const [addScholarship] = useAddScholarshipMutation();
  const [editScholarshipMutation] = useEditScholarshipMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddClick = () => {
    setEditScholarship(null);
    setShowForm(true);
  };

  const handleEditClick = (scholarship) => {
    setEditScholarship(scholarship);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditScholarship(null);
    setError(null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      if (values.id) {
        await editScholarshipMutation(values).unwrap();
      } else {
        await addScholarship(values).unwrap();
      }
      setShowForm(false);
      setEditScholarship(null);
    } catch (err) {
      setError(err?.data?.detail || 'Failed to save scholarship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <ScholarshipsList onAddClick={handleAddClick} onEditClick={handleEditClick} />
      {showForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.2)', zIndex: 1050 }}>
          <div>
            <ScholarshipForm
              initialValues={editScholarship || {}}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
            {loading && <div className="text-center mt-2"><div className="spinner-border text-primary" role="status"></div></div>}
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipsPage; 