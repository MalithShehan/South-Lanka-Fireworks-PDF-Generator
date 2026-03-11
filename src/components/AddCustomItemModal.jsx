import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";

const AddCustomItemModal = ({ isOpen, onClose, onAddItem }) => {
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const nameInputRef = useRef(null);
  const modalRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const previewTotal = useMemo(() => {
    const unitPrice = parseFloat(price) || 0;
    const qty = parseInt(quantity, 10) || 1;
    return unitPrice * qty;
  }, [price, quantity]);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    previouslyFocusedRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;

      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1")]'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setName("");
    setSize("");
    setPrice("");
    setQuantity("1");
  };

  const handleAddItem = () => {
    const added = onAddItem({
      name,
      size,
      price,
      qty: quantity,
    });

    if (added) {
      resetForm();
    }
  };

  const isAddDisabled = name.trim() === "";

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAddItem();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />

      <Motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-title"
        initial={{ opacity: 0, scale: 0.95, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -12 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl p-5 sm:p-7 z-10 mx-4 border border-gray-100"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 id="add-item-title" className="text-lg font-bold text-gray-900">
                Add Custom Item
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Add a bespoke firework or service to your quotation.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Item name
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Sparkler kit"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  aria-label="Custom item name"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Size (optional)
                <input
                  type="text"
                  placeholder="Large display"
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                  className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  aria-label="Custom item size"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Price (LKR)
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    aria-label="Custom item price"
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    aria-label="Custom item quantity"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {name.slice(0, 2).toUpperCase() || "+"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {name || "Item name"}
                    </div>
                    <div className="text-sm text-gray-500">{size || "Size"}</div>
                  </div>
                </div>
                <div className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-semibold uppercase tracking-wider">Preview</div>
              </div>

              <dl className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <dt>Price</dt>
                  <dd className="font-medium">Rs. {(parseFloat(price) || 0).toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Quantity</dt>
                  <dd className="font-medium">{quantity}</dd>
                </div>
                <div className="flex items-center justify-between text-pink-600 font-semibold text-lg">
                  <dt>Total</dt>
                  <dd>Rs. {previewTotal.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-3 sm:items-center sm:justify-between pt-2">
            <button
              type="submit"
              disabled={isAddDisabled}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-white font-medium transition-all ${
                isAddDisabled
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
              }`}
            >
              <ShoppingCart size={16} className="text-white" />
              <span>Add Item</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Motion.div>
    </div>
  );
};

export default AddCustomItemModal;