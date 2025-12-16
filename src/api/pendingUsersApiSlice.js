import { apiSlice } from './apiSlice';

export const pendingUsersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPendingUsers: builder.query({
      query: ({ page = 1, page_size = 9, search = '' } = {}) => {
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('page_size', page_size);
        if (search) params.append('search', search);
        return `/chatbot/pending-users/?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        'PendingUser',
        ...(result?.results ? result.results.map(({ id }) => ({ type: 'PendingUser', id })) : []),
      ],
    }),
  }),
});

export const { useGetPendingUsersQuery } = pendingUsersApiSlice; 