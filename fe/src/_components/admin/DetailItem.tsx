export function DetailItem({ label, value, highlight, icon }: {
  label: string
  value?: string
  highlight?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={`text-xs font-bold ${highlight ? "text-purple-400" : "text-white/80"}`}>
        {value ?? "—"}
      </p>
    </div>
  )
}