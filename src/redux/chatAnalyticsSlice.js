import { apiSlice } from '../api/apiSlice';

export const chatAnalyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessagesPerDay: builder.query({
      query: () => '/chatbot/analytics/messages-per-day/',
      providesTags: ['MessagesPerDay'],
    }),
    getPeakChatHours: builder.query({
      query: () => '/chatbot/analytics/peak-chat-hours/',
      providesTags: ['PeakChatHours'],
    }),
    getActiveUsersLast7Days: builder.query({
      query: () => '/chatbot/analytics/active-users-last-7-days/',
      providesTags: ['ActiveUsersLast7Days'],
    }),
  }),
});

export const {
  useGetMessagesPerDayQuery,
  useGetPeakChatHoursQuery,
  useGetActiveUsersLast7DaysQuery,
} = chatAnalyticsApiSlice; 