import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col justify-between transition-colors duration-300">
      {children}
    </div>
  );
}
