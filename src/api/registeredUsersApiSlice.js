import { apiSlice } from './apiSlice';

export const registeredUsersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRegisteredUsers: builder.query({
      query: ({ page = 1, page_size = 9, search = '' } = {}) => {
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('page_size', page_size);
        if (search) params.append('search', search);
        return `/api/registered-users/?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        'RegisteredUser',
        ...(result?.results ? result.results.map(({ id }) => ({ type: 'RegisteredUser', id })) : []),
      ],
    }),
  }),
});

export const { useGetRegisteredUsersQuery } = registeredUsersApiSlice; 