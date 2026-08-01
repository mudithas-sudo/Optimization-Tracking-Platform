import { UserButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";

export default function NoAccessPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
      <ShieldAlert size={40} className="text-warning-600" />
      <h1 className="text-2xl font-bold text-slate-900">Your account isn&apos;t linked yet</h1>
      <p className="max-w-md text-sm text-slate-500">
        You&apos;re signed in, but no active employee record in the platform is linked to this account yet.
        Ask your platform administrator to link your account to your employee profile.
      </p>
      <UserButton />
    </main>
  );
}
