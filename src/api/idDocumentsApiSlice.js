import { apiSlice } from './apiSlice';

export const idDocumentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIdDocuments: builder.query({
      query: (userId) => {
        let url = '/api/id-documents/';
        if (userId) {
          url += `?user=${userId}`;
        }
        return url;
      },
      providesTags: (result = [], error, arg) => [
        'IdDocument',
        ...result.map(({ id }) => ({ type: 'IdDocument', id })),
      ],
    }),
    getIdDocument: builder.query({
      query: (id) => `/api/id-documents/${id}/`,
      providesTags: (result, error, arg) => [{ type: 'IdDocument', id: arg }],
    }),
    addIdDocument: builder.mutation({
      query: (doc) => ({
        url: '/api/id-documents/',
        method: 'POST',
        body: doc,
      }),
      invalidatesTags: (result, error, arg) => [
        'IdDocument',
        { type: 'IdDocument', id: 'LIST', user: arg.user }
      ],
    }),
    editIdDocument: builder.mutation({
      query: (doc) => ({
        url: `/api/id-documents/${doc.id}/`,
        method: 'PUT',
        body: doc,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'IdDocument', id: arg.id },
        { type: 'IdDocument', id: 'LIST', user: arg.user }
      ],
    }),
    deleteIdDocument: builder.mutation({
      query: (id) => ({
        url: `/api/id-documents/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'IdDocument', id: arg },
        { type: 'IdDocument', id: 'LIST' }
      ],
    }),
  }),
});

export const {
  useGetIdDocumentsQuery,
  useGetIdDocumentQuery,
  useAddIdDocumentMutation,
  useEditIdDocumentMutation,
  useDeleteIdDocumentMutation,
} = idDocumentsApiSlice; 