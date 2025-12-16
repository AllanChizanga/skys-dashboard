import React, { useState, useEffect, useCallback } from 'react';
import { useGetProgramsQuery } from '../../api/apiSlice';

const PAGE_SIZE = 20;

const ProgramsList = ({ onAddClick, onEditClick }) => {
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

  const { data, isLoading, isError, error } = useGetProgramsQuery({ page, page_size: PAGE_SIZE, search });
  const programs = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">Programs</h2>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by program name..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search programs"
          />
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        </div>
        <button className="btn btn-primary" onClick={onAddClick}>Add Program</button>
      </div>
      {isLoading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
      ) : isError ? (
        <div className="text-danger text-center py-5">{error?.error || 'Failed to load programs.'}</div>
      ) : programs.length === 0 ? (
        <div className="text-center py-5 text-muted">No programs found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle shadow-sm">
            <thead className="table-light">
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Duration</th>
                <th>Tuition</th>
                <th>Admission Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, idx) => (
                <tr key={program.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{program.name}</td>
                  <td>{program.duration}</td>
                  <td>{program.tuition}</td>
                  <td>{program.admission_fee}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => onEditClick(program)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-4">
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

export default ProgramsList; 