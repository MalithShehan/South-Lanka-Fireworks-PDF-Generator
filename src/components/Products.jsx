import React, { useState, useEffect, useRef, useMemo } from "react";
import items from "./Items";
import jsPDF from "jspdf";
import { ShoppingCart, Check, X } from "lucide-react";
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
          className="fixed top-4 right-4 z-[9999] w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[320px] sm:max-w-[400px]"
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
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {data.itemName}
                        </p>
                        {data.itemSize && (
                          <p className="text-xs text-gray-500">{data.itemSize}</p>
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
      <section
        className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50 py-6 sm:py-10 px-3 sm:px-4 md:px-10"
        id="products"
      >
        <Helmet>
          <title>South Lanka Fireworks - Products</title>
        </Helmet>

        {cartCount > 0 && (
          <Motion.div
            className="fixed top-4 sm:top-20 right-3 sm:right-5 z-50 flex items-center gap-2 bg-white/95 shadow-lg backdrop-blur-md px-3 sm:px-4 py-2 rounded-full cursor-pointer hover:scale-105 transition border border-indigo-100"
            onClick={() =>
              document
                .getElementById("custom-package")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingCart size={18} className="text-indigo-600" />
            <span className="font-semibold text-indigo-700 text-sm sm:text-base">
              {cartCount}
            </span>
          </Motion.div>
        )}

        {/* Professional Toast Notification */}
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

        {/* Hero Header */}
        <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-pink-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <span>🎆</span>
            <span>South Lanka Fireworks Invoice Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
            Create Your Perfect Quotation
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Browse our fireworks, select quantities, and generate professional PDF invoices in seconds.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-bold">{products.length}</span>
              </div>
              <span className="text-gray-600">Products</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 font-bold">{cartCount}</span>
              </div>
              <span className="text-gray-600">In Cart</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">{quoteHistory.length}</span>
              </div>
              <span className="text-gray-600">Saved</span>
            </div>
          </div>
        </div>

        <ProductGrid
          products={products}
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
      
      {/* Footer spacing */}
      <div className="h-8 sm:h-12" aria-hidden="true" />
    </>
  );
};

export default Products;
