import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import items from "./Items";
import jsPDF from "jspdf";
import { ShoppingCart, Check, X, Search, ArrowUp, Sparkles, Phone, Mail, MapPin, Globe, Zap, FileText, Package } from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import AddCustomItemModal from "./AddCustomItemModal";
import ProductGrid from "./ProductGrid";
import CustomPackageEditor from "./CustomPackageEditor";
import QuoteHistory from "./QuoteHistory";

const productVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const HISTORY_STORAGE_KEY = "slf-quotation-history";
const HISTORY_LIMIT = 1000;
const TOAST_DURATION = 3000;
const BANK_DETAILS = [
  { label: "Acc No", value: "8011371317" },
  { label: "Bank Name", value: "Commercial Bank" },
  { label: "Branch", value: "Galle" },
  { label: "Acc Holder Name", value: "J.W.C.Thushara" },
];

// Professional Toast Component
const Toast = ({ show, data, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!show) {
      setProgress(100);
      return;
    }
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newVal = prev - (100 / (TOAST_DURATION / 50));
        return newVal <= 0 ? 0 : newVal;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [show]);

  if (!data) return null;

  const isSuccess = data.type !== 'error';

  return (
    <AnimatePresence>
      {show && (
        <Motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-[9999] w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[340px] sm:max-w-[420px]"
        >
          <div className={`relative overflow-hidden rounded-xl shadow-2xl border ${
            isSuccess 
              ? 'bg-white border-green-200' 
              : 'bg-white border-red-200'
          }`}>
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <Motion.div 
                className={`h-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
            
            <div className="p-4 pt-5">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isSuccess 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {isSuccess ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${
                    isSuccess ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {data.title || (isSuccess ? 'Added to Cart!' : 'Error')}
                  </p>
                  {data.message && (
                    <p className="text-gray-600 text-sm mt-0.5 line-clamp-2">
                      {data.message}
                    </p>
                  )}
                  {data.itemName && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
                      {data.itemImage && (
                        <img 
                          src={data.itemImage} 
                          alt="" 
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 leading-tight">
                          {data.itemName}
                        </p>
                        {data.itemSize && (
                          <p className="text-xs text-gray-500 mt-0.5">{data.itemSize}</p>
                        )}
                      </div>
                      {data.itemPrice && (
                        <span className="ml-auto text-xs font-semibold text-pink-600 whitespace-nowrap">
                          Rs.{data.itemPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              {/* Cart count badge */}
              {data.cartCount !== undefined && data.cartCount > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Items in cart</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {data.cartCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

const Products = () => {
  const [customPackageItems, setCustomPackageItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [discount, setDiscount] = useState("");
  const [advance, setAdvance] = useState("");
  const [invoiceTo, setInvoiceTo] = useState("");
  const todayISO = new Date().toISOString().slice(0, 10);
  const [eventDate, setEventDate] = useState(todayISO);
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
  const imageCacheRef = useRef({});

  const cartCount = customPackageItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const [products, setProducts] = useState(items);

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

  // Filter products by search term
  const displayProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const term = productSearch.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
    );
  }, [products, productSearch]);

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

  const handleAddCustomItem = ({ name, size, price, qty }) => {
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
    const newItem = {
      id,
      name: trimmedName,
      size: cleanedSize,
      price: numericPrice,
      quantity: numericQty,
      image: placeholderImage,
    };
    setCustomPackageItems((prev) => [...prev, newItem]);

    try {
      const productItem = {
        id,
        name: trimmedName,
        image: placeholderImage,
        sizes: [{ size: cleanedSize || "Custom", price: numericPrice }],
      };
      setProducts((prev) => [productItem, ...prev]);
    } catch {
      // ignore preview grid injection errors
    }

    setToastData({
      type: 'success',
      title: 'Custom Item Added!',
      itemName: trimmedName,
      itemSize: cleanedSize || 'Custom',
      itemPrice: numericPrice,
      itemImage: placeholderImage,
      cartCount: cartCount + numericQty,
    });
    setShowToast(true);
    setShowAddModal(false);
    setTimeout(() => setShowToast(false), TOAST_DURATION);
    return true;
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

  const subTotal = customPackageItems.reduce(
    (sum, i) => sum + (parseFloat(i.price) || 0) * i.quantity,
    0
  );
  const discountValue = Number(discount) || 0;
  const totalAfterDiscount = Math.max(subTotal - discountValue, 0);
  const advanceValue = Math.min(Number(advance) || 0, totalAfterDiscount);
  const balanceDue = Math.max(totalAfterDiscount - advanceValue, 0);

  const loadCompressedImage = (url, maxWidth = 600) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
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
      img.crossOrigin = "Anonymous";
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
    const key = `${safeSrc}-square`;
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
    const todayFormatted = formatDateDDMMYYYY(generatedAt);
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
        <title>South Lanka Fireworks - Invoice Generator</title>
      </Helmet>

      {/* Professional Sticky Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          navScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white/50 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand */}
            <button onClick={scrollToTop} className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Sparkles size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-sm sm:text-base tracking-tight text-gray-900">
                  South Lanka
                </span>
                <span className="hidden sm:block text-[10px] font-semibold tracking-widest uppercase text-indigo-600">
                  Fireworks
                </span>
              </div>
            </button>

            {/* Nav Links + Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="#products" className="hidden md:inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                <Package size={14} />
                Products
              </a>
              <a href="#custom-package" className="hidden md:inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                <FileText size={14} />
                Quotation
              </a>
              {cartCount > 0 && (
                <button
                  onClick={() =>
                    document
                      .getElementById("custom-package")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="relative flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white pl-3 pr-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-md hover:shadow-lg animate-pulse-glow"
                >
                  <ShoppingCart size={15} className="text-white" />
                  <span className="text-white font-bold">{cartCount}</span>
                </button>
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

      <section
        className="min-h-screen pt-16 sm:pt-20 pb-6 px-3 sm:px-4 md:px-8 lg:px-10"
        id="products"
        style={{
          background: "linear-gradient(180deg, #eef2ff 0%, #ffffff 20%, #ffffff 60%, #f8fafc 80%, #f1f5f9 100%)"
        }}
      >
        {/* Hero Header */}
        <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-12 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-5 border border-indigo-100/80 shadow-sm">
            <Zap size={14} className="text-indigo-500" />
            <span>Professional Invoice Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-[1.1]">
            Create Your Perfect
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Fireworks Quotation</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Browse our collection, select quantities, and generate professional PDF invoices in seconds.
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition duration-300" />
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search fireworks by name..."
                  className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                  >
                    <X size={12} className="text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            {productSearch && (
              <p className="text-xs text-gray-400 mt-2">
                {displayProducts.length} of {products.length} products
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Package size={14} className="text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs text-gray-400 font-medium leading-tight">Products</span>
                <span className="block text-sm font-bold text-gray-800 tabular-nums">{products.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-sm">
                <ShoppingCart size={14} className="text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs text-gray-400 font-medium leading-tight">In Cart</span>
                <span className="block text-sm font-bold text-gray-800 tabular-nums">{cartCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <FileText size={14} className="text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs text-gray-400 font-medium leading-tight">Saved</span>
                <span className="block text-sm font-bold text-gray-800 tabular-nums">{quoteHistory.length}</span>
              </div>
            </div>
          </div>
        </div>

        <ProductGrid
          products={displayProducts}
          productVariants={productVariants}
          onAddToCart={addToCustomPackage}
          onAddCustomItem={() => setShowAddModal(true)}
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
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl ring-4 ring-white/20 flex items-center justify-center transition-all"
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
