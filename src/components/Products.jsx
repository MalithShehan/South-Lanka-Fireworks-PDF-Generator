import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import items from "./Items";
import jsPDF from "jspdf";
import { ShoppingCart, Check, X, Search, ArrowUp, Sparkles, Phone, Mail, MapPin, Globe, Zap, FileText, Package, ChevronRight, Plus, AlertCircle, Info, FileSignature } from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import AddCustomItemModal from "./AddCustomItemModal";
import ProductGrid from "./ProductGrid";
import CustomPackageEditor from "./CustomPackageEditor";
import QuoteHistory from "./QuoteHistory";
import LetterheadGenerator from "./LetterheadGenerator";

const productVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const HISTORY_STORAGE_KEY = "slf-quotation-history";
const CUSTOM_PRODUCTS_STORAGE_KEY = "slf-custom-products-v1";
const HISTORY_LIMIT = 1000;
const TOAST_DURATION = 3000;
const BANK_DETAILS = [
  { label: "Acc No", value: "8011371317" },
  { label: "Bank Name", value: "Commercial Bank" },
  { label: "Branch", value: "Galle" },
  { label: "Acc Holder Name", value: "J.W.C.Thushara" },
];

// Small Liquid Glass Notification Component
const Toast = ({ show, data, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!show) {
      setProgress(100);
      return;
    }
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [show, data]);

  if (!data) return null;

  const isSuccess = data.type === 'success' || !data.type;
  const isError = data.type === 'error';
  const isInfo = data.type === 'info';

  const liquidTheme = isError
    ? {
        icon: <AlertCircle className="w-3.5 h-3.5 text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />,
        pillBg: "bg-rose-500/20 text-rose-300 border-rose-400/30",
        glow: "rgba(244, 63, 94, 0.25)",
        progress: "from-rose-500 via-rose-400 to-rose-300",
      }
    : isInfo
    ? {
        icon: <Info className="w-3.5 h-3.5 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />,
        pillBg: "bg-sky-500/20 text-sky-300 border-sky-400/30",
        glow: "rgba(56, 189, 248, 0.25)",
        progress: "from-sky-500 via-indigo-400 to-sky-300",
      }
    : {
        icon: <Check className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />,
        pillBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
        glow: "rgba(245, 158, 11, 0.25)",
        progress: "from-amber-500 via-yellow-400 to-amber-300",
      };

  return (
    <AnimatePresence>
      {show && (
        <Motion.div
          initial={{ opacity: 0, y: -20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.94 }}
          transition={{ type: "spring", damping: 28, stiffness: 420 }}
          className="fixed top-3 sm:top-4 inset-x-0 z-[10001] flex justify-center px-3 pointer-events-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto relative overflow-hidden rounded-2xl sm:rounded-full bg-slate-950/80 backdrop-blur-2xl border border-white/20 text-white w-full max-w-[370px] transition-all"
            style={{
              boxShadow: `0 12px 36px rgba(0, 0, 0, 0.45), 0 0 24px ${liquidTheme.glow}, inset 0 1px 1px rgba(255, 255, 255, 0.35)`,
            }}
          >
            {/* Liquid Specular Reflection Edge */}
            <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-2.5">
              {/* Liquid Status Icon or Thumbnail */}
              {data.itemImage ? (
                <img
                  src={data.itemImage}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-white/30 shrink-0 shadow-sm"
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${liquidTheme.pillBg} backdrop-blur-md shadow-inner`}
                >
                  {liquidTheme.icon}
                </div>
              )}

              {/* Message Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-extrabold text-white truncate leading-tight">
                    {data.title || (isSuccess ? "Added to Quote" : "Notice")}
                  </p>
                  {data.itemPrice && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 tabular-nums">
                      Rs.{Number(data.itemPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 truncate leading-tight mt-0.5">
                  {data.itemName || data.message}
                </p>
              </div>

              {/* Action shortcut or Dismiss */}
              <div className="flex items-center gap-1 shrink-0">
                {data.cartCount !== undefined && data.cartCount > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      document
                        .getElementById("custom-package")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] font-bold text-amber-300 border border-white/15 transition flex items-center gap-0.5"
                    title="View Quote"
                  >
                    <span>Quote</span>
                    <ChevronRight size={10} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-6 h-6 rounded-full hover:bg-white/15 active:scale-90 flex items-center justify-center text-slate-400 hover:text-white transition"
                  aria-label="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Ultra-slim Liquid Progress Indicator */}
            <div className="h-[2px] w-full bg-white/10 overflow-hidden">
              <Motion.div
                className={`h-full bg-gradient-to-r ${liquidTheme.progress}`}
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

const Products = () => {
  const [activeStudio, setActiveStudio] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash === "#letterhead") {
      return "letterhead";
    }
    return "quotation";
  });
  const [customPackageItems, setCustomPackageItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState(null);
  const toastTimerRef = useRef(null);

  const showNotification = useCallback((data) => {
    setToastData(data);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), TOAST_DURATION);
  }, []);

  const switchStudio = useCallback((studio) => {
    setActiveStudio(studio);
    if (typeof window !== "undefined") {
      const nextHash = studio === "letterhead" ? "#letterhead" : "#products";
      window.history.replaceState(null, "", nextHash);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);
  const [pdfName, setPdfName] = useState("");
  const [discount, setDiscount] = useState("");
  const [advance, setAdvance] = useState("");
  const [invoiceTo, setInvoiceTo] = useState("");
  const todayISO = new Date().toISOString().slice(0, 10);
  const [eventDate, setEventDate] = useState(todayISO);
  const [invoiceDate, setInvoiceDate] = useState(todayISO);
  const [showAddModal, setShowAddModal] = useState(false);
  const [includeGallery, setIncludeGallery] = useState(false);
  const [includeBankDetails, setIncludeBankDetails] = useState(false);
  const [includeEventDate, setIncludeEventDate] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [historySearch, setHistorySearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const imageCacheRef = useRef({});

  const cartCount = customPackageItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const [customProducts, setCustomProducts] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(CUSTOM_PRODUCTS_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Sync custom items to localStorage database whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(
        CUSTOM_PRODUCTS_STORAGE_KEY,
        JSON.stringify(customProducts)
      );
    } catch (e) {
      console.warn("Could not save custom products to database:", e);
    }
  }, [customProducts]);

  // Combined product catalog: custom bespoke items first, then catalog items
  const products = useMemo(() => {
    return [...customProducts, ...items];
  }, [customProducts]);

  // Category item counts
  const categoryCounts = useMemo(() => {
    return {
      all: products.length,
      shells: products.filter((p) => (p.name || "").toLowerCase().includes("shell")).length,
      cakes: products.filter((p) => {
        const n = (p.name || "").toLowerCase();
        return n.includes("cake") || n.includes("shot") || n.includes("display");
      }).length,
      custom: products.filter((p) => p.isCustom || String(p.id).startsWith("custom-")).length,
    };
  }, [products]);

  // Scroll listener for navbar shadow and scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter products by category and search term
  const displayProducts = useMemo(() => {
    let filtered = products;

    if (activeCategory === "shells") {
      filtered = filtered.filter((p) => (p.name || "").toLowerCase().includes("shell"));
    } else if (activeCategory === "cakes") {
      filtered = filtered.filter((p) => {
        const n = (p.name || "").toLowerCase();
        return n.includes("cake") || n.includes("shot") || n.includes("display");
      });
    } else if (activeCategory === "custom") {
      filtered = filtered.filter((p) => p.isCustom || String(p.id).startsWith("custom-"));
    }

    if (!productSearch.trim()) return filtered;
    const term = productSearch.trim().toLowerCase();
    return filtered.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
    );
  }, [products, productSearch, activeCategory]);

  const getInitials = (name) =>
    (name || "")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return quoteHistory;
    const term = historySearch.trim().toLowerCase();
    return quoteHistory.filter((quote) => {
      const haystack = [
        quote.pdfName,
        quote.invoiceTo,
        quote.invoiceDate,
        quote.eventDate,
        (quote.lineItems || []).map((item) => item.name).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [historySearch, quoteHistory]);

  const makePlaceholderImage = (name) => {
    const initials = getInitials(name) || "+";
    const bg = "%23ede9fe";
    const fg = "%2306366f";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect fill='${bg}' width='100%' height='100%'/><text x='50%' y='50%' dy='.35em' font-family='Arial, Helvetica, sans-serif' font-size='120' text-anchor='middle' fill='${fg}'>${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const getItemImageSource = (item) => {
    const raw = typeof item?.image === "string" ? item.image.trim() : "";
    return raw || makePlaceholderImage(item?.name);
  };

  const drawFooter = (docInstance, width, height) => {
    docInstance.setFillColor(0, 47, 108);
    docInstance.rect(0, height - 20, width, 20, "F");
    docInstance.setTextColor(255, 255, 255);
    docInstance.setFontSize(10);
    docInstance.text(
      "Thank you for choosing South Lanka Fireworks!",
      width / 2,
      height - 8,
      { align: "center" }
    );
  };

  const formatDateDDMMYYYY = (d) => {
    const date = d instanceof Date ? d : new Date(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatDateTimeReadable = (isoString) => {
    if (!isoString) return "Unknown";
    try {
      return new Date(isoString).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoString;
    }
  };

  const parseToISODate = (dateStr) => {
    if (!dateStr) return todayISO;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const dd = parts[0].padStart(2, "0");
      const mm = parts[1].padStart(2, "0");
      const yyyy = parts[2];
      return `${yyyy}-${mm}-${dd}`;
    }
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    } catch {
      // ignore
    }
    return todayISO;
  };

  const addToCustomPackage = (item, sizeObj) => {
    const imageSource = getItemImageSource(item);
    const exists = customPackageItems.find(
      (i) => i.id === item.id && i.size === sizeObj.size
    );
    
    let newCartCount = cartCount + 1;
    
    if (exists) {
      setCustomPackageItems(
        customPackageItems.map((i) =>
          i.id === item.id && i.size === sizeObj.size
            ? { ...i, quantity: i.quantity + 1, image: i.image || imageSource }
            : i
        )
      );
    } else {
      setCustomPackageItems([
        ...customPackageItems,
        {
          id: item.id,
          name: item.name,
          size: sizeObj.size,
          price: sizeObj.price,
          quantity: 1,
          image: imageSource,
        },
      ]);
    }

    // Show professional toast notification
    setToastData({
      type: 'success',
      title: 'Added to Cart!',
      itemName: item.name,
      itemSize: sizeObj.size || 'Standard',
      itemPrice: sizeObj.price,
      itemImage: imageSource,
      cartCount: newCartCount,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), TOAST_DURATION);
  };

  const removeFromCustomPackage = (item) => {
    setCustomPackageItems(
      customPackageItems.filter(
        (i) => !(i.id === item.id && i.size === item.size)
      )
    );
  };

  const handleClearCart = () => {
    if (!customPackageItems.length) return;
    const shouldClear =
      typeof window === "undefined" ? true : window.confirm("Clear all items from your cart?");
    if (shouldClear) {
      setCustomPackageItems([]);
      setPdfName("");
      setInvoiceTo("");
      setInvoiceDate(todayISO);
      setDiscount("");
      setAdvance("");
      setToastData({
        type: 'success',
        title: 'Cart Cleared',
        message: 'All items have been removed from your cart',
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION);
    }
  };

  const handleClearHistory = () => {
    if (!quoteHistory.length) return;
    const shouldClear =
      typeof window === "undefined" ? true : window.confirm("Clear all saved quotations?");
    if (shouldClear) {
      setQuoteHistory([]);
    }
  };

  const handleDeleteQuote = (quoteId) => {
    setQuoteHistory((prev) => prev.filter((quote) => quote.id !== quoteId));
  };

  const handleLoadQuote = (quote) => {
    if (!quote) return;
    const itemsToLoad = (quote.lineItems || []).map((item) => ({
      ...item,
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
    }));

    const inputs = quote.inputs || {};

    setCustomPackageItems(itemsToLoad);
    setPdfName(inputs.pdfName ?? quote.pdfName ?? "");
    setInvoiceTo(inputs.invoiceTo ?? quote.invoiceTo ?? "");
    const loadedInvoiceDate = inputs.invoiceDate ?? parseToISODate(quote.invoiceDate);
    setInvoiceDate(loadedInvoiceDate);
    const loadedEventDate = inputs.eventDate ?? (quote.eventDate || todayISO);
    setEventDate(loadedEventDate);
    setDiscount(
      inputs.discount ??
        (typeof quote.totals?.discount === "number"
          ? String(quote.totals.discount)
          : "")
    );
    setAdvance(
      inputs.advance ??
        (typeof quote.totals?.advance === "number"
          ? String(quote.totals.advance)
          : "")
    );
    setIncludeGallery(Boolean(quote.includeGallery));
    const bankToggle = inputs.includeBankDetails ?? quote.includeBankDetails;
    setIncludeBankDetails(
      typeof bankToggle === "boolean" ? bankToggle : true
    );

    setToastData({
      type: 'success',
      title: 'Quotation Loaded',
      message: `"${quote.pdfName}" is ready for editing`,
      cartCount: itemsToLoad.reduce((sum, item) => sum + (item.quantity || 0), 0),
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), TOAST_DURATION);

    document
      .getElementById("custom-package")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddCustomItem = ({ name, size, price, qty, image }) => {
    const trimmedName = (name || "").trim();
    if (!trimmedName) {
      setToastData({
        type: 'error',
        title: 'Missing Item Name',
        message: 'Please enter a name for your custom item',
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION);
      return false;
    }

    const cleanedSize = (size || "").trim();
    const numericPrice = parseFloat(price) || 0;
    const parsedQty = parseInt(qty, 10);
    const numericQty = Math.max(1, Number.isNaN(parsedQty) ? 1 : parsedQty);
    const id = `custom-${Date.now()}`;
    const placeholderImage = makePlaceholderImage(trimmedName);
    const finalImage = (image && typeof image === "string" && image.trim()) ? image.trim() : placeholderImage;
    const newItem = {
      id,
      name: trimmedName,
      size: cleanedSize,
      price: numericPrice,
      quantity: numericQty,
      image: finalImage,
    };
    setCustomPackageItems((prev) => [...prev, newItem]);

    const productItem = {
      id,
      name: trimmedName,
      image: finalImage,
      sizes: [{ size: cleanedSize || "Custom", price: numericPrice }],
      isCustom: true,
      createdAt: Date.now(),
    };

    setCustomProducts((prev) => {
      const updated = [productItem, ...prev];
      try {
        localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save to localStorage database:", err);
      }
      return updated;
    });

    setToastData({
      type: 'success',
      title: 'Custom Item Added!',
      itemName: trimmedName,
      itemSize: cleanedSize || 'Custom',
      itemPrice: numericPrice,
      itemImage: finalImage,
      cartCount: cartCount + numericQty,
    });
    setShowToast(true);
    setShowAddModal(false);
    setTimeout(() => setShowToast(false), TOAST_DURATION);
    return true;
  };

  const handleDeleteCustomProduct = (productId) => {
    if (window.confirm("Do you want to delete this custom item from your database?")) {
      setCustomProducts((prev) => {
        const updated = prev.filter((p) => p.id !== productId);
        try {
          localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      setToastData({
        type: 'info',
        title: 'Custom Item Deleted',
        message: 'Item removed from your catalog database',
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(quoteHistory));
    } catch {
      // ignore storage quota issues
    }
  }, [quoteHistory]);

  const updateCustomPackageQty = (item, qty) => {
    setCustomPackageItems(
      customPackageItems.map((i) =>
        i.id === item.id && i.size === item.size ? { ...i, quantity: qty } : i
      )
    );
  };

  const updateCustomPackageName = (item, newName) => {
    setCustomPackageItems(
      customPackageItems.map((i) =>
        i.id === item.id && i.size === item.size ? { ...i, name: newName } : i
      )
    );
  };

  const updateCustomPackageSize = (item, newSize) => {
    setCustomPackageItems(
      customPackageItems.map((i) =>
        i.id === item.id && i.size === item.size ? { ...i, size: newSize } : i
      )
    );
  };

  const updateCustomPackagePrice = (item, newValue) => {
    setCustomPackageItems(
      customPackageItems.map((i) => {
        if (i.id === item.id && i.size === item.size) {
          return {
            ...i,
            price:
              newValue === ""
                ? ""
                : isNaN(parseFloat(newValue))
                ? 0
                : parseFloat(newValue),
          };
        }
        return i;
      })
    );
  };

  const removeCustomPackageItem = (item) => {
    setCustomPackageItems(
      customPackageItems.filter(
        (i) => !(i.id === item.id && i.size === item.size)
      )
    );
  };

  const clearCart = () => {
    if (customPackageItems.length === 0) return;
    if (window.confirm("Are you sure you want to remove all items from your quotation?")) {
      setCustomPackageItems([]);
      setToastData({
        type: 'info',
        title: 'Quotation Cleared',
        message: 'All items removed from your quotation',
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION);
    }
  };

  const subTotal = customPackageItems.reduce(
    (acc, item) => acc + (parseFloat(item.price) || 0) * item.quantity,
    0
  );
  const discountValue = Number(discount) || 0;
  const totalAfterDiscount = Math.max(subTotal - discountValue, 0);
  const advanceValue = Math.min(Number(advance) || 0, totalAfterDiscount);
  const balanceDue = Math.max(totalAfterDiscount - advanceValue, 0);

  const loadCompressedImage = (url, maxWidth = 600) =>
    new Promise((resolve) => {
      const img = new Image();
      if (!url.startsWith("data:")) {
        img.crossOrigin = "Anonymous";
      }
      img.src = url;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/png", 0.9);
        resolve(dataURL);
      };
      img.onerror = () => resolve(null);
    });

  const loadSquareImage = (url, side = 320) =>
    new Promise((resolve) => {
      const img = new Image();
      if (!url.startsWith("data:")) {
        img.crossOrigin = "Anonymous";
      }
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = side;
        canvas.height = side;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, side, side);
        const scale = Math.max(side / img.width, side / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const offsetX = (side - drawWidth) / 2;
        const offsetY = (side - drawHeight) / 2;
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        resolve(canvas.toDataURL("image/png", 0.9));
      };
      img.onerror = () => resolve(null);
    });

  const loadProductImage = async (src) => {
    const safeSrc = src || makePlaceholderImage("Item");
    const key = safeSrc.startsWith("data:")
      ? `data-${safeSrc.length}-${safeSrc.slice(0, 40)}`
      : `${safeSrc}-square`;
    if (imageCacheRef.current[key]) {
      return imageCacheRef.current[key];
    }
    const processed = await loadSquareImage(safeSrc, 320);
    if (processed) {
      imageCacheRef.current[key] = processed;
    }
    return processed;
  };

  const loadImageAsBase64 = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const pageWidth = 210;
        const pageHeight = 297;
        canvas.width = pageWidth * 4;
        canvas.height = pageHeight * 4;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
    });

  const generateReport = async () => {
    if (customPackageItems.length === 0) {
      alert("No items selected!");
      return;
    }

    const generatedAt = new Date();
    const safePdfName = (pdfName || "").trim() || `quotation-${generatedAt.getTime()}`;

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    doc.setFont("helvetica", "normal");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const applyOpacity = (value) => {
      if (
        typeof doc.setGState === "function" &&
        typeof doc.GState === "function"
      ) {
        try {
          doc.setGState(new doc.GState({ opacity: value }));
        } catch {
          // ignore if GState is unavailable
        }
      }
    };

    const [bgImg, logoImg] = await Promise.all([
      loadImageAsBase64("/assets/invoice-bg.png"),
      loadImageAsBase64("/assets/SouthLankaFireworks.png"),
    ]);

    const [regIcon, personIcon, addressIcon, phoneIcon, emailIcon, webIcon] =
      await Promise.all([
        loadCompressedImage("/assets/icon-reg.png"),
        loadCompressedImage("/assets/icon-person.png"),
        loadCompressedImage("/assets/icon-address.png"),
        loadCompressedImage("/assets/icon-phone.png"),
        loadCompressedImage("/assets/icon-email.png"),
        loadCompressedImage("/assets/icon-web.png"),
      ]);

    const productImages = includeGallery
      ? await Promise.all(
          customPackageItems.map(async (item) => {
            const primary = await loadProductImage(getItemImageSource(item));
            if (primary) return primary;
            return loadProductImage(makePlaceholderImage(item.name || "Item"));
          })
        )
      : [];

    if (bgImg) doc.addImage(bgImg, "PNG", 0, 0, pageWidth, pageHeight);
    doc.setFillColor(0, 47, 108);
    doc.rect(0, 0, pageWidth, 25, "F");
    if (logoImg) doc.addImage(logoImg, "PNG", 10, 3, 25, 20);

    doc.setFontSize(30);
    doc.setFont("helvetica", "thin");
    doc.setTextColor(255, 255, 255);
    doc.text("South Lanka Fireworks", pageWidth / 2, 16, { align: "center" });
    doc.setFontSize(14);
    doc.text("INVOICE", pageWidth - 15, 15, { align: "right" });

    let y = 32;
    const iconSize = 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);

    if (regIcon)
      doc.addImage(regIcon, "PNG", pageWidth - 72, y - 3, iconSize, iconSize);
    doc.text("Reg.No : SG/5276", pageWidth - 66, y);
    y += 5;

    if (personIcon)
      doc.addImage(
        personIcon,
        "PNG",
        pageWidth - 72,
        y - 3,
        iconSize,
        iconSize
      );
    doc.text("J.W. Chaminda Thushara.", pageWidth - 66, y);
    y += 5;

    if (addressIcon)
      doc.addImage(
        addressIcon,
        "PNG",
        pageWidth - 72,
        y - 3,
        iconSize,
        iconSize
      );
    doc.text("07 Dadalla Cross Road,", pageWidth - 66, y);
    y += 5;
    doc.text("Dadalla, Galle.", pageWidth - 66, y);
    y += 5;

    if (phoneIcon)
      doc.addImage(phoneIcon, "PNG", pageWidth - 72, y - 3, iconSize, iconSize);
    doc.text("077 713 5516 / 091 224 6572", pageWidth - 66, y);
    y += 5;

    if (emailIcon)
      doc.addImage(emailIcon, "PNG", pageWidth - 72, y - 3, iconSize, iconSize);
    doc.text("southlankafireworks@gmail.com", pageWidth - 66, y);
    y += 5;

    if (webIcon)
      doc.addImage(webIcon, "PNG", pageWidth - 72, y - 3, iconSize, iconSize);
    doc.text("www.slfireworks.com", pageWidth - 66, y);

    y = 36;
    doc.setFontSize(12);
    doc.text("Invoice to :", 14, y);
    const text = invoiceTo;
    const x = 35;
    doc.text(text, x, y);
    const textWidth = doc.getTextWidth(text);
    doc.setLineWidth(0.2);
    doc.line(x, y + 1, x + textWidth, y + 1);
    y += 7;
    const todayFormatted = formatDateDDMMYYYY(invoiceDate);
    doc.text("Date :", 14, y);
    doc.text(todayFormatted, 27, y);

    if (includeEventDate && eventDate) {
      const formattedEventDate = formatDateDDMMYYYY(eventDate);
      doc.text(`Event Date: ${formattedEventDate}`, 14, y + 7);
      y += 7;
    }

    if (includeBankDetails) {
      const bankHeadingY = y + 7;
      const bankDetailLines = BANK_DETAILS.map(
        ({ label, value }) => `${label} : ${value}`
      );
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Bank Details", 14, bankHeadingY);
      doc.setFont("helvetica", "normal");
      const detailSpacing = 5;
      bankDetailLines.forEach((line, index) => {
        doc.text(line, 14, bankHeadingY + (index + 1) * detailSpacing);
      });
      y = bankHeadingY + (bankDetailLines.length + 1) * detailSpacing;
      y += 8;
    } else {
      y += 24;
    }
    doc.setFillColor(0, 153, 102);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, pageWidth - 28, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("No", 18, y + 6);
    doc.text("Item Description", 40, y + 6);
    doc.text("Qty", 110, y + 6);
    doc.text("Price", 140, y + 6);
    doc.text("Total", 175, y + 6);

    y += 15;
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const rowHeight = 8;
    customPackageItems.forEach((item, index) => {
      const total = (parseFloat(item.price) || 0) * item.quantity;
      const isDarkRow = index % 2 === 0;
      if (isDarkRow) {
        applyOpacity(0.45);
        doc.setFillColor(230, 230, 230);
      } else {
        applyOpacity(0.25);
        doc.setFillColor(248, 248, 248);
      }
      doc.rect(14, y - 5, pageWidth - 28, rowHeight, "F");
      applyOpacity(1);
      doc.setTextColor(0);

      doc.text(String(index + 1).padStart(2, "0"), 18, y);
      doc.text(item.name + (item.size ? ` (${item.size})` : ""), 30, y);
      doc.text(String(item.quantity), 112, y, { align: "center" });
      doc.text(
        `Rs. ${(parseFloat(item.price) || 0).toLocaleString()}`,
        155,
        y,
        {
          align: "right",
        }
      );
      doc.text(`Rs. ${total.toLocaleString()}`, 190, y, { align: "right" });
      y += rowHeight;
    });

    y += 5;
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFillColor(212, 212, 212);
    doc.rect(pageWidth - 80, y - 6, 65, 10, "F");
    doc.text(`Sub Total: Rs. ${subTotal.toLocaleString()}`, pageWidth - 20, y, {
      align: "right",
    });
    y += 8;
    doc.setFillColor(212, 212, 212);
    doc.rect(pageWidth - 80, y - 6, 65, 10, "F");
    doc.text(
      `Discount: Rs. ${discountValue.toLocaleString()}`,
      pageWidth - 20,
      y,
      {
        align: "right",
      }
    );
    y += 8;
    if (advanceValue > 0) {
      doc.setFillColor(212, 212, 212);
      doc.rect(pageWidth - 80, y - 6, 65, 10, "F");
      doc.text(
        `Advance: Rs. ${advanceValue.toLocaleString()}`,
        pageWidth - 20,
        y,
        {
          align: "right",
        }
      );
      y += 8;
    }
    doc.setFillColor(255, 204, 0);
    doc.rect(pageWidth - 80, y - 6, 65, 10, "F");
    doc.setTextColor(0);
    doc.text(
      `${advanceValue > 0 ? "Balance Due" : "Total Amount"}: Rs. ${(
        advanceValue > 0 ? balanceDue : totalAfterDiscount
      ).toLocaleString()}`,
      pageWidth - 20,
      y,
      {
        align: "right",
      }
    );

    drawFooter(doc, pageWidth, pageHeight);

    if (includeGallery && productImages.length > 0) {
      const columns = 3;
      const horizontalGap = 8;
      const verticalGap = 12;
      const startX = 14;
      const topOffset = 30;
      const footerReserve = 32;
      const cardWidth =
        (pageWidth - startX * 2 - horizontalGap * (columns - 1)) / columns;
      const imageSize = cardWidth - 10;
      const cardHeight = imageSize + 18;
      const rowsPerPage = Math.max(
        1,
        Math.floor(
          (pageHeight - topOffset - footerReserve + verticalGap) /
            (cardHeight + verticalGap)
        )
      );
      const cardsPerPage = columns * rowsPerPage;

      for (
        let offset = 0;
        offset < customPackageItems.length;
        offset += cardsPerPage
      ) {
        doc.addPage();
        const galleryWidth = doc.internal.pageSize.getWidth();
        const galleryHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(6, 54, 111);
        doc.text("Item Gallery", galleryWidth / 2, 20, {
          align: "center",
        });

        const subset = customPackageItems.slice(offset, offset + cardsPerPage);
        subset.forEach((item, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;
          const cardX = startX + col * (cardWidth + horizontalGap);
          const cardY = topOffset + row * (cardHeight + verticalGap);

          doc.setDrawColor(226, 232, 240);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, "FD");

          const img = productImages[offset + index];
          if (img) {
            doc.addImage(
              img,
              "PNG",
              cardX + 5,
              cardY + 5,
              imageSize,
              imageSize
            );
          }

          const maxChars = 26;
          const nameText = (item.name || "Item").length > maxChars
            ? `${(item.name || "Item").slice(0, maxChars - 3)}...`
            : item.name || "Item";
          doc.setFontSize(10);
          doc.setTextColor(33, 37, 41);
          doc.text(nameText, cardX + 4, cardY + imageSize + 15);
        });

        drawFooter(doc, galleryWidth, galleryHeight);
      }
    }

    const compactItems = customPackageItems.map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      price: parseFloat(item.price) || 0,
      image: item.image || null,
    }));

    const historyEntry = {
      id: `quote-${generatedAt.getTime()}`,
      savedAt: generatedAt.toISOString(),
      pdfName: safePdfName,
      invoiceTo: invoiceTo || "Unnamed client",
      invoiceDate: todayFormatted,
      eventDate: eventDate || "",
      includeGallery,
      includeBankDetails,
      inputs: {
        pdfName,
        invoiceTo,
        invoiceDate,
        eventDate,
        discount,
        advance,
        includeBankDetails,
      },
      totals: {
        subTotal,
        discount: discountValue,
        advance: advanceValue,
        totalAfterDiscount,
        balanceDue,
      },
      lineItems: compactItems,
      itemsCount: compactItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    };

    setQuoteHistory((prev) => {
      const next = [historyEntry, ...prev];
      return next.slice(0, HISTORY_LIMIT);
    });

    doc.save(`${safePdfName}.pdf`);
  };

  return (
    <>
      <Helmet>
        <title>
          {activeStudio === "letterhead"
            ? "South Lanka Fireworks - Company Letterhead Generator"
            : "South Lanka Fireworks - Invoice Generator"}
        </title>
      </Helmet>

      {/* Luxury Sticky Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          navScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white/70 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Brand Logo */}
            <button onClick={scrollToTop} className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                <Sparkles size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="leading-tight text-left">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block">
                  South Lanka
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 block">
                  Fireworks Studio
                </span>
              </div>
            </button>

            {/* Primary Studio Mode Switcher (Quotation | Letterhead) */}
            <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => switchStudio("quotation")}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeStudio === "quotation"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText size={14} />
                <span>Quotation</span>
              </button>
              <button
                type="button"
                onClick={() => switchStudio("letterhead")}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeStudio === "letterhead"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-indigo-700"
                }`}
              >
                <FileSignature size={14} />
                <span>Letterhead</span>
              </button>
            </div>

            {/* Nav Links + Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {activeStudio === "quotation" && (
                <>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition active:scale-95 border border-indigo-100"
                  >
                    <Plus size={14} />
                    <span className="hidden md:inline">Add Custom Item</span>
                    <span className="md:hidden">Custom</span>
                  </button>

                  <a
                    href="#products"
                    className="hidden lg:inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Package size={15} />
                    Catalog
                  </a>

                  <a
                    href="#custom-package"
                    className="hidden lg:inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <FileText size={15} />
                    Quote
                  </a>

                  {cartCount > 0 && (
                    <button
                      onClick={() =>
                        document
                          .getElementById("custom-package")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white pl-2.5 pr-3 sm:pl-3 sm:pr-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 animate-pulse-glow"
                    >
                      <ShoppingCart size={15} className="text-white" />
                      <span className="font-extrabold">{cartCount}</span>
                      <span className="hidden xl:inline text-indigo-100 font-normal">| Rs. {subTotal.toLocaleString()}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        data={toastData}
        onClose={() => setShowToast(false)}
      />

      <AddCustomItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddItem={handleAddCustomItem}
      />

      {/* Sticky Mobile Floating Cart Bar */}
      {activeStudio === "quotation" && cartCount > 0 && (
        <div className="md:hidden fixed bottom-3.5 left-3 right-3 z-40 animate-slide-in">
          <div className="bg-slate-950/95 backdrop-blur-xl text-white rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/15 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[11px] text-slate-400 font-medium truncate leading-tight">
                  {cartCount} item{cartCount !== 1 ? 's' : ''} in quotation
                </p>
                <p className="text-sm font-black text-amber-400 truncate">
                  Rs. {subTotal.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                document
                  .getElementById("custom-package")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md shrink-0 flex items-center gap-1 active:scale-95 transition whitespace-nowrap"
            >
              <span>View Quote</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {activeStudio === "letterhead" ? (
        <LetterheadGenerator onNotify={showNotification} />
      ) : (
        <>
          <section
            className="min-h-screen pt-16 sm:pt-20 pb-6 px-3 sm:px-4 md:px-8 lg:px-10"
            id="products"
            style={{
              background: "linear-gradient(180deg, #f0f4ff 0%, #ffffff 18%, #ffffff 60%, #f8fafc 85%, #f1f5f9 100%)"
            }}
          >
        {/* Hero Header */}
        <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-12 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 text-indigo-800 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 border border-indigo-100 shadow-sm">
            <Zap size={14} className="text-amber-500" />
            <span>Sri Lanka's Premier Pyrotechnics • Invoice Studio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight leading-[1.15]">
            Create Your Bespoke
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Fireworks Quotation</span>
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-6 leading-relaxed px-2">
            Select items, adjust quantities, add bespoke fireworks with photos from your device, and generate professional PDF invoices in seconds.
          </p>

          {/* Search Bar */}
          <div className="max-w-md sm:max-w-lg mx-auto mb-5 px-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-25 blur transition duration-300" />
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search fireworks catalog..."
                  className="w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                  >
                    <X size={12} className="text-slate-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-6 px-2 scrollbar-none">
            {[
              { id: "all", label: "All Items", icon: "✨" },
              { id: "shells", label: "Aerial Shells", icon: "🎆" },
              { id: "cakes", label: "Cakes & Displays", icon: "🎇" },
              { id: "custom", label: "Custom Bespoke", icon: "💎" },
            ].map((tab) => {
              const count = categoryCounts[tab.id];
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 shadow-xs"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 px-2">
            <div className="flex items-center gap-2 sm:gap-2.5 bg-white rounded-xl px-3 sm:px-4 py-2 shadow-xs border border-slate-100 hover:border-indigo-200 transition-all">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-xs">
                <Package size={14} className="text-white" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">Catalog</span>
                <span className="block text-xs sm:text-sm font-bold text-slate-800 tabular-nums">{products.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 bg-white rounded-xl px-3 sm:px-4 py-2 shadow-xs border border-slate-100 hover:border-pink-200 transition-all">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-xs">
                <ShoppingCart size={14} className="text-white" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">In Cart</span>
                <span className="block text-xs sm:text-sm font-bold text-slate-800 tabular-nums">{cartCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 bg-white rounded-xl px-3 sm:px-4 py-2 shadow-xs border border-slate-100 hover:border-emerald-200 transition-all">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xs">
                <FileText size={14} className="text-white" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">Saved Quotes</span>
                <span className="block text-xs sm:text-sm font-bold text-slate-800 tabular-nums">{quoteHistory.length}</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl px-3 sm:px-4 py-2 shadow-xs font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>Add Custom Entry</span>
            </button>

            <button
              onClick={() => switchStudio("letterhead")}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-3 sm:px-4 py-2 shadow-xs font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              <FileSignature size={14} />
              <span>Create Letterhead</span>
            </button>
          </div>
        </div>

        <ProductGrid
          products={displayProducts}
          productVariants={productVariants}
          onAddToCart={addToCustomPackage}
          onAddCustomItem={() => setShowAddModal(true)}
          onDeleteCustomProduct={handleDeleteCustomProduct}
        />

        <CustomPackageEditor
          items={customPackageItems}
          onNameChange={updateCustomPackageName}
          onSizeChange={updateCustomPackageSize}
          onPriceChange={updateCustomPackagePrice}
          onQtyChange={updateCustomPackageQty}
          onRemoveItem={removeFromCustomPackage}
          onClearCart={handleClearCart}
          pdfName={pdfName}
          onPdfNameChange={setPdfName}
          invoiceTo={invoiceTo}
          onInvoiceToChange={setInvoiceTo}
          invoiceDate={invoiceDate}
          onInvoiceDateChange={setInvoiceDate}
          eventDate={eventDate}
          onEventDateChange={setEventDate}
          includeEventDate={includeEventDate}
          onIncludeEventDateChange={setIncludeEventDate}
          includeBankDetails={includeBankDetails}
          onIncludeBankDetailsChange={setIncludeBankDetails}
          bankDetails={BANK_DETAILS}
          includeGallery={includeGallery}
          onIncludeGalleryChange={setIncludeGallery}
          discount={discount}
          onDiscountChange={setDiscount}
          advance={advance}
          onAdvanceChange={setAdvance}
          subTotal={subTotal}
          totalAfterDiscount={totalAfterDiscount}
          balanceDue={balanceDue}
          onGenerateReport={generateReport}
        />
      </section>

          <QuoteHistory
            quoteHistory={quoteHistory}
            filteredHistory={filteredHistory}
            historySearch={historySearch}
            onHistorySearchChange={setHistorySearch}
            onClearHistory={handleClearHistory}
            onLoadQuote={handleLoadQuote}
            onDeleteQuote={handleDeleteQuote}
            formatDateDDMMYYYY={formatDateDDMMYYYY}
            formatDateTimeReadable={formatDateTimeReadable}
          />
        </>
      )}

      {/* Professional Footer */}
      <footer className="bg-gray-950 text-white mt-auto relative overflow-hidden">
        {/* Decorative gradient line */}
        <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">South Lanka Fireworks</h3>
                  <p className="text-gray-500 text-xs tracking-wide">Spectacular displays since day one</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Sri Lanka's premier fireworks company. Breathtaking displays for weddings, festivals, and corporate events.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-[0.2em] mb-5">Get in Touch</h4>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 group-hover:border-indigo-600 flex items-center justify-center transition-colors">
                    <Phone size={14} className="text-indigo-400" />
                  </div>
                  <span>077 713 5516 / 091 224 6572</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 group-hover:border-indigo-600 flex items-center justify-center transition-colors">
                    <Mail size={14} className="text-indigo-400" />
                  </div>
                  <span>southlankafireworks@gmail.com</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 group-hover:border-indigo-600 flex items-center justify-center transition-colors shrink-0 mt-0.5">
                    <MapPin size={14} className="text-indigo-400" />
                  </div>
                  <span>07 Dadalla Cross Road, Dadalla, Galle</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 group-hover:border-indigo-600 flex items-center justify-center transition-colors">
                    <Globe size={14} className="text-indigo-400" />
                  </div>
                  <span>www.slfireworks.com</span>
                </li>
              </ul>
            </div>

            {/* Bank Details */}
            <div>
              <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-[0.2em] mb-5">Bank Details</h4>
              <div className="bg-gray-900 rounded-xl p-4 space-y-2.5 border border-gray-800">
                {BANK_DETAILS.map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-300 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} South Lanka Fireworks. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">Reg No: SG/5276</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <Motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className={`fixed ${
              cartCount > 0 ? "bottom-[86px] md:bottom-6" : "bottom-6"
            } right-4 sm:right-6 z-50 w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl ring-4 ring-white/20 flex items-center justify-center transition-all active:scale-95`}
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} className="text-white" />
          </Motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Products;
