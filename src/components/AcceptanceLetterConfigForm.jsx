import React, { useState, useEffect } from 'react';
import { useGetAcceptanceLetterConfigQuery, useUpdateAcceptanceLetterConfigMutation } from '../api/apiSlice';
import { extractYearFromIntake } from '../utils/intake';

const fields = [
  { name: 'admission_deposit_amount', label: 'Admission Deposit Amount ($)' },
  { name: 'admission_deposit_deadline', label: 'Deposit Deadline' },
  { name: 'admission_balance_amount', label: 'Admission Balance Amount ($)' },
  { name: 'admission_balance_deadline', label: 'Balance Deadline' },
  { name: 'intake', label: 'Default Intake (e.g. Sep 2025)' },
  { name: 'payment_policy', label: 'Payment Policy', type: 'textarea' },
];

// use shared extractYearFromIntake from utils

const AcceptanceLetterConfigForm = () => {
  const { data: config, isLoading, isError, error } = useGetAcceptanceLetterConfigQuery();
  const [updateConfig, { isLoading: isSaving }] = useUpdateAcceptanceLetterConfigMutation();
  const [form, setForm] = useState({});
  const [extraCosts, setExtraCosts] = useState([]);
  const [success, setSuccess] = useState(false);
  const [intakeError, setIntakeError] = useState(null);

  useEffect(() => {
    if (config) {
      setForm(config);
      setExtraCosts(Array.isArray(config.extra_costs) ? config.extra_costs : []);
    }
  }, [config]);

  // validate intake whenever it changes
  useEffect(() => {
    const intakeVal = form?.intake || '';
    const year = extractYearFromIntake(intakeVal);
    setIntakeError(intakeVal && !year ? 'Intake should include a year (e.g. Sep 2026).' : null);
  }, [form?.intake]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleExtraCostChange = (idx, field, value) => {
    setExtraCosts(costs => costs.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleAddExtraCost = () => {
    setExtraCosts(costs => [...costs, { label: '', value: '' }]);
  };

  const handleRemoveExtraCost = (idx) => {
    setExtraCosts(costs => costs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    try {
      await updateConfig({ ...form, extra_costs: extraCosts }).unwrap();
      setSuccess(true);
    } catch {}
  };

  if (isLoading) return <div>Loading config...</div>;
  if (isError) return <div className="text-danger">{error?.error || 'Failed to load config.'}</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 className="mb-4">Acceptance Letter Settings</h3>
      {fields.map(f => (
        <div className="mb-3" key={f.name}>
          <label className="form-label">{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea
              className="form-control"
              name={f.name}
              value={form[f.name] || ''}
              onChange={handleChange}
              rows={3}
            />
          ) : (
            <input
              type="text"
              className="form-control"
              name={f.name}
              value={form[f.name] || ''}
              onChange={handleChange}
            />
          )}
          {f.name === 'intake' && intakeError && (
            <div className="form-text text-danger">{intakeError}</div>
          )}
        </div>
      ))}
      <div className="mb-4">
        <label className="form-label">Extra Costs</label>
        {extraCosts.map((cost, idx) => (
          <div className="d-flex align-items-center mb-2" key={idx}>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Label (e.g. Visa Fee)"
              value={cost.label}
              onChange={e => handleExtraCostChange(idx, 'label', e.target.value)}
              style={{ maxWidth: 180 }}
            />
            <input
              type="text"
              className="form-control me-2"
              placeholder="Value (e.g. USD83)"
              value={cost.value}
              onChange={e => handleExtraCostChange(idx, 'value', e.target.value)}
              style={{ maxWidth: 180 }}
            />
            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveExtraCost(idx)}>&times;</button>
          </div>
        ))}
        <div>
          <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={handleAddExtraCost}>Add Extra Cost</button>
        </div>
      </div>
  <button type="submit" className="btn btn-primary" disabled={isSaving || !!intakeError}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
      {success && <span className="text-success ms-3">Settings updated!</span>}
    </form>
  );
};

export default AcceptanceLetterConfigForm; 