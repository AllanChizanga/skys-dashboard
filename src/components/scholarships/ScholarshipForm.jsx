import React, { useState } from 'react';

const ScholarshipForm = ({ initialValues = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialValues.name || '');
  const [percentage, setPercentage] = useState(initialValues.percentage || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !percentage.trim() || !description.trim()) {
      setError('All fields are required');
      return;
    }
    setError(null);
    onSubmit({ ...initialValues, name: name.trim(), percentage: percentage.trim(), description: description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded bg-white shadow-sm" style={{ maxWidth: 400, padding: '2rem 2.5rem' }}>
      <h4>{initialValues.id ? 'Edit Scholarship' : 'Add Scholarship'}</h4>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="e.g. Academic Excellence Scholarship"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Percentage</label>
        <input
          type="text"
          className="form-control"
          value={percentage}
          onChange={e => setPercentage(e.target.value)}
          required
          placeholder="e.g. 50"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          placeholder="e.g. Awarded to students with outstanding academic performance."
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

export default ScholarshipForm; 