import React from "react";
import { History, Search, Trash2, RefreshCcw, FileText, Calendar } from "lucide-react";

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
    <div className="w-full max-w-6xl mx-auto mt-6 sm:mt-8 px-3 sm:px-4 overflow-hidden">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <History size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Saved Quotations</h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  {hasHistory ? `${quoteHistory.length} saved` : 'Your history will appear here'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(event) => onHistorySearchChange(event.target.value)}
                  placeholder="Search quotations..."
                  className="w-full sm:w-56 md:w-64 rounded-lg border-0 bg-white/10 backdrop-blur-sm pl-10 pr-3 py-2 sm:py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              {hasHistory && (
                <button
                  onClick={onClearHistory}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 px-3 py-2 sm:py-2.5 text-sm text-red-200 transition w-full sm:w-auto"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {!hasHistory ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText size={28} className="text-gray-400" />
              </div>
              <h4 className="text-gray-600 font-medium mb-1">No Saved Quotations</h4>
              <p className="text-gray-400 text-sm">
                Generate your first quotation to see it saved here.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No quotations matched "<span className="font-medium">{historySearch}</span>". Try another term.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHistory.map((quote) => (
                <div
                  key={quote.id}
                  className="group rounded-xl border border-gray-200 p-3 transition-all hover:border-indigo-300 hover:shadow-md hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-pink-50/50 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="font-semibold text-gray-800 truncate text-sm" title={`${quote.pdfName}.pdf`}>
                        {quote.pdfName}.pdf
                      </p>
                      <p
                        className="text-xs text-gray-500 truncate"
                        title={quote.invoiceTo || "Unnamed client"}
                      >
                        {quote.invoiceTo || "Unnamed client"}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onLoadQuote(quote)}
                        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition"
                        aria-label="Load quotation"
                        title="Load & Edit"
                      >
                        <RefreshCcw size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteQuote(quote.id)}
                        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition"
                        aria-label="Delete quotation"
                        title="Delete"
                      >
                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2 text-center">
                      <p className="text-[10px] sm:text-xs text-gray-500">Items</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">{quote.itemsCount || 0}</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-1.5 sm:p-2 text-center overflow-hidden">
                      <p className="text-[10px] sm:text-xs text-pink-600">Total</p>
                      <p className="text-xs sm:text-sm font-semibold text-pink-700 truncate">Rs.{(quote.totals?.totalAfterDiscount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px]">
                    {quote.eventDate && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-100 text-indigo-700 px-1.5 py-0.5">
                        <Calendar size={8} />
                        <span className="truncate max-w-[80px]">{formatDateDDMMYYYY(quote.eventDate)}</span>
                      </span>
                    )}
                    <span className="text-gray-400 truncate">
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