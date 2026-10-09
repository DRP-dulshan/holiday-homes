"use client";

import { useActionState, useRef } from "react";
import { addPromo, type FormState } from "../../actions";
import { adminInput } from "../../AdminForms";

export function PromoForm({ homes }: { homes: { slug: string; title: string }[] }) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await addPromo(prev, fd);
    if (result.ok) ref.current?.reset();
    return result;
  }, {});
  const label = "mb-1 block text-xs font-semibold text-ink-60";
  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block">
        <span className={label}>Code</span>
        <input name="code" placeholder="SUMMER10" required className={`${adminInput} uppercase`} />
      </label>
      <label className="block">
        <span className={label}>Type</span>
        <select name="type" className={adminInput}>
          <option value="percent">Percent off</option>
          <option value="fixed">AED off</option>
        </select>
      </label>
      <label className="block">
        <span className={label}>Amount</span>
        <input name="value" type="number" min={1} required placeholder="10" className={adminInput} />
      </label>
      <label className="block">
        <span className={label}>Min. nights (optional)</span>
        <input name="minNights" type="number" min={1} className={adminInput} />
      </label>
      <label className="block">
        <span className={label}>Usable until (optional)</span>
        <input name="validUntil" type="date" className={adminInput} />
      </label>
      <label className="block">
        <span className={label}>Stays from (optional)</span>
        <input name="stayFrom" type="date" className={adminInput} />
      </label>
      <label className="block">
        <span className={label}>Stays up to (optional)</span>
        <input name="stayTo" type="date" className={adminInput} />
      </label>
      <label className="block">
        <span className={label}>Max. redemptions (optional)</span>
        <input name="maxUses" type="number" min={1} className={adminInput} />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Only for these homes (optional — hold Ctrl/Cmd to pick several)</span>
        <select name="propertySlugs" multiple size={4} className={adminInput}>
          {homes.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>Note for the team (optional)</span>
        <input name="note" placeholder="e.g. Instagram giveaway" className={adminInput} />
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm mt-4">
          {pending ? "Saving…" : "Create code"}
        </button>
        {state.error ? <span className="ml-3 text-sm text-red-600">{state.error}</span> : null}
        {state.ok ? <span className="ml-3 text-sm text-emerald-700">{state.ok}</span> : null}
      </label>
    </form>
  );
}
