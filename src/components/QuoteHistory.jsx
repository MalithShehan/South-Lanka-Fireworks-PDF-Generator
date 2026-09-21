import React from "react";
import { History, Search, Trash2, RefreshCcw, FileText, Calendar, Sparkles, User, Package } from "lucide-react";

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
    <div className="w-full max-w-7xl mx-auto mt-0 px-3 sm:px-6 pb-12">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-4 sm:p-6 md:p-8 relative overflow-hidden text-white border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg font-bold">
                <History size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white">
                    Saved Quotations
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {quoteHistory.length}
                  </span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                  {hasHistory ? "Instant recall, edit, or re-download any quotation" : "Your generated proposals will appear here"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative w-full sm:w-64 md:w-72">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(event) => onHistorySearchChange(event.target.value)}
                  placeholder="Search client, PDF name..."
                  className="w-full rounded-xl border border-white/15 bg-white/10 backdrop-blur-md pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
                />
              </div>

              {hasHistory && (
                <button
                  onClick={onClearHistory}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 px-4 py-2.5 text-xs sm:text-sm text-red-200 font-semibold transition active:scale-95"
                >
                  <Trash2 size={15} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50/50">
          {!hasHistory ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 shadow-inner">
                <FileText size={32} />
              </div>
              <h4 className="text-slate-800 font-bold text-base sm:text-lg mb-1">
                No Quotations Saved Yet
              </h4>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                Generate and download your first PDF quotation. It will be securely stored here for future re-edits or reference.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10 sm:py-14 bg-white rounded-2xl border border-slate-200/80 p-6">
              <p className="text-slate-600 font-medium text-sm">
                No quotations found matching &ldquo;<span className="text-indigo-600 font-bold">{historySearch}</span>&rdquo;
              </p>
              <button
                onClick={() => onHistorySearchChange("")}
                className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-700 underline"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHistory.map((quote) => (
                <div
                  key={quote.id}
                  className="group relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:border-amber-400/60 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: PDF & Actions */}
                    <div className="flex items-start justify-between gap-2.5 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-0.5">
                          <FileText size={13} className="shrink-0" />
                          <span className="truncate">{quote.pdfName}.pdf</span>
                        </div>
                        <h5
                          className="font-extrabold text-slate-900 truncate text-sm sm:text-base flex items-center gap-1.5"
                          title={quote.invoiceTo || "Bespoke Quotation"}
                        >
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{quote.invoiceTo || "Bespoke Quotation"}</span>
                        </h5>
                      </div>

                      {/* Action buttons with generous touch targets */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onLoadQuote(quote)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 transition active:scale-95"
                          aria-label="Load quotation"
                          title="Load into Editor"
                        >
                          <RefreshCcw size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteQuote(quote.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 transition active:scale-95"
                          aria-label="Delete quotation"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Stats Pill Box */}
                    <div className="grid grid-cols-2 gap-2 mb-3.5">
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Package size={11} className="text-slate-400" />
                          <span>Items</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                          {quote.itemsCount || 0}
                        </p>
                      </div>
                      <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-100/80">
                        <span className="text-[11px] text-amber-700 font-semibold block">Total</span>
                        <p className="text-sm font-extrabold text-amber-900 mt-0.5 truncate tabular-nums">
                          Rs. {(quote.totals?.totalAfterDiscount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] pt-3 border-t border-slate-100">
                    {quote.eventDate ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold border border-indigo-100">
                        <Calendar size={10} />
                        <span>{formatDateDDMMYYYY(quote.eventDate)}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">No event date</span>
                    )}
                    <span className="text-slate-400 font-medium ml-auto">
                      {formatDateTimeReadable(quote.savedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteHistory;