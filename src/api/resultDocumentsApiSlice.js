import { apiSlice } from './apiSlice';

export const resultDocumentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getResultDocuments: builder.query({
      query: (userId) => {
        let url = '/api/result-documents/';
        if (userId) {
          url += `?user=${userId}`;
        }
        return url;
      },
      providesTags: (result = [], error, arg) => [
        'ResultDocument',
        ...result.map(({ id }) => ({ type: 'ResultDocument', id })),
      ],
    }),
    getResultDocument: builder.query({
      query: (id) => `/api/result-documents/${id}/`,
      providesTags: (result, error, arg) => [{ type: 'ResultDocument', id: arg }],
    }),
    addResultDocument: builder.mutation({
      query: (doc) => ({
        url: '/api/result-documents/',
        method: 'POST',
        body: doc,
      }),
      invalidatesTags: (result, error, arg) => [
        'ResultDocument',
        { type: 'ResultDocument', id: 'LIST', user: arg.user }
      ],
    }),
    editResultDocument: builder.mutation({
      query: (doc) => ({
        url: `/api/result-documents/${doc.id}/`,
        method: 'PUT',
        body: doc,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ResultDocument', id: arg.id },
        { type: 'ResultDocument', id: 'LIST', user: arg.user }
      ],
    }),
    deleteResultDocument: builder.mutation({
      query: (id) => ({
        url: `/api/result-documents/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ResultDocument', id: arg },
        { type: 'ResultDocument', id: 'LIST' }
      ],
    }),
  }),
});

export const {
  useGetResultDocumentsQuery,
  useGetResultDocumentQuery,
  useAddResultDocumentMutation,
  useEditResultDocumentMutation,
  useDeleteResultDocumentMutation,
} = resultDocumentsApiSlice; 