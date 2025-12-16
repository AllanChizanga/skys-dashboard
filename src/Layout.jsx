import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BsHouse, BsChat, BsBoxArrowRight, BsPeople, BsCardList, BsFileEarmarkText, BsClipboardCheck, BsPersonBadge, BsChevronDown, BsChevronRight, BsEnvelope, BsGear } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser, setUserLoading, setUserError } from './redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { API_ROOT } from './redux/api';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [studentsDrawerOpen, setStudentsDrawerOpen] = useState(false);
  // Auto-close students drawer when collapsing
  useEffect(() => {
    if (collapsed) setStudentsDrawerOpen(false);
  }, [collapsed]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const userLoading = useSelector((state) => state.auth.userLoading);
  const access = useSelector((state) => state.auth.access);

  // Auto-fetch user data if authenticated but user data is missing
  useEffect(() => {
    if (isAuthenticated && access && !user && !userLoading) {
      dispatch(setUserLoading(true));
      (async () => {
        try {
          let response;
          try {
            response = await fetch(`${API_ROOT}/api/users-admin/me/`, {
              headers: { Authorization: `Bearer ${access}` }
            });
          } catch (networkErr) {
            console.error('Network error fetching user data:', networkErr);
            dispatch(setUserError('Network error: failed to load user data. Please check your connection.'));
            // On network error, don't immediately logout — allow user to retry
            return;
          }

          if (response.ok) {
            const userData = await response.json();
            console.log('Auto-fetched userData:', userData);
            dispatch(setUser(userData));
          } else {
            console.error('Error fetching user data, status:', response.status);
            dispatch(setUserError('Failed to load user data'));
            // If we can't fetch user data due to auth or server error, logout
            dispatch(logout());
            navigate('/login');
          }
        } catch (err) {
          console.error('Unexpected error fetching user data:', err);
          dispatch(setUserError('Failed to load user data'));
          dispatch(logout());
          navigate('/login');
        }
      })();
    }
  }, [isAuthenticated, access, user, userLoading, dispatch, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Top Navbar - fixed */}
      <Navbar bg="light" expand="lg" className="shadow-sm fixed-top" style={{ minHeight: 64, zIndex: 1040 }}>
        <Container fluid>
          <Navbar.Brand style={{ fontWeight: 700 }}>Admin Panel</Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            {userLoading ? (
              <div className="text-muted" style={{ fontSize: '14px' }}>
                Loading...
              </div>
            ) : user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-user" style={{ fontWeight: 500 }}>
                  {user.username || 'Admin'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown-menu">
                  <Dropdown.Item disabled>
                    <BsEnvelope className="me-2 text-secondary" />{user.email || 'No email'}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {user?.is_superuser && (
                    <Dropdown.Item onClick={() => navigate('/users-admin')}>
                      <BsPersonBadge className="me-2 text-primary" />Manage Users
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    onClick={() => {
                      if (window.confirm('Are you sure you want to logout?')) {
                        dispatch(logout());
                        navigate('/login');
                      }
                    }}
                  >
                    <BsBoxArrowRight className="me-2 text-danger" />Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : null}
          </Nav>
        </Container>
      </Navbar>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar - fixed */}
        <nav
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            height: '100vh',
            width: collapsed ? '60px' : '200px',
            background: '#222',
            color: '#fff',
            transition: 'width 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: collapsed ? 'center' : 'flex-start',
            padding: '10px 0',
            zIndex: 1030,
            overflowY: 'auto',
          }}
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              margin: collapsed ? '10px 0' : '10px',
              alignSelf: collapsed ? 'center' : 'flex-end',
              background: '#444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: collapsed ? '40px' : 'auto',
            }}
          >
            {collapsed ? '→' : '←'}
          </button>
          <div style={{ marginTop: '20px', width: '100%' }}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                display: 'block',
                color: isActive ? '#222' : '#fff',
                background: isActive ? '#fff' : 'transparent',
                textDecoration: 'none',
                padding: '10px 20px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '6px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background 0.2s, color 0.2s',
              })}
              end
            >
              {collapsed ? <BsHouse size={20} /> : 'Home'}
            </NavLink>
            {user?.is_superuser && (
              <NavLink
                to="/chat"
                style={({ isActive }) => ({
                  display: 'block',
                  color: isActive ? '#222' : '#fff',
                  background: isActive ? '#fff' : 'transparent',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '6px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'background 0.2s, color 0.2s',
                })}
              >
                {collapsed ? <BsChat size={20} /> : 'Chat Analytics'}
              </NavLink>
            )}
            <NavLink
              to="/users"
              style={({ isActive }) => ({
                display: 'block',
                color: isActive ? '#222' : '#fff',
                background: isActive ? '#fff' : 'transparent',
                textDecoration: 'none',
                padding: '10px 20px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '6px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background 0.2s, color 0.2s',
              })}
            >
              {collapsed ? <BsPeople size={20} /> : 'Chatbot Users'}
            </NavLink>

            <NavLink
              to="/registration-status"
              style={({ isActive }) => ({
                display: 'block',
                color: isActive ? '#222' : '#fff',
                background: isActive ? '#fff' : 'transparent',
                textDecoration: 'none',
                padding: '10px 20px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '6px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background 0.2s, color 0.2s',
              })}
            >
              {collapsed ? <BsClipboardCheck size={20} /> : 'Registration Status'}
            </NavLink>

            {/* Students Drawer Group */}
            <div
              style={{
                width: '100%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? '10px 0' : '10px 20px',
                color: '#fff',
                borderRadius: '6px',
                userSelect: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onClick={() => !collapsed && setStudentsDrawerOpen((open) => !open)}
              title={collapsed ? 'Students' : undefined}
            >
              <BsPeople size={20} />
              {!collapsed && <span style={{ flex: 1, marginLeft: 8 }}>Students</span>}
              {!collapsed && (studentsDrawerOpen ? <BsChevronDown size={16} /> : <BsChevronRight size={16} />)}
            </div>
            {/* Drawer links, only show if open and not collapsed */}
            {!collapsed && studentsDrawerOpen && (
              <div style={{ width: '100%' }}>
                <NavLink
                  to="/registered-users"
                  style={({ isActive }) => ({
                    display: 'block',
                    color: isActive ? '#222' : '#fff',
                    background: isActive ? '#fff' : 'transparent',
                    textDecoration: 'none',
                    padding: '10px 36px',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '6px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    fontSize: '0.97em',
                    transition: 'background 0.2s, color 0.2s',
                  })}
                >
                  Registered
                </NavLink>
                <NavLink
                  to="/pending-students"
                  style={({ isActive }) => ({
                    display: 'block',
                    color: isActive ? '#222' : '#fff',
                    background: isActive ? '#fff' : 'transparent',
                    textDecoration: 'none',
                    padding: '10px 36px',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '6px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    fontSize: '0.97em',
                    transition: 'background 0.2s, color 0.2s',
                  })}
                >
                  Pending
                </NavLink>
                <NavLink
                  to="/rejected-students"
                  style={({ isActive }) => ({
                    display: 'block',
                    color: isActive ? '#222' : '#fff',
                    background: isActive ? '#fff' : 'transparent',
                    textDecoration: 'none',
                    padding: '10px 36px',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '6px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    fontSize: '0.97em',
                    transition: 'background 0.2s, color 0.2s',
                  })}
                >
                  Rejected
                </NavLink>
              </div>
            )}
            <NavLink
              to="/programs"
              style={({ isActive }) => ({
                display: 'block',
                color: isActive ? '#222' : '#fff',
                background: isActive ? '#fff' : 'transparent',
                textDecoration: 'none',
                padding: '10px 20px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '6px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background 0.2s, color 0.2s',
              })}
            >
              {collapsed ? <BsCardList size={20} /> : 'Programs'}
            </NavLink>
            <NavLink
              to="/scholarships"
              style={({ isActive }) => ({
                display: 'block',
                color: isActive ? '#222' : '#fff',
                background: isActive ? '#fff' : 'transparent',
                textDecoration: 'none',
                padding: '10px 20px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '6px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background 0.2s, color 0.2s',
              })}
            >
              {collapsed ? <BsPersonBadge size={20} /> : 'Scholarships'}
            </NavLink>
            {user?.is_superuser && (
              <NavLink
                to="/faqs"
                style={({ isActive }) => ({
                  display: 'block',
                  color: isActive ? '#222' : '#fff',
                  background: isActive ? '#fff' : 'transparent',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '6px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'background 0.2s, color 0.2s',
                })}
              >
                {collapsed ? <BsCardList size={20} /> : 'FAQs'}
              </NavLink>
            )}
          </div>
        </nav>
        {/* Main content area with left and top padding */}
        <main style={{
          flex: 1,
          marginLeft: collapsed ? '60px' : '200px',
          paddingTop: 74, // 64px navbar + 10px gap
          paddingRight: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          minHeight: '100vh',
          width: '100%',
          transition: 'margin-left 0.2s',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', }}>
            <Outlet />
          </div>
        </main>
      </div>
      <style>{`
.custom-dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  transition: background 0.2s, color 0.2s;
}
.custom-dropdown-menu .dropdown-item:active,
.custom-dropdown-menu .dropdown-item:hover {
  background: #e9f2ff !important;
  color: #0d6efd !important;
}
.custom-dropdown-menu .dropdown-item .text-danger {
  color: #dc3545 !important;
}
.custom-dropdown-menu .dropdown-item .text-primary {
  color: #0d6efd !important;
}
.custom-dropdown-menu .dropdown-item .text-secondary {
  color: #6c757d !important;
}
`}</style>
    </div>
  );
};

export default Layout; 