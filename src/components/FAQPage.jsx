import React, { useState } from 'react';
import { useGetFaqsQuery, useAddFaqMutation, useDeleteFaqMutation } from '../api/apiSlice';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import Modal from 'react-bootstrap/Modal';

const CATEGORY_LABELS = {
  general: 'General',
  application: 'Application-Related',
  contact: 'Contact Information',
  technical: 'Technical',
};

function highlight(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
}

const DEFAULT_FORM = {
  question: '',
  answer: '',
  category: 'general',
  is_active: true,
  order: 0,
};

const FAQPage = () => {
  const { data: faqs = [], isLoading, error } = useGetFaqsQuery();
  const [addFaq, { isLoading: isAdding, error: addError, isSuccess: addSuccess }] = useAddFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();
  const user = useSelector(state => state.auth.user);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!user?.is_superuser) return <Navigate to="/" replace />;

  // Filter and group FAQs by category
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = filteredFaqs.reduce((acc, faq) => {
    acc[faq.category] = acc[faq.category] || [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddFaq = async e => {
    e.preventDefault();
    setFormError(null);
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError('Question and answer are required.');
      return;
    }
    try {
      await addFaq(form).unwrap();
      setForm(DEFAULT_FORM);
      setShowModal(false);
    } catch (err) {
      setFormError('Failed to add FAQ.');
    }
  };

  const handleDeleteFaq = async id => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await deleteFaq(id).unwrap();
    } catch (err) {
      alert('Failed to delete FAQ.');
    }
  };

  const handleOpenModal = () => {
    setForm(DEFAULT_FORM);
    setFormError(null);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Frequently Asked Questions (FAQs)</h2>
        <button className="btn btn-primary" onClick={handleOpenModal}>Add FAQ</button>
      </div>
      {/* Add FAQ Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-2 align-items-end" onSubmit={handleAddFaq}>
            <div className="col-12 mb-2">
              <label className="form-label">Category</label>
              <select className="form-select" name="category" value={form.category} onChange={handleFormChange}>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="col-12 mb-2">
              <label className="form-label">Order</label>
              <input type="number" className="form-control" name="order" value={form.order} onChange={handleFormChange} min={0} placeholder="e.g. 1 (lower numbers show first)" />
            </div>
            <div className="col-12 mb-2">
              <label className="form-label">Question</label>
              <input type="text" className="form-control" name="question" value={form.question} onChange={handleFormChange} required placeholder="Enter the FAQ question here" />
            </div>
            <div className="col-12 mb-2">
              <label className="form-label">Answer</label>
              <textarea className="form-control" name="answer" value={form.answer} onChange={handleFormChange} rows={2} required placeholder="Enter the answer to the FAQ here" />
            </div>
            <div className="col-12 mb-2">
              <label className="form-label">Active</label>
              <input type="checkbox" className="form-check-input ms-2" name="is_active" checked={form.is_active} onChange={handleFormChange} />
              <span className="ms-2 text-muted">Check to make this FAQ visible</span>
            </div>
            {formError && <div className="col-12 text-danger">{formError}</div>}
            {addError && <div className="col-12 text-danger">Failed to add FAQ.</div>}
            <div className="col-12 mt-2">
              <button type="submit" className="btn btn-primary w-100" disabled={isAdding}>Add FAQ</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search FAQs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>
      {isLoading && <div>Loading FAQs...</div>}
      {error && <div className="text-danger">Error loading FAQs.</div>}
      {!isLoading && !error && Object.keys(grouped).length === 0 && <div>No FAQs found.</div>}
      {Object.entries(grouped).map(([category, faqs]) => (
        <div key={category} className="mb-4">
          <h4 className="mb-3" style={{ color: '#0d6efd' }}>{CATEGORY_LABELS[category] || category}</h4>
          <Accordion alwaysOpen>
            {faqs.map((faq, idx) => (
              <Accordion.Item eventKey={String(faq.id)} key={faq.id}>
                <Accordion.Header><span style={{ fontWeight: 'bold' }}>{highlight(faq.question, search)}</span></Accordion.Header>
                <Accordion.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>{highlight(faq.answer, search)}</div>
                    <button
                      className="btn btn-sm btn-outline-danger ms-3"
                      style={{ whiteSpace: 'nowrap', height: 32 }}
                      onClick={() => handleDeleteFaq(faq.id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
};

export default FAQPage; 