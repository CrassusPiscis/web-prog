"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeToStudentChanges } from "../api/studentEvents";
export default function StudentSync() {
  const router = useRouter();
  useEffect(() => subscribeToStudentChanges(() => router.refresh()), [router]);
  return null;
}
