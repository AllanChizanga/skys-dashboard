import { apiSlice } from './apiSlice';

export const usersAdminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersAdmin: builder.query({
      query: () => '/api/users-admin/',
      providesTags: (result, error, arg) => {
        let users = [];
        if (Array.isArray(result)) {
          users = result;
        } else if (result && Array.isArray(result.results)) {
          users = result.results;
        }
        return [
          'UserAdmin',
          ...users.map(({ id }) => ({ type: 'UserAdmin', id })),
        ];
      },
    }),
    getUserAdmin: builder.query({
      query: (id) => `/api/users-admin/${id}/`,
      providesTags: (result, error, arg) => [{ type: 'UserAdmin', id: arg }],
    }),
    addUserAdmin: builder.mutation({
      query: (user) => ({
        url: '/api/users-admin/',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['UserAdmin'],
    }),
    editUserAdmin: builder.mutation({
      query: (user) => ({
        url: `/api/users-admin/${user.id}/`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'UserAdmin', id: arg.id }],
    }),
    deleteUserAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/users-admin/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'UserAdmin', id: arg }],
    }),
  }),
});

export const {
  useGetUsersAdminQuery,
  useGetUserAdminQuery,
  useAddUserAdminMutation,
  useEditUserAdminMutation,
  useDeleteUserAdminMutation,
} = usersAdminApiSlice; 