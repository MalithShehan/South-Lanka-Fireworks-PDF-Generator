import React from "react";
import { FileText, Trash2, Check, Plus, Minus, ShoppingCart, ArrowDown, Sparkles, Calendar, User, CreditCard, Building, ShieldCheck, Tag } from "lucide-react";

const CustomPackageEditor = ({
  items,
  onNameChange,
  onSizeChange,
  onPriceChange,
  onQtyChange,
  onRemoveItem,
  onClearCart,
  pdfName,
  onPdfNameChange,
  invoiceTo,
  onInvoiceToChange,
  invoiceDate,
  onInvoiceDateChange,
  eventDate,
  onEventDateChange,
  includeEventDate,
  onIncludeEventDateChange,
  includeBankDetails,
  onIncludeBankDetailsChange,
  bankDetails = [],
  includeGallery,
  onIncludeGalleryChange,
  discount,
  onDiscountChange,
  advance,
  onAdvanceChange,
  subTotal,
  totalAfterDiscount,
  balanceDue,
  onGenerateReport,
}) => {
  const hasItems = items.length > 0;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleIncrement = (item) => {
    onQtyChange(item, item.quantity + 1);
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      onQtyChange(item, item.quantity - 1);
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-12"
      id="custom-package"
    >
      {/* Luxury Gradient Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-7 relative overflow-hidden border-b border-indigo-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              <ShoppingCart size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Quotation Studio
                </h3>
                {hasItems && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-slate-300/80 text-xs sm:text-sm mt-0.5 font-medium">
                {hasItems ? "Configure client details & export official invoice" : "Add fireworks from catalog above to generate quote"}
              </p>
            </div>
          </div>

          {hasItems && onClearCart && (
            <button
              onClick={onClearCart}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/90 hover:text-red-300 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 border border-white/15 hover:border-red-400/40 active:scale-95"
            >
              <Trash2 size={14} />
              <span>Clear Quotation</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {!hasItems ? (
          /* Empty State with Luxury Guidance */
          <div className="text-center py-10 sm:py-14">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-50 to-amber-50 border border-indigo-100 flex items-center justify-center shadow-inner">
              <Sparkles size={32} className="text-indigo-600 animate-pulse" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
              Your Quotation is Currently Empty
            </h4>
            <p className="text-slate-500 text-xs sm:text-sm mb-8 max-w-md mx-auto">
              Select any item from our catalog or upload bespoke custom fireworks to begin generating your quotation.
            </p>
            
            {/* Quick Steps Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto text-left">
              <div className="bg-slate-50 hover:bg-indigo-50/40 transition-colors rounded-2xl p-4 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs mb-2.5 shadow-xs">
                  01
                </div>
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">Pick Fireworks</h5>
                <p className="text-[11px] text-slate-500 leading-normal">Choose aerial shells or custom items from catalog.</p>
              </div>

              <div className="bg-slate-50 hover:bg-purple-50/40 transition-colors rounded-2xl p-4 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs mb-2.5 shadow-xs">
                  02
                </div>
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">Adjust Quantities</h5>
                <p className="text-[11px] text-slate-500 leading-normal">Set sizes and quantities with live price calculation.</p>
              </div>

              <div className="bg-slate-50 hover:bg-emerald-50/40 transition-colors rounded-2xl p-4 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs mb-2.5 shadow-xs">
                  03
                </div>
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">Export PDF</h5>
                <p className="text-[11px] text-slate-500 leading-normal">Download branded invoice with optional photo gallery.</p>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-indigo-600 font-semibold text-xs sm:text-sm animate-bounce">
              <ArrowDown size={16} />
              <span>Scroll up to browse our fireworks collection</span>
              <ArrowDown size={16} className="rotate-180" />
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Items Table (>=640px) */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 mb-6 shadow-xs bg-white">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200">
                    <th className="p-3 text-left text-slate-700 font-bold min-w-[200px]">Item Description</th>
                    <th className="p-3 text-left text-slate-700 font-bold w-36">Size / Specs</th>
                    <th className="p-3 text-center text-slate-700 font-bold w-32">Unit Price</th>
                    <th className="p-3 text-center text-slate-700 font-bold w-32">Quantity</th>
                    <th className="p-3 text-right text-slate-700 font-bold w-32">Total (LKR)</th>
                    <th className="p-3 text-center text-slate-700 font-bold w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors group">
                      <td className="p-2.5 sm:p-3 align-middle">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name || "Item"}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs bg-slate-50"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(event) => onNameChange(item, event.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                              aria-label="Item name"
                              placeholder="Item name"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 sm:p-3 align-middle">
                        <input
                          type="text"
                          value={item.size || ""}
                          onChange={(event) => onSizeChange(item, event.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          aria-label="Item size"
                          placeholder="e.g. 4 inch"
                        />
                      </td>
                      <td className="p-2.5 sm:p-3 align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-slate-400 font-semibold">Rs.</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={item.price}
                            onChange={(event) => onPriceChange(item, event.target.value)}
                            className="w-20 border border-slate-200 rounded-xl px-2 py-1.5 text-right text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="0"
                          />
                        </div>
                      </td>
                      <td className="p-2.5 sm:p-3 align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDecrement(item)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} className="text-slate-600" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) => {
                              const parsed = parseInt(event.target.value, 10);
                              onQtyChange(item, Number.isNaN(parsed) || parsed < 1 ? 1 : parsed);
                            }}
                            className="w-10 border border-slate-200 rounded-lg py-1 text-center text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent tabular-nums"
                          />
                          <button
                            onClick={() => handleIncrement(item)}
                            className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition active:scale-95"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} className="text-indigo-700" />
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5 sm:p-3 text-right font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap tabular-nums">
                        Rs. {((parseFloat(item.price) || 0) * item.quantity).toLocaleString()}
                      </td>
                      <td className="p-2.5 sm:p-3 text-center">
                        <button
                          onClick={() => onRemoveItem(item)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition mx-auto active:scale-95"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan="4" className="p-3 text-right font-bold text-slate-600 text-xs sm:text-sm">
                      Subtotal:
                    </td>
                    <td className="p-3 text-right font-black text-sm sm:text-base text-slate-900 tabular-nums">
                      Rs. {(subTotal || 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Adaptive Cards (<640px) */}
            <div className="sm:hidden space-y-3 mb-6">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Item"}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {(item.name || "+").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <input
                        type="text"
                        value={item.name || ""}
                        onChange={(event) => onNameChange(item, event.target.value)}
                        className="flex-1 min-w-0 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        placeholder="Item name"
                      />
                    </div>
                    <button
                      onClick={() => onRemoveItem(item)}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">Size / Specs</span>
                      <input
                        type="text"
                        value={item.size || ""}
                        onChange={(event) => onSizeChange(item, event.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        placeholder="Size"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">Unit Price (Rs.)</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.price}
                        onChange={(event) => onPriceChange(item, event.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 disabled:opacity-30 flex items-center justify-center active:scale-95"
                      >
                        <Minus size={11} className="text-slate-600" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center active:scale-95 shadow-2xs"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block leading-tight">Total</span>
                      <span className="text-xs font-black text-slate-900 tabular-nums">
                        Rs. {((parseFloat(item.price) || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-between font-bold text-xs text-slate-700">
                <span>Quotation Subtotal</span>
                <span className="text-sm font-black text-slate-900 tabular-nums">Rs. {(subTotal || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Step 1: Client & Quotation Information */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-5 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  1
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Client & Quotation Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <FileText size={12} className="text-indigo-500" />
                    Invoice Reference Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Wedding_Perera_2026"
                    value={pdfName}
                    onChange={(event) => onPdfNameChange(event.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <User size={12} className="text-indigo-500" />
                    Client / Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mr. & Mrs. Perera"
                    value={invoiceTo}
                    onChange={(event) => onInvoiceToChange(event.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Calendar size={12} className="text-indigo-500" />
                    Quotation Date
                  </label>
                  <input
                    type="date"
                    aria-label="Quotation date"
                    value={invoiceDate}
                    onChange={(event) => onInvoiceDateChange(event.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Calendar size={12} className="text-purple-500" />
                    Event Date
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      aria-label="Event date"
                      value={eventDate}
                      onChange={(event) => onEventDateChange(event.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium"
                    />
                    <label
                      className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 transition text-xs font-bold ${
                        includeEventDate
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                      }`}
                      title="Include event date on PDF invoice"
                    >
                      <input
                        type="checkbox"
                        checked={includeEventDate}
                        onChange={(event) => onIncludeEventDateChange(event.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-md border transition ${
                          includeEventDate
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {includeEventDate && <Check size={10} />}
                      </span>
                      <span className="whitespace-nowrap">Add</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Adjustments & PDF Add-ons */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-6 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  2
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Payments & Invoice Add-ons
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Tag size={12} className="text-emerald-500" />
                    Discount (LKR)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={discount}
                    onChange={(event) => onDiscountChange(event.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <CreditCard size={12} className="text-indigo-500" />
                    Advance Payment (LKR)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={advance}
                    onChange={(event) => onAdvanceChange(event.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white tabular-nums"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 sm:p-3.5 transition ${
                    includeBankDetails
                      ? "border-indigo-500 bg-indigo-50/60 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeBankDetails}
                    onChange={(event) => onIncludeBankDetailsChange(event.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition ${
                      includeBankDetails
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {includeBankDetails && <Check size={11} />}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">Bank Details</span>
                    <p className="text-[11px] text-slate-500">Attach Commercial Bank account to invoice</p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 sm:p-3.5 transition ${
                    includeGallery
                      ? "border-purple-500 bg-purple-50/60 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeGallery}
                    onChange={(event) => onIncludeGalleryChange(event.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition ${
                      includeGallery
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {includeGallery && <Check size={11} />}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">Product Photo Gallery</span>
                    <p className="text-[11px] text-slate-500">Include high-res images in PDF export</p>
                  </div>
                </label>
              </div>

              {/* Bank Details Preview Box */}
              {includeBankDetails && (
                <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs">
                  {bankDetails.map(({ label, value }) => (
                    <div key={label} className="text-left">
                      <span className="text-[10px] text-slate-400 font-semibold block">{label}</span>
                      <p className="text-xs sm:text-sm font-bold text-indigo-900">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Financial Summary & PDF Action */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                      Subtotal
                    </span>
                    <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                      Rs. {(subTotal || 0).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                      Discount
                    </span>
                    <span className="text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                      {(Number(discount) || 0) > 0 ? `-Rs. ${Number(discount).toLocaleString()}` : "Rs. 0"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                      Advance Paid
                    </span>
                    <span className="text-base sm:text-lg font-bold text-amber-300 tabular-nums">
                      Rs. {(Number(advance) || 0).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                      Balance Due
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-pink-400 tabular-nums">
                      Rs. {balanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="lg:border-l lg:border-white/15 lg:pl-6 shrink-0">
                  <button
                    onClick={onGenerateReport}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3.5 sm:py-4 px-8 sm:px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-3 text-base sm:text-lg group active:scale-95"
                  >
                    <FileText size={22} className="text-slate-950 group-hover:scale-110 transition-transform" />
                    <span>Download PDF Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomPackageEditor;
