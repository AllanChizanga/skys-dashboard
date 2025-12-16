import { apiSlice } from './apiSlice';

export const rejectedUsersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRejectedUsers: builder.query({
      query: ({ page = 1, page_size = 9, search = '' } = {}) => {
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('page_size', page_size);
        if (search) params.append('search', search);
        return `/chatbot/rejected-users/?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        'RejectedUser',
        ...(result?.results ? result.results.map(({ id }) => ({ type: 'RejectedUser', id })) : []),
      ],
    }),
  }),
});

export const { useGetRejectedUsersQuery } = rejectedUsersApiSlice; 