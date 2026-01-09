"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin?tab=logs');
  }, [router]);
  return null;
}
