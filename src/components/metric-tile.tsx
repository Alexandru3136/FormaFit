type MetricTileProps = {
  label: string;
  value: string;
  helper: string;
};

export function MetricTile({ label, value, helper }: MetricTileProps) {
  return (
    <div className="rounded-lg border border-[#e6e1d1] bg-[#fbfaf4] p-4">
      <p className="text-sm font-bold text-[#62695f]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <strong className="text-3xl font-black text-[#0f1117]">{value}</strong>
        <span className="pb-1 text-sm font-medium text-[#6f756c]">{helper}</span>
      </div>
    </div>
  );
}
