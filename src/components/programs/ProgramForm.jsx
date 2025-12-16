import React, { useState } from 'react';

const ProgramForm = ({ initialValues = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialValues.name || '');
  const [duration, setDuration] = useState(initialValues.duration || '');
  const [tuition, setTuition] = useState(initialValues.tuition || '');
  const [admissionFee, setAdmissionFee] = useState(initialValues.admission_fee || '');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !duration.trim() || !tuition.trim() || !admissionFee.trim()) {
      setError('All fields are required');
      return;
    }
    setError(null);
    onSubmit({ ...initialValues, name: name.trim(), duration: duration.trim(), tuition: tuition.trim(), admission_fee: admissionFee.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded bg-white shadow-sm" style={{ maxWidth: 400, padding: '2rem 2.5rem' }}>
      <h4>{initialValues.id ? 'Edit Program' : 'Add Program'}</h4>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="e.g. Bachelor of Computer Science"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Duration</label>
        <input
          type="text"
          className="form-control"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          required
          placeholder="e.g. 4 years"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Tuition</label>
        <input
          type="text"
          className="form-control"
          value={tuition}
          onChange={e => setTuition(e.target.value)}
          required
          placeholder="e.g. $2000 per year"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Admission Fee</label>
        <input
          type="text"
          className="form-control"
          value={admissionFee}
          onChange={e => setAdmissionFee(e.target.value)}
          required
          placeholder="e.g. $100"
        />
      </div>
      {error && <div className="text-danger mb-2">{error}</div>}
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">{initialValues.id ? 'Update' : 'Add'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ProgramForm; 