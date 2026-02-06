import React from "react";
import { History, Search, Trash2, RefreshCcw } from "lucide-react";

const QuoteHistory = ({
  quoteHistory,
  filteredHistory,
  historySearch,
  onHistorySearchChange,
  onClearHistory,
  onLoadQuote,
  onDeleteQuote,
  formatDateDDMMYYYY,
  formatDateTimeReadable,
}) => {
  const hasHistory = quoteHistory.length > 0;

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xl">
            <History size={20} className="text-indigo-600" />
            <span>Saved Quotations</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={historySearch}
                onChange={(event) => onHistorySearchChange(event.target.value)}
                placeholder="Search by name, client or item"
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            {hasHistory && (
              <button
                onClick={onClearHistory}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} className="text-red-500" />
                Clear history
              </button>
            )}
          </div>
        </div>

        {!hasHistory ? (
          <p className="text-gray-500 text-sm">
            Generate a quotation to see it appear in your history list.
          </p>
        ) : filteredHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No quotations matched "{historySearch}". Try another term.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHistory.map((quote) => (
              <div
                key={quote.id}
                className="rounded-lg border border-gray-200 p-3 text-xs transition hover:border-indigo-300 hover:bg-indigo-50/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-sm" title={`${quote.pdfName}.pdf`}>
                      {quote.pdfName}.pdf
                    </p>
                    <p
                      className="text-[11px] text-gray-500 truncate"
                      title={quote.invoiceTo || "Unnamed client"}
                    >
                      {quote.invoiceTo || "Unnamed client"}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onLoadQuote(quote)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      aria-label="Load quotation"
                    >
                      <RefreshCcw size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteQuote(quote.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 text-red-500 hover:bg-red-50"
                      aria-label="Delete quotation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-medium text-gray-600">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    {quote.lineItems?.length || 0} types • {quote.itemsCount || 0} pcs
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    Total Rs.{(quote.totals?.totalAfterDiscount || 0).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    Balance Rs.{(quote.totals?.balanceDue || 0).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    {quote.eventDate
                      ? formatDateDDMMYYYY(quote.eventDate)
                      : "No event date"}
                  </span>
                </div>

                <p className="mt-2 text-[10px] uppercase tracking-wide text-gray-400">
                  Saved {formatDateTimeReadable(quote.savedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteHistory;