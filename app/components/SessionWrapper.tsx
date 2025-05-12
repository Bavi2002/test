
"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
 

// handle redirect to login in the submit-bot page
// get the value while submitting the bot form
// 2.1- store the imge and get the link
// 2.2- insert the value using prisma client