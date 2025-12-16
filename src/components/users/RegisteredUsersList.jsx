import React, { useState, useEffect, useCallback } from 'react';
import { useGetRegisteredUsersQuery } from '../../api/registeredUsersApiSlice';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 9;

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
      {/* First page & Previous */}
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

const RegisteredUsersList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useGetRegisteredUsersQuery({ page, page_size: PAGE_SIZE, search });
  const users = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">Registered Students</h2>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search registered users"
          />
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        </div>
      </div>
      <div className="row g-4">
        {isLoading ? (
          <div className="col-12 text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : isError ? (
          <div className="col-12 text-danger text-center py-5">{error?.error || 'Failed to load registered users.'}</div>
        ) : users.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No registered users found.</div>
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
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-5">
          <div className="d-flex flex-column align-items-center gap-3">
            {/* Page info */}
            <div className="text-muted">
              Showing page {page} of {totalPages} • {count} total students
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

export default RegisteredUsersList;