import React, { useState, useEffect, useCallback } from 'react';
import { useGetPendingUsersQuery } from '../../api/pendingUsersApiSlice';
import { useEditRegistrationStatusMutation, useAddRegistrationStatusMutation } from '../../api/registrationStatusApiSlice';
import { Link } from 'react-router-dom';
import { Alert, Spinner, Button, Modal } from 'react-bootstrap';

const PAGE_SIZE = 9;

const PendingStudentsList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState({ show: false, user: null, action: '' });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch } = useGetPendingUsersQuery({ page, page_size: PAGE_SIZE, search });
  const [editRegistrationStatus] = useEditRegistrationStatusMutation();
  const [addRegistrationStatus] = useAddRegistrationStatusMutation();
  
  const users = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

  const handleStatusChange = async (user, newStatus) => {
    try {
      // console.log('User data:', user);
      // console.log('New status:', newStatus);
      
      // Since we know this user has a registration status (they're in pending list),
      // let's find it first through the registration status API
      try {
        // First, try to get all registration statuses and find this user's
        const { data: allStatuses } = await fetch('/api/registration-status/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          }
        }).then(res => res.json());
        
        // Find this user's registration status
        const userRegistrationStatus = allStatuses?.results?.find(status => status.user === user.id);
        
        if (userRegistrationStatus) {
          // Update existing registration status
          // console.log('Found existing status, updating with ID:', userRegistrationStatus.id);
          const updateData = {
            id: userRegistrationStatus.id,
            user: user.id,
            status: newStatus
          };
          // console.log('Update data:', updateData);
          await editRegistrationStatus(updateData).unwrap();
        } else {
          // Fallback: create new (though this shouldn't happen for pending users)
          // console.log('No existing status found, creating new one for user ID:', user.id);
          const createData = {
            user: user.id,
            status: newStatus
          };
          // console.log('Create data:', createData);
          await addRegistrationStatus(createData).unwrap();
        }
      } catch (fetchError) {
        // console.log('Fetch approach failed, trying direct API calls:', fetchError);
        
        // Fallback to original approach
        if (user.registration_status && user.registration_status.id) {
          await editRegistrationStatus({
            id: user.registration_status.id,
            user: user.id,
            status: newStatus
          }).unwrap();
        } else {
          await addRegistrationStatus({
            user: user.id,
            status: newStatus
          }).unwrap();
        }
      }
      
      setShowAlert({
        show: true,
        message: `Student ${user.name || user.email || 'Student'} has been ${newStatus}.`,
        type: 'success'
      });
      
      // Refresh the data
      refetch();
      
      // Hide alert after 3 seconds
      setTimeout(() => setShowAlert({ show: false, message: '', type: '' }), 3000);
      
    } catch (error) {
      // console.error('Error updating status:', error);
      // console.error('Error details:', JSON.stringify(error, null, 2));
      setShowAlert({
        show: true,
        message: `Failed to update status for ${user.name || user.email || 'Student'}. Please try again. Error: ${error?.data?.detail || error?.data?.user?.[0] || 'Unknown error'}`,
        type: 'danger'
      });
      setTimeout(() => setShowAlert({ show: false, message: '', type: '' }), 5000);
    }
  };

  const confirmStatusChange = (user, action) => {
    setShowConfirmModal({ show: true, user, action });
  };

  const handleConfirm = () => {
    const { user, action } = showConfirmModal;
    handleStatusChange(user, action);
    setShowConfirmModal({ show: false, user: null, action: '' });
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">Pending Students</h2>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search pending students"
          />
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        </div>
      </div>

      {/* Alert for status changes */}
      {showAlert.show && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert({ show: false, message: '', type: '' })}>
          {showAlert.message}
        </Alert>
      )}

      <div className="row g-4">
        {isLoading ? (
          <div className="col-12 text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : isError ? (
          <div className="col-12 text-danger text-center py-5">{error?.error || 'Failed to load pending students.'}</div>
        ) : users.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No pending students found.</div>
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
                  
                  {/* Action Buttons */}
                  <div className="d-flex gap-2 mb-3">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => confirmStatusChange(user, 'accepted')}
                      className="rounded-pill"
                    >
                      ✓ Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmStatusChange(user, 'rejected')}
                      className="rounded-pill"
                    >
                      ✗ Reject
                    </Button>
                  </div>
                  
                  <Link to={`/users/${user.id}`} className="btn btn-outline-primary btn-sm rounded-pill">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal.show} onHide={() => setShowConfirmModal({ show: false, user: null, action: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to <strong>{showConfirmModal.action}</strong> the application for{' '}
          <strong>{showConfirmModal.user?.name}</strong>?
          {showConfirmModal.action === 'accepted' && (
            <div className="mt-2 text-success">
              <small>This student will be moved to the accepted students list and may receive acceptance communications.</small>
            </div>
          )}
          {showConfirmModal.action === 'rejected' && (
            <div className="mt-2 text-danger">
              <small>This student will be moved to the rejected students list.</small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal({ show: false, user: null, action: '' })}>
            Cancel
          </Button>
          <Button 
            variant={showConfirmModal.action === 'accepted' ? 'success' : 'danger'} 
            onClick={handleConfirm}
          >
            {showConfirmModal.action === 'accepted' ? 'Accept Student' : 'Reject Student'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5">
          <ul className="pagination pagination-lg shadow-sm">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(page - 1)}>&laquo;</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(p)}>{p}</button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(page + 1)}>&raquo;</button>
            </li>
          </ul>
        </nav>
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
        }
        .pagination .page-item.active .page-link {
          background: #0d6efd;
          color: #fff;
          border: none;
        }
        .pagination .page-link:focus {
          box-shadow: 0 0 0 2px #0d6efd55;
        }
      `}</style>
    </div>
  );
};

export default PendingStudentsList; 