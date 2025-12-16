import { createSlice } from '@reduxjs/toolkit';

const access = localStorage.getItem('access');
const refresh = localStorage.getItem('refresh');

const initialState = {
  access: access || null,
  refresh: refresh || null,
  isAuthenticated: !!access,
  user: null,
  userLoading: false,
  userError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.isAuthenticated = true;
      localStorage.setItem('access', action.payload.access);
      localStorage.setItem('refresh', action.payload.refresh);
    },
    logout: (state) => {
      state.access = null;
      state.refresh = null;
      state.isAuthenticated = false;
      state.user = null;
      state.userLoading = false;
      state.userError = null;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.userLoading = false;
      state.userError = null;
    },
    setUserLoading: (state, action) => {
      state.userLoading = action.payload;
    },
    setUserError: (state, action) => {
      state.userError = action.payload;
      state.userLoading = false;
    },
    refreshToken: (state, action) => {
      state.access = action.payload.access;
      localStorage.setItem('access', action.payload.access);
    },
  },
});

export const { loginSuccess, logout, setUser, setUserLoading, setUserError, refreshToken } = authSlice.actions;
export default authSlice.reducer; 