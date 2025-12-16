import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './customBaseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: [
    'User',
    'RegistrationStatus',
    'Program',
    'Scholarship',
    // add more as needed
  ],
  endpoints: () => ({}), // Endpoints will be injected
});

export const programsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query({
      query: ({ page = 1, page_size = 20, search = '' } = {}) => {
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('page_size', page_size);
        if (search) params.append('search', search);
        return `/chatbot/programs/?${params.toString()}`;
      },
      providesTags: (result = [], error, arg) => [
        'Program',
        ...(result?.results ? result.results.map(({ id }) => ({ type: 'Program', id })) : []),
      ],
    }),
    getProgram: builder.query({
      query: (id) => `/chatbot/programs/${id}/`,
      providesTags: (result, error, arg) => [{ type: 'Program', id: arg }],
    }),
    addProgram: builder.mutation({
      query: (program) => ({
        url: '/chatbot/programs/',
        method: 'POST',
        body: program,
      }),
      invalidatesTags: ['Program', 'User'], // Invalidate users/students if needed
    }),
    editProgram: builder.mutation({
      query: (program) => ({
        url: `/chatbot/programs/${program.id}/`,
        method: 'PUT',
        body: program,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Program', id: arg.id },
        'User',
      ],
    }),
    deleteProgram: builder.mutation({
      query: (id) => ({
        url: `/chatbot/programs/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Program', id: arg },
        'User',
      ],
    }),
  }),
});

export const scholarshipsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScholarships: builder.query({
      query: ({ page = 1, page_size = 20, search = '' } = {}) => {
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('page_size', page_size);
        if (search) params.append('search', search);
        return `/chatbot/scholarships/?${params.toString()}`;
      },
      providesTags: (result = [], error, arg) => [
        'Scholarship',
        ...(result?.results ? result.results.map(({ id }) => ({ type: 'Scholarship', id })) : []),
      ],
    }),
    getScholarship: builder.query({
      query: (id) => `/chatbot/scholarships/${id}/`,
      providesTags: (result, error, arg) => [{ type: 'Scholarship', id: arg }],
    }),
    addScholarship: builder.mutation({
      query: (scholarship) => ({
        url: '/chatbot/scholarships/',
        method: 'POST',
        body: scholarship,
      }),
      invalidatesTags: ['Scholarship', 'User'],
    }),
    editScholarship: builder.mutation({
      query: (scholarship) => ({
        url: `/chatbot/scholarships/${scholarship.id}/`,
        method: 'PUT',
        body: scholarship,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Scholarship', id: arg.id },
        'User',
      ],
    }),
    deleteScholarship: builder.mutation({
      query: (id) => ({
        url: `/chatbot/scholarships/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Scholarship', id: arg },
        'User',
      ],
    }),
  }),
});

export const acceptanceLetterConfigApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAcceptanceLetterConfig: builder.query({
      query: () => '/chatbot/acceptanceletterconfig/',
      transformResponse: (response) => Array.isArray(response) ? response[0] : response,
      providesTags: ['AcceptanceLetterConfig'],
    }),
    updateAcceptanceLetterConfig: builder.mutation({
      query: (config) => ({
        url: `/chatbot/acceptanceletterconfig/${config.id}/`,
        method: 'PUT',
        body: config,
      }),
      invalidatesTags: ['AcceptanceLetterConfig'],
    }),
  }),
});

export const faqsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query({
      query: () => '/chatbot/faqs/',
      transformResponse: (response) => response.results || response,
      providesTags: ['FAQ'],
    }),
    addFaq: builder.mutation({
      query: (faq) => ({
        url: '/chatbot/faqs/',
        method: 'POST',
        body: faq,
      }),
      invalidatesTags: ['FAQ'],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/chatbot/faqs/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FAQ'],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetProgramQuery,
  useAddProgramMutation,
  useEditProgramMutation,
  useDeleteProgramMutation,
} = programsApiSlice;

export const {
  useGetScholarshipsQuery,
  useGetScholarshipQuery,
  useAddScholarshipMutation,
  useEditScholarshipMutation,
  useDeleteScholarshipMutation,
} = scholarshipsApiSlice;

export const {
  useGetAcceptanceLetterConfigQuery,
  useUpdateAcceptanceLetterConfigMutation,
} = acceptanceLetterConfigApiSlice;

export const { useGetFaqsQuery, useAddFaqMutation, useDeleteFaqMutation } = faqsApiSlice; 