import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ShoppingCart, X, UploadCloud, Image as ImageIcon, Trash2, RefreshCw } from "lucide-react";

const processImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file from device"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        // Max dimension for LocalStorage optimization:
        // 480px max dimension provides sharp card & PDF quality while keeping size under ~30KB
        const maxDim = 480;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Highly compressed JPEG for local database storage
        const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

const AddCustomItemModal = ({ isOpen, onClose, onAddItem }) => {
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const nameInputRef = useRef(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
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
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
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
    setImage(null);
    setImageFileName("");
    setImageError("");
    setIsProcessingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file (JPEG, PNG, WEBP, etc.)");
      return;
    }

    setIsProcessingImage(true);
    try {
      const dataUrl = await processImageFile(file);
      setImage(dataUrl);
      setImageFileName(file.name);
    } catch (err) {
      setImageError(err.message || "Failed to process image.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    e?.stopPropagation();
    setImage(null);
    setImageFileName("");
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddItem = () => {
    const added = onAddItem({
      name,
      size,
      price,
      qty: quantity,
      image,
    });

    if (added) {
      resetForm();
    }
  };

  const isAddDisabled = name.trim() === "" || isProcessingImage;

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAddItem();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" aria-hidden="true" onClick={onClose} />

      <Motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-title"
        initial={{ opacity: 0, scale: 0.95, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -12 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg md:max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 z-10 mx-auto border border-slate-100 my-auto"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  Custom Studio
                </span>
              </div>
              <h4 id="add-item-title" className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                Add Custom Item & Device Photo
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Upload photos from your computer or phone, set specs, and save directly to your catalog.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shrink-0"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-slate-700">
                Item name <span className="text-red-500">*</span>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. Premium Waterfall Fireworks"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  aria-label="Custom item name"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Size / Specs (optional)
                <input
                  type="text"
                  placeholder="e.g. 50 Shots, 3 inch"
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                  className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    step="100"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    className="mt-1.5 border border-gray-200 rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    aria-label="Custom item quantity"
                  />
                </label>
              </div>

              {/* Upload Image from device */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Device Image <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="custom-item-device-image"
                />

                {!image ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-3 sm:p-3.5 text-center transition-all ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50/80 scale-[0.99]"
                        : "border-gray-200 hover:border-indigo-400 hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        {isProcessingImage ? (
                          <RefreshCw size={16} className="animate-spin text-indigo-600" />
                        ) : (
                          <UploadCloud size={16} />
                        )}
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {isProcessingImage ? (
                          <span>Optimizing photo...</span>
                        ) : (
                          <>
                            <span className="text-indigo-600 font-semibold hover:underline">Choose from device</span> or drag & drop
                          </>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">JPG, PNG, WEBP from your computer/phone</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-indigo-100 rounded-xl p-2 bg-indigo-50/50 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={image}
                        alt="Upload preview"
                        className="w-11 h-11 rounded-lg object-cover border border-indigo-200 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate max-w-[130px] sm:max-w-[180px]">
                          {imageFileName || "Custom device image"}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Image attached
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/70 rounded-lg transition"
                        title="Change image"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {imageError && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{imageError}</p>
                )}
              </div>
            </div>

            {/* Right side preview card */}
            <div className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-gray-50 to-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                    Live Preview
                  </span>
                  {image ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                      Device Image
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-normal">
                      Auto Placeholder
                    </span>
                  )}
                </div>

                {image ? (
                  <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden mb-3 border border-gray-200 bg-gray-100 shadow-inner">
                    <img
                      src={image}
                      alt={name || "Custom item"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                      <div className="text-white min-w-0">
                        <p className="text-xs font-bold drop-shadow-sm truncate">{name || "Custom Item"}</p>
                        <p className="text-[10px] text-white/80 drop-shadow-sm truncate">{size || "Bespoke Size"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                      {name.slice(0, 2).toUpperCase() || "+"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">
                        {name || "Item name"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{size || "Size / Specs"}</div>
                    </div>
                  </div>
                )}
              </div>

              <dl className="mt-2 space-y-1.5 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Unit Price</dt>
                  <dd className="font-medium text-gray-800">Rs. {(parseFloat(price) || 0).toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Quantity</dt>
                  <dd className="font-medium text-gray-800">{quantity}</dd>
                </div>
                <div className="flex items-center justify-between text-pink-600 font-semibold text-base sm:text-lg pt-1.5 border-t border-dashed border-gray-200">
                  <dt>Estimated Total</dt>
                  <dd>Rs. {previewTotal.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-3 sm:items-center sm:justify-between pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isAddDisabled}
              className={`inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-sm sm:text-base font-extrabold transition-all min-h-[46px] ${
                isAddDisabled
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
              }`}
            >
              <ShoppingCart size={18} className={isAddDisabled ? "text-slate-400" : "text-slate-950"} />
              <span>{isProcessingImage ? "Optimizing photo..." : "Add to Catalog & Quote"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold text-sm sm:text-base transition-all min-h-[46px]"
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