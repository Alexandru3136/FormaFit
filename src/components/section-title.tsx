type SectionTitleProps = {
  eyebrow: string;
  title: string;
  body: string;
};

export function SectionTitle({ eyebrow, title, body }: SectionTitleProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black leading-tight text-[#101211] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#5f665c]">{body}</p>
    </div>
  );
}
