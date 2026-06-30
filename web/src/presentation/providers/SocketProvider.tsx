"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "@/infrastructure/rtk/auth.slice";
import { userApi } from "@/infrastructure/rtk/api/user.api";
import { notificationApi } from "@/infrastructure/rtk/api/notification.api";
import { chatApi } from "@/infrastructure/rtk/api/chat.api";
import { openChat } from "@/infrastructure/rtk/slices/chat.slice";
import { store, RootState, AppDispatch } from "@/infrastructure/rtk/store";
import { env } from "@/shared/config/env";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector(selectCurrentUser);
  const authState = useSelector((state: RootState) => state.auth);
  const token = authState?.accessToken;
  const dispatch = useDispatch<AppDispatch>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const rawBackendUrl = env.apiBaseUrl;
    // Remove '/api' or suffix if API url has it, socket needs root backend url
    const backendUrl = rawBackendUrl.endsWith('/api') 
      ? rawBackendUrl.slice(0, -4) 
      : rawBackendUrl;

    const socketInstance = io(backendUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setConnected(true);
      console.log("🔌 Connected to Pawdar Socket Server");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔌 Socket Connection Error:", error);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
      console.log("🔌 Disconnected from Pawdar Socket Server");
    });

    socketInstance.on("notification", (data) => {
      console.log("🔔 New Realtime Notification received:", data);
      
      // Invalidate RTK cache for notifications so header updates instantly
      dispatch(notificationApi.util.invalidateTags(["Notification"]));
      
      // Invalidate received requests list if it's a friend request
      if (data.type === "FRIEND_REQUEST") {
        dispatch(userApi.util.invalidateTags(["ReceivedFriendRequests", "UserProfile"]));
      }
      
      // Invalidate friends and profiles if friend request is accepted
      if (data.type === "FRIEND_ACCEPT") {
        dispatch(userApi.util.invalidateTags(["Friends", "UserProfile"]));
      }

      // Invalidate request states if declined or cancelled
      if (data.type === "FRIEND_DECLINE") {
        dispatch(userApi.util.invalidateTags(["SentFriendRequests", "ReceivedFriendRequests", "UserProfile"]));
      }
    });

    socketInstance.on("user_status_changed", (data: { userId: string; isOnline: boolean; lastActiveAt: string }) => {
      // Optimistically update the getFriends cache for the specific user
      dispatch(
        userApi.util.updateQueryData("getFriends", { limit: 100 }, (draft) => {
          const friend = draft.items.find((f) => f.id === data.userId);
          if (friend) {
            friend.isOnline = data.isOnline;
            friend.lastActiveAt = data.lastActiveAt;
          }
        })
      );
      
      // Also update the getUserProfile cache if we are viewing their profile
      dispatch(
        userApi.util.updateQueryData("getUserProfile", data.userId, (draft) => {
          draft.isOnline = data.isOnline;
          draft.lastActiveAt = data.lastActiveAt;
        })
      );
    });

    socketInstance.on("receive_message", (message) => {
      console.log("💬 New Chat Message received:", message);
      
      // Update the messages cache
      dispatch(
        chatApi.util.updateQueryData(
          "getMessages",
          { conversationId: message.conversationId, params: { limit: 50 } },
          (draft) => {
            // Append message if not exists
            if (!draft.data.find(m => m.id === message.id)) {
              // Note: the backend returns oldest to newest or newest to oldest?
              // The API reversed it so index 0 is oldest. Wait, if we used `unshift` or `push` depends on the array.
              // We just push to the end if it's oldest first.
              draft.data.push(message);
            }
          }
        )
      );

      // Invalidate conversation list so preview updates
      dispatch(chatApi.util.invalidateTags(["Conversation"]));

      // Check if we are currently focused on this chat to mark it as read immediately
      if (typeof window !== "undefined") {
        const isChatPage = window.location.pathname === `/dashboard/chat/${message.conversationId}`;
        const isFocused = document.hasFocus() && document.visibilityState === "visible";
        
        // Auto open the chat widget if it's not from us
        if (message.senderId !== user?.id) {
          dispatch(openChat(message.conversationId));
        }

        if (isChatPage && isFocused) {
          dispatch(chatApi.endpoints.markAsRead.initiate(message.conversationId));
        }
      }
    });

    socketInstance.on("messages_read", (data: { conversationId: string; readByUserId: string }) => {
      console.log("✅ Messages read by:", data.readByUserId, "in conversation:", data.conversationId);

      // Update isRead to true for all my messages in this conversation in cache
      dispatch(
        chatApi.util.updateQueryData(
          "getMessages",
          { conversationId: data.conversationId, params: { limit: 50 } },
          (draft) => {
            draft.data.forEach((msg) => {
              if (msg.senderId !== data.readByUserId) {
                msg.isRead = true;
              }
            });
          }
        )
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, token, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
