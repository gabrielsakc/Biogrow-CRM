"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { formatCurrency } from "@biogrow/ui/lib/utils";

const lineItemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.number({ invalid_type_error: "Number required" }).positive("Must be > 0"),
  unitPrice: z.number({ invalid_type_error: "Number required" }).nonnegative("Must be ≥ 0"),
  discountPct: z.number().min(0).max(100).default(0),
});

const formSchema = z.object({
  currency: z.string().length(3).default("USD"),
  discountPct: z.number().min(0).max(100).default(0),
  taxPct: z.number().min(0).max(100).default(0),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

type FormValues = z.infer<typeof formSchema>;

interface QuoteBuilderProps {
  companyId: string;
  companySlug: string;
  accountId?: string;
  opportunityId?: string;
}

function computeLineTotal(qty: number, price: number, discPct: number) {
  return qty * price * (1 - discPct / 100);
}

export function QuoteBuilder({ companyId, companySlug, accountId, opportunityId }: QuoteBuilderProps) {
  const router = useRouter();
  const createQuote = api.quotes.create.useMutation({
    onSuccess: (quote) => {
      router.push(`/${companySlug}/crm/quotes/${quote.id}`);
    },
  });

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "USD",
      discountPct: 0,
      taxPct: 0,
      lineItems: [{ description: "", quantity: 1, unitPrice: 0, discountPct: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });

  const watchedItems = watch("lineItems");
  const discountPct = watch("discountPct") ?? 0;
  const taxPct = watch("taxPct") ?? 0;
  const currency = watch("currency") ?? "USD";

  const subtotal = watchedItems?.reduce((sum, item) => {
    return sum + computeLineTotal(item.quantity || 0, item.unitPrice || 0, item.discountPct || 0);
  }, 0) ?? 0;
  const afterDiscount = subtotal * (1 - discountPct / 100);
  const total = afterDiscount * (1 + taxPct / 100);

  async function onSubmit(values: FormValues) {
    await createQuote.mutateAsync({
      companyId,
      currency: values.currency,
      discountPct: values.discountPct,
      taxPct: values.taxPct,
      validUntil: values.validUntil ? new Date(values.validUntil) : undefined,
      notes: values.notes,
      terms: values.terms,
      accountId,
      opportunityId,
      lineItems: values.lineItems,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header config */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Settings</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Currency</label>
            <input
              {...register("currency")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              maxLength={3}
              placeholder="USD"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Global Discount (%)</label>
            <input
              {...register("discountPct", { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              step={0.01}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Tax (%)</label>
            <input
              {...register("taxPct", { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              step={0.01}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Valid Until</label>
            <input
              {...register("validUntil")}
              type="date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Quote Line Items</h2>
          <button
            type="button"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0, discountPct: 0 })}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add line
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Description</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 w-24">Qty.</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 w-32">Unit Price</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 w-24">Disc. %</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 w-32">Total</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fields.map((field, idx) => {
              const item = watchedItems?.[idx];
              const lineTotal = item
                ? computeLineTotal(item.quantity || 0, item.unitPrice || 0, item.discountPct || 0)
                : 0;
              return (
                <tr key={field.id}>
                  <td className="px-4 py-2">
                    <input
                      {...register(`lineItems.${idx}.description`)}
                      placeholder="Product or service description"
                      className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {errors.lineItems?.[idx]?.description && (
                      <p className="text-xs text-red-500 mt-0.5">{errors.lineItems[idx]?.description?.message}</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`lineItems.${idx}.quantity`, { valueAsNumber: true })}
                      type="number"
                      min={0.001}
                      step={0.001}
                      className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`lineItems.${idx}.unitPrice`, { valueAsNumber: true })}
                      type="number"
                      min={0}
                      step={0.01}
                      className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`lineItems.${idx}.discountPct`, { valueAsNumber: true })}
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-gray-700 text-xs">
                    {formatCurrency(lineTotal, currency)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-gray-100 px-5 py-4 flex justify-end">
          <div className="space-y-1.5 text-sm min-w-52">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            {discountPct > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Discount ({discountPct}%)</span>
                <span className="text-red-500">−{formatCurrency(subtotal * discountPct / 100, currency)}</span>
              </div>
            )}
            {taxPct > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Tax ({taxPct}%)</span>
                <span>{formatCurrency(afterDiscount * taxPct / 100, currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-1.5">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes / Terms */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
          <label className="text-xs font-medium text-gray-500">Internal notes</label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Notes visible only to your team..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
          <label className="text-xs font-medium text-gray-500">Terms & conditions</label>
          <textarea
            {...register("terms")}
            rows={3}
            placeholder="Terms that will appear on the document..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <Button type="submit" disabled={createQuote.isPending}>
          {createQuote.isPending ? "Saving..." : "Save quote"}
        </Button>
      </div>

      {createQuote.error && (
        <p className="text-sm text-red-500 text-right">{createQuote.error.message}</p>
      )}
    </form>
  );
}
