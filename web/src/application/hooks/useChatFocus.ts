import { useEffect, useState } from "react";
import { useMarkAsReadMutation } from "@/infrastructure/rtk/api/chat.api";
import { usePathname } from "next/navigation";

export function useChatFocus(conversationId: string | null) {
  const [isFocused, setIsFocused] = useState(true);
  const pathname = usePathname();
  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleVisibilityChange = () => {
      setIsFocused(document.visibilityState === "visible");
    };

    // Initial check
    setIsFocused(document.hasFocus() && document.visibilityState === "visible");

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // When focus changes OR conversationId changes, if we are focused on the chat page, mark as read
  useEffect(() => {
    const isChatPage = pathname === `/dashboard/chat/${conversationId}`;
    if (isFocused && isChatPage && conversationId) {
      markAsRead(conversationId).catch(console.error);
    }
  }, [isFocused, pathname, conversationId, markAsRead]);

  return isFocused;
}
