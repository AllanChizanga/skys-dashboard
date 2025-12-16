import React, { useState } from 'react';
import ProgramsList from './ProgramsList';
import ProgramForm from './ProgramForm';
import {
  useAddProgramMutation,
  useEditProgramMutation,
} from '../../api/apiSlice';

const ProgramsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editProgram, setEditProgram] = useState(null);
  const [addProgram] = useAddProgramMutation();
  const [editProgramMutation] = useEditProgramMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddClick = () => {
    setEditProgram(null);
    setShowForm(true);
  };

  const handleEditClick = (program) => {
    setEditProgram(program);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditProgram(null);
    setError(null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      if (values.id) {
        await editProgramMutation(values).unwrap();
      } else {
        await addProgram(values).unwrap();
      }
      setShowForm(false);
      setEditProgram(null);
    } catch (err) {
      setError(err?.data?.detail || 'Failed to save program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <ProgramsList onAddClick={handleAddClick} onEditClick={handleEditClick} />
      {showForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.2)', zIndex: 1050 }}>
          <div>
            <ProgramForm
              initialValues={editProgram || {}}
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

export default ProgramsPage; 