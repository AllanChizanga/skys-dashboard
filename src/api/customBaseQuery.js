import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ROOT } from '../redux/api';
import { logout, loginSuccess, setUser } from '../redux/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: API_ROOT,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.access;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const customBaseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Normalize network-level errors from fetchBaseQuery to include a friendly message
  if (result.error && (result.error.status === 'FETCH_ERROR' || result.error.status === 'TIMEOUT_ERROR')) {
    result.error = {
      ...result.error,
      data: { detail: 'Network error: please check your internet connection and try again.' },
    };
    return result;
  }

  if (result.error && result.error.status === 401) {
    const refresh = api.getState().auth.refresh;
    if (refresh) {
      const refreshResult = await baseQuery(
        {
          url: '/api/token/refresh/',
          method: 'POST',
          body: { refresh },
        },
        api,
        extraOptions
      );
      // If refresh failed due to network, attach friendly message and return
      if (refreshResult.error && (refreshResult.error.status === 'FETCH_ERROR' || refreshResult.error.status === 'TIMEOUT_ERROR')) {
        return {
          error: {
            ...refreshResult.error,
            data: { detail: 'Network error: please check your internet connection and try again.' },
          },
        };
      }
      if (refreshResult.data && refreshResult.data.access) {
        api.dispatch(loginSuccess({ access: refreshResult.data.access, refresh }));
        // Also refresh user data when token is refreshed
        try {
          const userResult = await baseQuery(
            { url: '/api/users-admin/me/' },
            api,
            extraOptions
          );
          if (userResult.data) {
            api.dispatch(setUser(userResult.data));
          }
        } catch (userError) {
          console.warn('Failed to refresh user data after token refresh:', userError);
        }
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }
  return result;
}; 