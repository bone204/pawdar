"use client";

import React from "react";
import { useSelector } from "react-redux";
import { selectActiveChats } from "@/infrastructure/rtk/slices/chat.slice";
import { ChatWidget } from "./ChatWidget";

export function ChatWidgetContainer() {
  const activeChats = useSelector(selectActiveChats);

  if (activeChats.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 md:right-24 z-[100] flex items-end gap-3 pointer-events-none">
      {activeChats.map((conversationId) => (
        <ChatWidget key={conversationId} conversationId={conversationId} />
      ))}
    </div>
  );
}
