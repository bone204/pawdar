import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface ChatState {
  activeChats: string[]; // Array of conversationIds
}

const initialState: ChatState = {
  activeChats: [],
};

const chatSlice = createSlice({
  name: "chatUI",
  initialState,
  reducers: {
    openChat: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      // If already open, move to front (end of array)
      if (state.activeChats.includes(conversationId)) {
        state.activeChats = state.activeChats.filter(id => id !== conversationId);
      }
      
      state.activeChats.push(conversationId);
      
      // Keep only up to 3 chats
      if (state.activeChats.length > 3) {
        state.activeChats.shift(); // Remove the oldest one (first in array)
      }
    },
    closeChat: (state, action: PayloadAction<string>) => {
      state.activeChats = state.activeChats.filter(id => id !== action.payload);
    },
    closeAllChats: (state) => {
      state.activeChats = [];
    }
  },
});

export const { openChat, closeChat, closeAllChats } = chatSlice.actions;

export const selectActiveChats = (state: RootState) => state.chatUI.activeChats;

export default chatSlice.reducer;
