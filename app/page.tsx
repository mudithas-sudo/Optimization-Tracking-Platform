import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentDbUser();
  if (!user || !user.active) redirect("/no-access");

  redirect("/dashboard");
}
