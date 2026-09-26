import Link from "next/link";

type ActionButtonProps = {
  href?: string;
  label: string;
  tone?: "dark" | "lime" | "light";
};

export function ActionButton({ href, label, tone = "dark" }: ActionButtonProps) {
  const classes = {
    dark: "bg-[#15171d] text-white hover:bg-[#252832]",
    lime: "bg-[#c8ff55] text-[#101211] hover:bg-[#b9f242]",
    light: "border border-[#d8d2bf] bg-[#fbfaf4] text-[#15171d] hover:bg-white",
  }[tone];

  if (href) {
    return (
      <Link
        className={`flex min-h-12 items-center rounded-lg px-4 py-3 text-left text-sm font-black shadow-sm transition ${classes}`}
        href={href}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      className={`min-h-12 rounded-lg px-4 py-3 text-left text-sm font-black shadow-sm transition ${classes}`}
      type="button"
    >
      {label}
    </button>
  );
}
