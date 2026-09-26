import Link from "next/link";
import { useTranslations } from "next-intl";

type BrandMarkProps = {
  href?: string;
};

export function BrandMark({ href = "/" }: BrandMarkProps) {
  const t = useTranslations("brand");
  const tc = useTranslations("common");

  return (
    <Link className="flex min-w-0 items-center gap-3" href={href}>
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#123f31] text-xl font-black text-[#c8ff55] shadow-sm">
        F
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-black leading-6 text-[#101211]">{tc("appName")}</p>
        <p className="truncate text-sm text-[#636a61]">{t("tagline")}</p>
      </div>
    </Link>
  );
}
