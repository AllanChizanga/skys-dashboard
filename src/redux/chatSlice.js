import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

const initialState = {
  messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: () => '/chat/messages/',
      providesTags: ['ChatMessage'],
    }),
    addMessage: builder.mutation({
      query: (message) => ({
        url: '/chat/messages/',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['ChatMessage'],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useAddMessageMutation,
} = chatApiSlice; 