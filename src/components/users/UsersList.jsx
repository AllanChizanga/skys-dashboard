import React, { useState, useEffect, useCallback } from 'react';
import { useGetUsersQuery } from '../../api/usersApiSlice';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PAGE_SIZE = 9;

// Reusable Pagination Component
const PaginationRange = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Define how many page numbers to show (excluding first, last, and ellipsis)
  const maxVisible = 5;
  
  // Calculate range of pages to show
  let startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
  
  // Adjust if we're near the beginning
  if (startPage <= 2) {
    startPage = 2;
    endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
  }
  
  // Adjust if we're near the end
  if (endPage >= totalPages - 1) {
    endPage = totalPages - 1;
    startPage = Math.max(2, endPage - maxVisible + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Show ellipsis conditions
  const showStartEllipsis = startPage > 2;
  const showEndEllipsis = endPage < totalPages - 1;

  return (
    <ul className="pagination pagination-lg shadow-sm mb-0">
      {/* Previous button */}
      <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous"
        >
          &laquo;
        </button>
      </li>
      
      {/* Page 1 - Always show first page */}
      <li className={`page-item${currentPage === 1 ? ' active' : ''}`}>
        <button className="page-link" onClick={() => onPageChange(1)}>1</button>
      </li>
      
      {/* Start ellipsis */}
      {showStartEllipsis && (
        <li className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      )}
      
      {/* Middle pages */}
      {pages.map(p => (
        <li key={p} className={`page-item${p === currentPage ? ' active' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
        </li>
      ))}
      
      {/* End ellipsis */}
      {showEndEllipsis && (
        <li className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      )}
      
      {/* Last page - Always show if there's more than 1 page */}
      {totalPages > 1 && (
        <li className={`page-item${currentPage === totalPages ? ' active' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </li>
      )}
      
      {/* Next button */}
      <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next"
        >
          &raquo;
        </button>
      </li>
    </ul>
  );
};

const UsersList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get auth token from Redux store
  const authToken = useSelector(state => state.auth.access);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    preferred_contact_times: '',
    preferred_contact_days: [],
    note_to_admin: '',
    preferred_countries: '',
  });

  // File state
  const [idDocuments, setIdDocuments] = useState([]);
  const [resultDocuments, setResultDocuments] = useState([]);

  // Sponsors state
  const [sponsors, setSponsors] = useState([
    { name: '', relationship: '', phone: '', email: '', address: '' }
  ]);

  // Days of the week for selection
  const daysOfWeek = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  // Contact times options
  const contactTimes = [
    { value: 'morning', label: 'Morning (8AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
    { value: 'evening', label: 'Evening (5PM - 9PM)' }
  ];

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch } = useGetUsersQuery({ page, page_size: PAGE_SIZE, search });

  // Pagination meta from DRF
  const users = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDaySelection = (dayValue) => {
    setFormData(prev => {
      const currentDays = prev.preferred_contact_days || [];
      const isSelected = currentDays.includes(dayValue);
      
      if (isSelected) {
        // Remove day if already selected
        return {
          ...prev,
          preferred_contact_days: currentDays.filter(day => day !== dayValue)
        };
      } else {
        // Add day if not selected
        return {
          ...prev,
          preferred_contact_days: [...currentDays, dayValue]
        };
      }
    });
  };

  const handleIdDocumentChange = (index, field, value) => {
    const updatedDocs = [...idDocuments];
    updatedDocs[index] = {
      ...updatedDocs[index],
      [field]: value
    };
    setIdDocuments(updatedDocs);
  };

  const handleResultDocumentChange = (index, field, value) => {
    const updatedDocs = [...resultDocuments];
    updatedDocs[index] = {
      ...updatedDocs[index],
      [field]: value
    };
    setResultDocuments(updatedDocs);
  };

  // Sponsor handlers
  const handleSponsorChange = (index, field, value) => {
    const updatedSponsors = [...sponsors];
    updatedSponsors[index] = {
      ...updatedSponsors[index],
      [field]: value
    };
    setSponsors(updatedSponsors);
  };

  const addSponsor = () => {
    if (sponsors.length < 2) {
      setSponsors(prev => [...prev, { name: '', relationship: '', phone: '', email: '', address: '' }]);
    }
  };

  const removeSponsor = (index) => {
    if (sponsors.length > 1) {
      setSponsors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addIdDocument = () => {
    setIdDocuments(prev => [...prev, { document: null, document_type: '' }]);
  };

  const removeIdDocument = (index) => {
    setIdDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const addResultDocument = () => {
    setResultDocuments(prev => [...prev, { document: null, document_hash: '' }]);
  };

  const removeResultDocument = (index) => {
    setResultDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, type, file) => {
    if (type === 'id') {
      handleIdDocumentChange(index, 'document', file);
    } else {
      handleResultDocumentChange(index, 'document', file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!authToken) {
      alert('Authentication token not found. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('preferred_contact_times', formData.preferred_contact_times);
      
      // Handle preferred_contact_days as comma-separated string
      if (formData.preferred_contact_days.length > 0) {
        formDataToSend.append('preferred_contact_days', formData.preferred_contact_days.join(','));
      }
      
      formDataToSend.append('note_to_admin', formData.note_to_admin);
      
      // Handle preferred_countries as JSON array
      if (formData.preferred_countries) {
        const countriesArray = formData.preferred_countries
          .split(',')
          .map(country => country.trim())
          .filter(country => country.length > 0);
        
        // Append as JSON string or individual entries based on API expectation
        formDataToSend.append('preferred_countries', JSON.stringify(countriesArray));
      }

      // Append sponsors as JSON array
      const validSponsors = sponsors.filter(sponsor => 
        sponsor.name.trim() !== '' || 
        sponsor.relationship.trim() !== '' || 
        sponsor.phone.trim() !== '' || 
        sponsor.email.trim() !== '' || 
        sponsor.address.trim() !== ''
      );
      
      if (validSponsors.length > 0) {
        formDataToSend.append('sponsors', JSON.stringify(validSponsors));
      }

      // Append ID documents - try different formats
      idDocuments.forEach((doc, index) => {
        if (doc.document && doc.document_type) {
          formDataToSend.append('id_documents', doc.document); // File
          formDataToSend.append('id_document_types', doc.document_type); // Type as separate field
        }
      });

      // Append result documents - try different formats
      resultDocuments.forEach((doc, index) => {
        if (doc.document && doc.document_hash) {
          formDataToSend.append('result_documents', doc.document); // File
          formDataToSend.append('result_document_hashes', doc.document_hash); // Hash as separate field
        }
      });

      // Debug: Log what we're sending
      console.log('Form data entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await fetch('http://api.skiesprogress.co.zw/api/users/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // Let browser set Content-Type with boundary for FormData
        },
        body: formDataToSend,
      });

      // Get the response text first to see what the server is returning
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { detail: responseText || 'Unknown error' };
        }
        
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = JSON.parse(responseText);
      console.log('User created successfully:', result);
      
      // Close modal and reset form
      setShowAddUserModal(false);
      resetForm();
      
      // Refetch users to show the new user
      refetch();
      
      alert('User created successfully!');
      
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Error creating user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone_number: '',
      email: '',
      preferred_contact_times: '',
      preferred_contact_days: [],
      note_to_admin: '',
      preferred_countries: '',
    });
    setIdDocuments([]);
    setResultDocuments([]);
    setSponsors([{ name: '', relationship: '', phone: '', email: '', address: '' }]);
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">Chatbot Users</h2>
        <div className="d-flex gap-3">
          <div className="input-group" style={{ maxWidth: 320 }}>
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Search by name, email, or phone..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              aria-label="Search users"
            />
            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddUserModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add User
          </button>
        </div>
      </div>
      
      <div className="row g-4">
        {isLoading ? (
          <div className="col-12 text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : isError ? (
          <div className="col-12 text-danger text-center py-5">{error?.error || 'Failed to load users.'}</div>
        ) : users.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No users found.</div>
        ) : (
          users.map(user => (
            <div className="col-md-6 col-lg-4" key={user.id}>
              <div className="card shadow-sm h-100 border-0 user-card-hover">
                <div className="card-body">
                  <h5 className="card-title mb-2 text-primary fw-bold">{user.name}</h5>
                  <p className="card-text mb-1"><strong>Email:</strong> {user.email}</p>
                  <p className="card-text mb-1"><strong>Phone:</strong> {user.phone_number}</p>
                  <p className="card-text mb-2 text-muted" style={{ fontSize: '0.9em' }}>
                    <strong>Applied:</strong> {user.application_date ? new Date(user.application_date).toLocaleString() : 'N/A'}
                    {user.registration_date && (
                      <><br/><strong>Registered:</strong> {new Date(user.registration_date).toLocaleString()}</>
                    )}
                  </p>
                  <Link to={`/users/${user.id}`} className="btn btn-outline-primary btn-sm rounded-pill">View Details</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls - Updated */}
      {totalPages > 1 && (
        <div className="mt-5">
          <div className="d-flex flex-column align-items-center gap-3">
            {/* Page info */}
            <div className="text-muted">
              Showing page {page} of {totalPages} • {count} total users
            </div>
            
            {/* Pagination */}
            <nav aria-label="Page navigation">
              <PaginationRange 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </nav>
            
            {/* Quick jump */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Go to page:</span>
              <div className="input-group" style={{ width: '120px' }}>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="1"
                  max={totalPages}
                  value={page}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      handlePageChange(val);
                    }
                  }}
                />
                <span className="input-group-text bg-white" style={{ fontSize: '0.9rem' }}>
                  / {totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddUserModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    {/* Preferred Contact Times - Select Dropdown */}
                    <div className="col-md-6">
                      <label className="form-label">Preferred Contact Times</label>
                      <select
                        className="form-select"
                        name="preferred_contact_times"
                        value={formData.preferred_contact_times}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a time period</option>
                        {contactTimes.map(time => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Preferred Contact Days - Multiple Selection */}
                    <div className="col-md-6">
                      <label className="form-label">Preferred Contact Days</label>
                      <div className="border rounded p-3 bg-light">
                        <div className="row g-2">
                          {daysOfWeek.map(day => (
                            <div key={day.value} className="col-6 col-md-4">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`day-${day.value}`}
                                  checked={formData.preferred_contact_days.includes(day.value)}
                                  onChange={() => handleDaySelection(day.value)}
                                />
                                <label className="form-check-label small" htmlFor={`day-${day.value}`}>
                                  {day.label}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                        {formData.preferred_contact_days.length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">
                              Selected: {formData.preferred_contact_days.join(', ')}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Preferred Countries</label>
                      <input
                        type="text"
                        className="form-control"
                        name="preferred_countries"
                        value={formData.preferred_countries}
                        onChange={handleInputChange}
                        placeholder="e.g., Zimbabwe, South Africa, USA"
                      />
                      <div className="form-text">Enter countries separated by commas</div>
                    </div>

                    {/* Sponsors Section */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">Sponsors (Optional)</label>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-secondary" 
                          onClick={addSponsor}
                          disabled={sponsors.length >= 2}
                        >
                          <i className="bi bi-plus me-1"></i>Add Sponsor
                        </button>
                      </div>
                      {sponsors.map((sponsor, index) => (
                        <div key={index} className="card mb-3 border-primary">
                          <div className="card-header py-2 bg-light d-flex justify-content-between align-items-center">
                            <small className="fw-bold">Sponsor {index + 1}</small>
                            {sponsors.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeSponsor(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="row g-2">
                              <div className="col-md-6">
                                <label className="form-label small">Name</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Sponsor name"
                                  value={sponsor.name}
                                  onChange={(e) => handleSponsorChange(index, 'name', e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small">Relationship</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="e.g., Parent, Guardian, Relative"
                                  value={sponsor.relationship}
                                  onChange={(e) => handleSponsorChange(index, 'relationship', e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small">Phone</label>
                                <input
                                  type="tel"
                                  className="form-control form-control-sm"
                                  placeholder="Phone number"
                                  value={sponsor.phone}
                                  onChange={(e) => handleSponsorChange(index, 'phone', e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small">Email</label>
                                <input
                                  type="email"
                                  className="form-control form-control-sm"
                                  placeholder="Email address"
                                  value={sponsor.email}
                                  onChange={(e) => handleSponsorChange(index, 'email', e.target.value)}
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label small">Address</label>
                                <textarea
                                  className="form-control form-control-sm"
                                  placeholder="Full address"
                                  rows="2"
                                  value={sponsor.address}
                                  onChange={(e) => handleSponsorChange(index, 'address', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {sponsors.length >= 2 && (
                        <div className="text-center">
                          <small className="text-muted">Maximum of 2 sponsors allowed</small>
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Note to Admin</label>
                      <textarea
                        className="form-control"
                        name="note_to_admin"
                        value={formData.note_to_admin}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>

                    {/* ID Documents Section */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">ID Documents (Optional)</label>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addIdDocument}>
                          <i className="bi bi-plus me-1"></i>Add Document
                        </button>
                      </div>
                      {idDocuments.map((doc, index) => (
                        <div key={index} className="card mb-2">
                          <div className="card-body py-2">
                            <div className="row g-2 align-items-center">
                              <div className="col-md-5">
                                <input
                                  type="file"
                                  className="form-control form-control-sm"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(index, 'id', e.target.files[0])}
                                />
                              </div>
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Document Type (e.g., passport, id_card)"
                                  value={doc.document_type}
                                  onChange={(e) => handleIdDocumentChange(index, 'document_type', e.target.value)}
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeIdDocument(index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Result Documents Section */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">Result Documents (Optional)</label>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addResultDocument}>
                          <i className="bi bi-plus me-1"></i>Add Document
                        </button>
                      </div>
                      {resultDocuments.map((doc, index) => (
                        <div key={index} className="card mb-2">
                          <div className="card-body py-2">
                            <div className="row g-2 align-items-center">
                              <div className="col-md-5">
                                <input
                                  type="file"
                                  className="form-control form-control-sm"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(index, 'result', e.target.files[0])}
                                />
                              </div>
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Document Hash"
                                  value={doc.document_hash}
                                  onChange={(e) => handleResultDocumentChange(index, 'document_hash', e.target.value)}
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeResultDocument(index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowAddUserModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .user-card-hover:hover {
          box-shadow: 0 0 0 4px #0d6efd22;
          transform: translateY(-2px) scale(1.01);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pagination .page-link {
          border-radius: 50px !important;
          margin: 0 2px;
          min-width: 50px;
          text-align: center;
        }
        .pagination .page-item.active .page-link {
          background: #0d6efd;
          color: #fff;
          border: none;
          font-weight: bold;
        }
        .pagination .page-link:focus {
          box-shadow: 0 0 0 2px #0d6efd55;
        }
        .pagination .page-item.disabled .page-link {
          color: #6c757d;
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default UsersList;