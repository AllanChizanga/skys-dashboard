import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import authReducer from './authSlice';
import { apiSlice } from '../api/apiSlice';

const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store; 