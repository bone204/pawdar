"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProfilePage } from "@/presentation/pages/main/profile/ProfilePage";

export default function UserProfileEntryPage() {
  const params = useParams();
  const id = params?.id as string;

  return <ProfilePage userId={id} />;
}
