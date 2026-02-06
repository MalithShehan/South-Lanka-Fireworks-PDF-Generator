import React from "react";
import { FileText, Trash2, Check } from "lucide-react";

const CustomPackageEditor = ({
  items,
  onNameChange,
  onSizeChange,
  onPriceChange,
  onQtyChange,
  onRemoveItem,
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
  totalAfterDiscount,
  balanceDue,
  onGenerateReport,
}) => {
  const hasItems = items.length > 0;

  const renderTableRows = () =>
    items.map((item, idx) => (
      <tr key={idx} className="border-t hover:bg-indigo-50 transition">
        <td className="p-2.5 align-top min-w-[200px]">
          <input
            type="text"
            value={item.name || ""}
            onChange={(event) => onNameChange(item, event.target.value)}
            className="w-full border border-gray-300 rounded-lg p-1.5 text-left text-xs focus:ring-2 focus:ring-indigo-500"
            aria-label="Item name"
          />
        </td>
        <td className="p-2.5 align-top min-w-[140px]">
          <input
            type="text"
            value={item.size || ""}
            onChange={(event) => onSizeChange(item, event.target.value)}
            className="w-full border border-gray-300 rounded-lg p-1.5 text-left text-xs focus:ring-2 focus:ring-indigo-500"
            aria-label="Item size"
          />
        </td>
        <td className="p-2.5 text-center">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              String(item.id).startsWith("custom-")
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {String(item.id).startsWith("custom-") ? "Custom" : "Product"}
          </span>
        </td>
        <td className="p-2.5 align-top">
          <input
            type="number"
            min="0"
            step="1"
            value={item.price}
            onChange={(event) => onPriceChange(item, event.target.value)}
            className="w-24 border border-gray-300 rounded-lg p-1.5 text-right text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </td>
        <td className="p-2.5 align-top text-center">
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) => {
              const parsed = parseInt(event.target.value, 10);
              onQtyChange(item, Number.isNaN(parsed) ? 1 : parsed);
            }}
            className="w-16 border border-gray-300 rounded-lg p-1.5 text-center text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </td>
        <td className="p-2.5 text-right text-pink-600 font-semibold">
          Rs.{((parseFloat(item.price) || 0) * item.quantity).toLocaleString()}
        </td>
        <td className="p-2.5 text-center">
          <button
            onClick={() => onRemoveItem(item)}
            className="text-red-500 hover:underline inline-flex items-center gap-1 text-xs font-semibold"
          >
            <Trash2 size={14} className="text-red-500" />
            <span>Remove</span>
          </button>
        </td>
      </tr>
    ));

  return (
    <div
      className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200"
      id="custom-package"
    >
      <h3 className="text-2xl font-bold mb-6 text-indigo-700">📦 Your Custom Package</h3>

      {!hasItems ? (
        <p className="text-gray-500 text-center text-base">
          No items added yet. Add fireworks to build your custom package!
        </p>
      ) : (
        <>
          <div className="block overflow-x-auto rounded-lg border border-gray-200 mb-6">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-indigo-100 text-indigo-700">
                  <th className="p-2.5 text-left">Item</th>
                  <th className="p-2.5 text-left">Size</th>
                  <th className="p-2.5 text-center">Type</th>
                  <th className="p-2.5 text-right">Price</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Enter invoice name"
              value={pdfName}
              onChange={(event) => onPdfNameChange(event.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Invoice to"
              value={invoiceTo}
              onChange={(event) => onInvoiceToChange(event.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Event date"
                value={eventDate}
                onChange={(event) => onEventDateChange(event.target.value)}
                className="border border-gray-300 rounded-lg p-3 flex-1 focus:ring-2 focus:ring-indigo-500"
              />
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 transition hover:border-indigo-400 hover:bg-indigo-50/60 ${
                  includeEventDate
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 bg-white text-gray-700"
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
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    includeEventDate
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-400 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <Check size={12} />
                </span>
                <span className="font-semibold text-xs whitespace-nowrap">Event Date</span>
              </label>
            </div>
          </div>

          <div
            className={`mb-6 rounded-2xl border p-4 transition-colors ${
              includeBankDetails
                ? "border-indigo-300 bg-indigo-50/60"
                : "border-gray-200 bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={includeBankDetails}
                onChange={(event) => onIncludeBankDetailsChange(event.target.checked)}
                className="mt-1 h-4 w-4 accent-indigo-600"
              />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-gray-800">Include bank details in PDF</span>
                <span className="text-xs text-gray-500">
                  {includeBankDetails
                    ? "Bank account details will be added to the invoice"
                    : "Check to append your bank information to the PDF"}
                </span>
              </div>
            </label>

            {includeBankDetails && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {bankDetails.map(({ label, value }) => (
                  <label key={label} className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-600">{label}</span>
                    <input
                      type="text"
                      value={value}
                      readOnly
                      className="border border-indigo-100 bg-indigo-50/60 rounded-lg p-3 text-sm font-medium text-indigo-800"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                placeholder="Discount (LKR)"
                value={discount}
                onChange={(event) => onDiscountChange(event.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Advance (LKR)"
                value={advance}
                onChange={(event) => onAdvanceChange(event.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
              />
              <label
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition hover:border-indigo-400 hover:bg-indigo-50/60 ${
                  includeGallery
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeGallery}
                  onChange={(event) => onIncludeGalleryChange(event.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                    includeGallery
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-400 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <Check size={18} />
                </span>
                <div className="flex flex-col text-left">
                  <span className="font-semibold">Include image gallery pages</span>
                  <span className="text-xs text-gray-500">
                    {includeGallery
                      ? "Gallery pages will be added to the PDF"
                      : "Tap to append gallery pages"}
                  </span>
                </div>
              </label>
            </div>

            <div className="text-right w-full sm:w-auto">
              <p className="text-lg font-semibold text-gray-800">
                💰 Total: <span className="text-pink-600">Rs.{totalAfterDiscount.toLocaleString()}</span>
              </p>
              <p className="text-base font-semibold text-gray-800">
                ⚖️ Balance: <span className="text-indigo-600">Rs.{balanceDue.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onGenerateReport}
            className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition inline-flex items-center justify-center gap-2"
          >
            <FileText size={16} className="text-white" />
            <span className="text-white">Generate PDF</span>
          </button>
        </>
      )}
    </div>
  );
};

export default CustomPackageEditor;
