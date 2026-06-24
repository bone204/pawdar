"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "@/infrastructure/rtk/auth.slice";
import { userApi } from "@/infrastructure/rtk/api/user.api";
import { notificationApi } from "@/infrastructure/rtk/api/notification.api";
import { store, RootState } from "@/infrastructure/rtk/store";
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
  const dispatch = useDispatch();
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
