const styles = {
  awaiting_payment: "bg-sky-50 text-sky-800 ring-sky-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-ink-05 text-ink-60 ring-ink-20",
  new: "bg-brand-soft text-brand-600 ring-brand/30",
  handled: "bg-ink-05 text-ink-60 ring-ink-20",
} as const;

const labels: Record<keyof typeof styles, string> = {
  awaiting_payment: "Awaiting payment",
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  new: "New",
  handled: "Handled",
};

export function StatusBadge({
  status,
  short = false,
}: {
  status: keyof typeof styles;
  short?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {short && status === "pending" ? "Pending" : labels[status]}
    </span>
  );
}
