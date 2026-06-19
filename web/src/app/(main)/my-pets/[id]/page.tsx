"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PetDetailPage } from "@/presentation/pages/main/pets/detail/PetDetailPage";

export default function MyPetDetailsEntryPage() {
  const params = useParams();
  const id = params?.id as string;

  return <PetDetailPage id={id} />;
}
