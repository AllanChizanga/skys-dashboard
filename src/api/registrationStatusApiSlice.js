import { apiSlice } from './apiSlice';

export const registrationStatusApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRegistrationStatuses: builder.query({
      query: ({ page = 1, page_size = 20, search = '' } = {}) => {
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('page_size', page_size);
        if (search) params.append('search', search);
        return `/api/registration-status/?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        'RegistrationStatus',
        ...(result?.results ? result.results.map(({ id }) => ({ type: 'RegistrationStatus', id })) : []),
      ],
    }),
    getRegistrationStatus: builder.query({
      query: (id) => `/api/registration-status/${id}/`,
      providesTags: (result, error, arg) => [{ type: 'RegistrationStatus', id: arg }],
    }),
    addRegistrationStatus: builder.mutation({
      query: (status) => ({
        url: '/api/registration-status/',
        method: 'POST',
        body: status,
      }),
      invalidatesTags: (result, error, arg) => [
        'RegistrationStatus',
        'RegisteredUser',
        'PendingUser',
        'RejectedUser',
        arg?.user ? { type: 'User', id: arg.user } : null,
        // Invalidate registration status for this user as well
        arg?.user ? { type: 'RegistrationStatus', id: arg.user } : null
      ].filter(Boolean),
    }),
    editRegistrationStatus: builder.mutation({
      query: (status) => ({
        url: `/api/registration-status/${status.id}/`,
        method: 'PUT',
        body: status,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'RegistrationStatus', id: arg.id },
        'RegisteredUser',
        'PendingUser',
        'RejectedUser',
        arg?.user ? { type: 'User', id: arg.user } : null,
        arg?.user ? { type: 'RegistrationStatus', id: arg.user } : null
      ].filter(Boolean),
    }),
    deleteRegistrationStatus: builder.mutation({
      query: (id) => ({
        url: `/api/registration-status/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'RegistrationStatus', id: arg },
        'RegisteredUser',
        // If you have the user id available, add it here as well
        arg?.user ? { type: 'User', id: arg.user } : null,
        arg?.user ? { type: 'RegistrationStatus', id: arg.user } : null
      ].filter(Boolean),
    }),
  }),
});

export const {
  useGetRegistrationStatusesQuery,
  useGetRegistrationStatusQuery,
  useAddRegistrationStatusMutation,
  useEditRegistrationStatusMutation,
  useDeleteRegistrationStatusMutation,
} = registrationStatusApiSlice; 