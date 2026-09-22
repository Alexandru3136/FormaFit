import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { PreferencesControls } from "@/features/preferences/app-preferences";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-10 text-[#181a1f]">
      <div className="mx-auto mb-6 flex w-full max-w-md items-center justify-between gap-3">
        <Link
          className="rounded-lg border border-[#ded9c8] bg-white px-4 py-3 text-sm font-black text-[#123f31] shadow-sm transition hover:bg-[#fbfaf4]"
          href="/"
        >
          Inapoi la principala
        </Link>
        <PreferencesControls />
      </div>
      <AuthForm mode="login" />
      <p className="mx-auto mt-4 max-w-md text-sm font-semibold text-[#62695f]">
        Nu ai cont?{" "}
        <Link className="font-black text-[#123f31]" href="/register">
          Creeaza unul
        </Link>
      </p>
    </main>
  );
}
