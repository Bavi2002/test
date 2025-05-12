import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function getUserSession() {
  return await getServerSession(authOptions);
}