import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-slate-50 p-6">
      <SignUp />
    </main>
  );
}
