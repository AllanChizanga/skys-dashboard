import { apiSlice } from './apiSlice';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, page_size = 9, search = '' } = {}) => {
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('page_size', page_size);
        if (search) params.append('search', search);
        return `/api/users/?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        'User',
        ...(result?.results ? result.results.map(({ id }) => ({ type: 'User', id })) : []),
      ],
    }),
    getUser: builder.query({
      query: (userId) => `/api/users/${userId}/`,
      providesTags: (result, error, arg) => [{ type: 'User', id: arg }],
    }),
    addUser: builder.mutation({
      query: (user) => ({
        url: '/api/users/',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    editUser: builder.mutation({
      query: (user) => ({
        url: `/api/users/${user.id}/`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: arg.id },
        { type: 'RegistrationStatus', id: arg.id }
      ],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/${userId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: arg },
        { type: 'RegistrationStatus', id: arg }
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useAddUserMutation,
  useEditUserMutation,
  useDeleteUserMutation,
} = usersApiSlice; 