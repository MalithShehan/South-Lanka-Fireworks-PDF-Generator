import React from "react";
import { FileText, Trash2, Check, Plus, Minus, ShoppingCart, ArrowDown, Sparkles } from "lucide-react";

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

  const renderTableRows = () =>
    items.map((item, idx) => (
      <tr key={idx} className="border-t hover:bg-indigo-50/50 transition group">
        <td className="p-1.5 sm:p-2.5 align-middle">
          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={item.name || ""}
              onChange={(event) => onNameChange(item, event.target.value)}
              className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 text-left text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Item name"
              placeholder="Item name"
            />
            {/* Editable size and price on mobile under name */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <input
                type="text"
                value={item.size || ""}
                onChange={(event) => onSizeChange(item, event.target.value)}
                className="flex-1 min-w-0 border border-gray-200 rounded-md px-1.5 py-1 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Item size"
                placeholder="Size"
              />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] text-gray-500">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={item.price}
                  onChange={(event) => onPriceChange(item, event.target.value)}
                  className="w-16 border border-gray-200 rounded-md px-1.5 py-1 text-right text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </td>
        <td className="p-2 sm:p-2.5 align-middle hidden sm:table-cell">
          <input
            type="text"
            value={item.size || ""}
            onChange={(event) => onSizeChange(item, event.target.value)}
            className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 text-left text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Item size"
            placeholder="Size"
          />
        </td>
        <td className="p-2 sm:p-2.5 align-middle hidden sm:table-cell">
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-gray-500 mr-1">Rs.</span>
            <input
              type="number"
              min="0"
              step="100"
              value={item.price}
              onChange={(event) => onPriceChange(item, event.target.value)}
              className="w-16 sm:w-20 border border-gray-200 rounded-lg p-1.5 sm:p-2 text-right text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </td>
        <td className="p-1 sm:p-2.5 align-middle">
          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
            <button
              onClick={() => handleDecrement(item)}
              disabled={item.quantity <= 1}
              className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              aria-label="Decrease quantity"
            >
              <Minus size={10} className="text-gray-600 sm:w-3 sm:h-3" />
            </button>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(event) => {
                const parsed = parseInt(event.target.value, 10);
                onQtyChange(item, Number.isNaN(parsed) || parsed < 1 ? 1 : parsed);
              }}
              className="w-8 sm:w-12 border border-gray-200 rounded-lg p-0.5 sm:p-1.5 text-center text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={() => handleIncrement(item)}
              className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition"
              aria-label="Increase quantity"
            >
              <Plus size={10} className="text-indigo-600 sm:w-3 sm:h-3" />
            </button>
          </div>
        </td>
        <td className="p-1 sm:p-2.5 text-right font-semibold text-pink-600 text-[10px] sm:text-sm whitespace-nowrap">
          <span className="hidden sm:inline">Rs.</span>{((parseFloat(item.price) || 0) * item.quantity).toLocaleString()}
        </td>
        <td className="p-1 sm:p-2.5 text-center">
          <button
            onClick={() => onRemoveItem(item)}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition mx-auto group-hover:bg-red-100"
            aria-label="Remove item"
            title="Remove item"
          >
            <Trash2 size={12} className="text-red-500 sm:w-3.5 sm:h-3.5" />
          </button>
        </td>
      </tr>
    ));

  return (
    <div
      className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      id="custom-package"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-pink-500 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Your Quotation</h3>
              <p className="text-white/80 text-xs sm:text-sm">
                {hasItems ? `${itemCount} item${itemCount !== 1 ? 's' : ''} in cart` : 'Start adding items below'}
              </p>
            </div>
          </div>
          {hasItems && onClearCart && (
            <button
              onClick={onClearCart}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-medium transition inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {!hasItems ? (
          /* Empty State with Guidance */
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center">
              <Sparkles size={32} className="text-indigo-500" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Ready to Create Your Quotation?</h4>
            <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-md mx-auto">
              Browse our fireworks collection above and click "Add" to start building your custom package.
            </p>
            
            {/* Quick Steps Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm mb-2">1</div>
                <h5 className="font-semibold text-gray-800 text-sm mb-1">Browse Products</h5>
                <p className="text-xs text-gray-500">Scroll up to see our fireworks catalog</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm mb-2">2</div>
                <h5 className="font-semibold text-gray-800 text-sm mb-1">Add to Cart</h5>
                <p className="text-xs text-gray-500">Click add buttons to build your package</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm mb-2">3</div>
                <h5 className="font-semibold text-gray-800 text-sm mb-1">Generate PDF</h5>
                <p className="text-xs text-gray-500">Add client details and download invoice</p>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-indigo-500 animate-bounce">
              <ArrowDown size={20} />
              <span className="text-sm font-medium">Scroll up to browse products</span>
              <ArrowDown size={20} className="rotate-180" />
            </div>
          </div>
        ) : (
          <>
            {/* Items Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6 shadow-sm">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-pink-50">
                    <th className="p-2 sm:p-3 text-left text-indigo-700 font-semibold min-w-[120px] sm:min-w-[180px]">Item Name</th>
                    <th className="p-2 sm:p-3 text-left text-indigo-700 font-semibold hidden sm:table-cell">Size</th>
                    <th className="p-2 sm:p-3 text-center text-indigo-700 font-semibold hidden sm:table-cell">Price</th>
                    <th className="p-2 sm:p-3 text-center text-indigo-700 font-semibold w-20 sm:w-auto">Qty</th>
                    <th className="p-2 sm:p-3 text-right text-indigo-700 font-semibold">Total</th>
                    <th className="p-2 sm:p-3 text-center text-indigo-700 font-semibold w-10 sm:w-12"></th>
                  </tr>
                </thead>
                <tbody>{renderTableRows()}</tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan="2" className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm sm:hidden">Subtotal:</td>
                    <td colSpan="4" className="p-3 text-right font-semibold text-gray-700 hidden sm:table-cell">Subtotal:</td>
                    <td className="p-2 sm:p-3 text-right font-bold text-sm sm:text-lg text-gray-800">Rs.{(subTotal || 0).toLocaleString()}</td>
                    <td className="hidden sm:table-cell"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Client Details Section */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5 mb-6 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">1</span>
                Client Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Invoice Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Wedding_Perera_2026"
                    value={pdfName}
                    onChange={(event) => onPdfNameChange(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Mr. & Mrs. Perera"
                    value={invoiceTo}
                    onChange={(event) => onInvoiceToChange(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Event Date</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      aria-label="Event date"
                      value={eventDate}
                      onChange={(event) => onEventDateChange(event.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <label
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-2.5 sm:px-3 sm:py-3 transition text-xs sm:text-sm ${
                        includeEventDate
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                      }`}
                      title="Include event date in PDF"
                    >
                      <input
                        type="checkbox"
                        checked={includeEventDate}
                        onChange={(event) => onIncludeEventDateChange(event.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded border-2 transition ${
                          includeEventDate
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {includeEventDate && <Check size={10} />}
                      </span>
                      <span className="font-medium whitespace-nowrap">Add to PDF</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Options Section */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5 mb-6 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs">2</span>
                Payment & Options
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Discount (LKR)</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={discount}
                    onChange={(event) => onDiscountChange(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Advance Payment (LKR)</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={advance}
                    onChange={(event) => onAdvanceChange(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Toggle Options */}
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-3 sm:p-4 transition ${
                    includeBankDetails
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeBankDetails}
                    onChange={(event) => onIncludeBankDetailsChange(event.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded border-2 transition ${
                      includeBankDetails
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {includeBankDetails && <Check size={12} />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">Bank Details</span>
                    <p className="text-xs text-gray-500">Add payment info to invoice</p>
                  </div>
                </label>

                <label
                  className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-3 sm:p-4 transition ${
                    includeGallery
                      ? "border-pink-400 bg-pink-50"
                      : "border-gray-200 bg-white hover:border-pink-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeGallery}
                    onChange={(event) => onIncludeGalleryChange(event.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded border-2 transition ${
                      includeGallery
                        ? "border-pink-600 bg-pink-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {includeGallery && <Check size={12} />}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">Image Gallery</span>
                    <p className="text-xs text-gray-500">Add product photos to PDF</p>
                  </div>
                </label>
              </div>

              {/* Bank Details Preview */}
              {includeBankDetails && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  {bankDetails.map(({ label, value }) => (
                    <div key={label} className="text-center sm:text-left">
                      <span className="text-xs text-gray-500">{label}</span>
                      <p className="text-xs sm:text-sm font-semibold text-indigo-800">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary & Generate Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl p-4 sm:p-5 border border-indigo-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs.{(subTotal || 0).toLocaleString()}</span>
                  </div>
                  {(Number(discount) || 0) > 0 && (
                    <div className="flex items-center justify-between sm:justify-start gap-4 text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-Rs.{(Number(discount) || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between sm:justify-start gap-4 text-lg font-bold">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-pink-600">Rs.{totalAfterDiscount.toLocaleString()}</span>
                  </div>
                  {(Number(advance) || 0) > 0 && (
                    <div className="flex items-center justify-between sm:justify-start gap-4 text-base font-semibold text-indigo-600">
                      <span>Balance Due:</span>
                      <span>Rs.{balanceDue.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={onGenerateReport}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:opacity-90 hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 text-base sm:text-lg"
                >
                  <FileText size={20} className="text-white" />
                  <span>Generate PDF</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomPackageEditor;
