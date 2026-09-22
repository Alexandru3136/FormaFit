"use client";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({ className, label = "Iesi din cont" }: LogoutButtonProps) {
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  return (
    <button
      className={
        className ??
        "rounded-lg border border-[#ded9c8] px-3 py-3 text-left text-sm font-black text-[#4d554b] transition hover:bg-[#f4f2e9] hover:text-[#101211]"
      }
      onClick={handleLogout}
      type="button"
    >
      {label}
    </button>
  );
}
