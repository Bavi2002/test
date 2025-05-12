"use client"

import BotForm from "@/components/BotForm"
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SubmitBotPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
      if (status === "unauthenticated") {
          router.push("/login");
      }
  }, [status, router]);

  return (
    <main className="min-h-screen p-10">
      <BotForm />
    </main>
  )
}
