import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FileText,
  Download,
  Eye,
  Sparkles,
  Calendar,
  Hash,
  User,
  AlignLeft,
  AlignJustify,
  Bold,
  List,
  ListOrdered,
  Heading,
  Trash2,
  RotateCcw,
  Check,
  UploadCloud,
  History,
  Search,
  RefreshCcw,
  Printer,
  PenTool,
  Landmark,
  Droplets,
  Type,
  FileSignature,
} from "lucide-react";
import {
  BANK_DETAILS,
  COMPANY_INFO,
  formatDateDDMMYYYY,
  formatDateLong,
} from "../utils/companyInfo";
import {
  generateLetterheadPdf,
  parseBodyBlocks,
  parseInlineSegments,
} from "../utils/letterheadPdf";

const LETTER_HISTORY_KEY = "slf-letterhead-history-v1";
const SIGNATURE_STORAGE_KEY = "slf-letterhead-signature-v1";
const A4_WIDTH_PX = 794; // 210mm @ 96dpi
const A4_HEIGHT_PX = 1123; // 297mm @ 96dpi

const renderInlineBold = (text) => {
  const segments = parseInlineSegments(text);
  return segments.map((seg, idx) =>
    seg.bold ? (
      <strong key={idx} className="font-bold text-slate-950">
        {seg.text}
      </strong>
    ) : (
      <React.Fragment key={idx}>{seg.text}</React.Fragment>
    )
  );
};

// Exact A4 scaled real-time preview matching the jsPDF output
const LetterheadPaperPreview = ({
  letterDate,
  dateFormat,
  refNumber,
  headerBadge,
  recipient,
  subject,
  salutation,
  body,
  closing,
  signatoryName,
  signatoryTitle,
  signatureImage,
  includeWatermark,
  includeSignature,
  includeBankDetails,
  fontFamily,
  fontSize,
  textAlign,
}) => {
  const wrapperRef = useRef(null);
  const contentMeasureRef = useRef(null);
  const [scale, setScale] = useState(0.65);
  const [estimatedPages, setEstimatedPages] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateScale = () => {
      const availableWidth = el.clientWidth;
      if (availableWidth > 0) {
        setScale(Math.min(1, availableWidth / A4_WIDTH_PX));
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const blocks = useMemo(() => parseBodyBlocks(body), [body]);
  const formattedDate = letterDate
    ? dateFormat === "short"
      ? formatDateDDMMYYYY(letterDate)
      : formatDateLong(letterDate)
    : "";

  const recipientLines = useMemo(
    () =>
      (recipient || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [recipient]
  );

  const closingLines = useMemo(
    () =>
      (closing || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [closing]
  );

  const hasManualSignatureContent =
    includeSignature &&
    (closingLines.length > 0 ||
      Boolean((signatoryName || "").trim()) ||
      Boolean((signatoryTitle || "").trim()) ||
      Boolean(signatureImage));

  // Measure content height to show multi-page indicator in preview
  useEffect(() => {
    if (!contentMeasureRef.current) return;
    const contentHeight = contentMeasureRef.current.scrollHeight;
    if (contentHeight <= 740) {
      setEstimatedPages(1);
    } else {
      const extraPages = Math.ceil((contentHeight - 740) / 880);
      setEstimatedPages(1 + extraPages);
    }
  }, [
    recipient,
    subject,
    salutation,
    body,
    closing,
    signatoryName,
    signatoryTitle,
    includeBankDetails,
    includeSignature,
    signatureImage,
    fontSize,
    fontFamily,
  ]);

  const previewFontCss =
    fontFamily === "times"
      ? "'Times New Roman', Georgia, Times, serif"
      : "Helvetica, Arial, 'Plus Jakarta Sans', sans-serif";

  const bodyFontSizePx = fontSize * 1.333;

  return (
    <div className="flex flex-col">
      {/* Preview Status Strip */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Preview
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            A4 Portrait (210 × 297 mm)
          </span>
        </div>
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            estimatedPages > 1
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {estimatedPages === 1
            ? "1 Page"
            : `${estimatedPages} Pages (Auto-Paginated)`}
        </span>
      </div>

      {/* Responsive Scaled A4 Sheet Container */}
      <div
        ref={wrapperRef}
        className="w-full flex justify-center overflow-hidden rounded-2xl bg-slate-200/70 p-2 sm:p-4 border border-slate-300/70 shadow-inner"
      >
        <div
          style={{
            width: `${A4_WIDTH_PX * scale}px`,
            height: `${A4_HEIGHT_PX * scale}px`,
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              fontFamily: previewFontCss,
            }}
            className="bg-white shadow-2xl relative overflow-hidden flex flex-col select-none border border-slate-200"
          >
            {/* Watermark Background Image (matches Quotation PDF) */}
            {includeWatermark && (
              <img
                src={COMPANY_INFO.assets.bg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />
            )}

            {/* Top Navy Banner (25mm ≈ 94.5px) */}
            <div
              className="relative z-10 w-full shrink-0"
              style={{ height: "94.5px", backgroundColor: COMPANY_INFO.colors.navyHex }}
            >
              {/* Logo on Top Left */}
              <img
                src={COMPANY_INFO.assets.logo}
                alt={COMPANY_INFO.name}
                className="absolute object-contain"
                style={{ left: "38px", top: "9px", height: "76px", maxWidth: "95px" }}
              />

              {/* Centered Brand Name */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-28">
                <div
                  className="text-white font-bold tracking-tight leading-none"
                  style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: "34px",
                  }}
                >
                  {COMPANY_INFO.name}
                </div>
                <div
                  className="uppercase tracking-[0.14em] mt-1.5"
                  style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: "10.5px",
                    color: "#D7E4F8",
                  }}
                >
                  Sri Lanka&apos;s Premier Pyrotechnics &amp; Fireworks Displays
                </div>
              </div>

              {/* Optional Right Header Label (only shown if manually entered) */}
              {headerBadge && headerBadge.trim() && (
                <div
                  className="absolute right-[44px] top-1/2 -translate-y-1/2 font-bold uppercase tracking-wider text-right"
                  style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: "12.5px",
                    color: "#FFD24D",
                  }}
                >
                  {headerBadge.trim()}
                </div>
              )}
            </div>

            {/* Thin Gold Accent Strip under Navy Banner */}
            <div
              className="relative z-10 w-full shrink-0"
              style={{ height: "4.5px", backgroundColor: COMPANY_INFO.colors.goldHex }}
            />

            {/* Header Metadata & Right Company Contact Block */}
            <div
              className="relative z-10 flex items-start justify-between shrink-0"
              style={{ padding: "20px 60px 10px 60px" }}
            >
              {/* Left: Date & Reference Number (only shown when manually entered) */}
              <div className="pt-2 space-y-2" style={{ fontSize: "14px" }}>
                {formattedDate && (
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-bold"
                      style={{ color: COMPANY_INFO.colors.navyHex }}
                    >
                      Date :
                    </span>
                    <span className="text-slate-900">{formattedDate}</span>
                  </div>
                )}
                {refNumber && refNumber.trim() && (
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-bold"
                      style={{ color: COMPANY_INFO.colors.navyHex }}
                    >
                      Ref No :
                    </span>
                    <span className="text-slate-900">{refNumber.trim()}</span>
                  </div>
                )}
              </div>

              {/* Right: Exact Company Contact Block with Quotation Icons */}
              <div
                className="space-y-[3px]"
                style={{
                  width: "242px",
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontSize: "12px",
                  color: "#121C2D",
                  lineHeight: "1.42",
                }}
              >
                <div className="flex items-center gap-2">
                  <img src={COMPANY_INFO.assets.icons.reg} alt="" className="w-[14px] h-[14px] object-contain shrink-0" />
                  <span>{COMPANY_INFO.regNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={COMPANY_INFO.assets.icons.person} alt="" className="w-[14px] h-[14px] object-contain shrink-0" />
                  <span>{COMPANY_INFO.proprietor}</span>
                </div>
                <div className="flex items-start gap-2">
                  <img src={COMPANY_INFO.assets.icons.address} alt="" className="w-[14px] h-[14px] object-contain shrink-0 mt-[2px]" />
                  <div>
                    <div>{COMPANY_INFO.addressLine1}</div>
                    <div>{COMPANY_INFO.addressLine2}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <img src={COMPANY_INFO.assets.icons.phone} alt="" className="w-[14px] h-[14px] object-contain shrink-0" />
                  <span>{COMPANY_INFO.phones}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={COMPANY_INFO.assets.icons.email} alt="" className="w-[14px] h-[14px] object-contain shrink-0" />
                  <span>{COMPANY_INFO.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={COMPANY_INFO.assets.icons.web} alt="" className="w-[14px] h-[14px] object-contain shrink-0" />
                  <span>{COMPANY_INFO.website}</span>
                </div>
              </div>
            </div>

            {/* Official Navy + Gold Divider Line */}
            <div className="relative z-10 shrink-0" style={{ padding: "0 60px" }}>
              <div
                className="w-full"
                style={{ height: "2px", backgroundColor: COMPANY_INFO.colors.navyHex }}
              />
              <div
                style={{
                  width: "174px",
                  height: "1.5px",
                  marginTop: "2.5px",
                  backgroundColor: COMPANY_INFO.colors.goldHex,
                }}
              />
            </div>

            {/* Main Letter Body Content Area */}
            <div
              ref={contentMeasureRef}
              className="relative z-10 flex-1 overflow-hidden"
              style={{
                padding: "22px 60px 16px 60px",
                fontSize: `${bodyFontSizePx}px`,
                lineHeight: "1.55",
                color: "#121C2D",
              }}
            >
              <div className="space-y-3">
                {/* Recipient Block */}
                {recipientLines.length > 0 && (
                  <div className="leading-snug mb-3.5">
                    {recipientLines.map((line, i) => (
                      <div key={i} className={i === 0 ? "font-bold text-slate-950" : "text-slate-900"}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                {/* Salutation */}
                {salutation && salutation.trim() && (
                  <div className="text-slate-900">{salutation.trim()}</div>
                )}

                {/* Subject Line */}
                {subject && subject.trim() && (
                  <div className="pt-0.5 pb-1">
                    <span
                      className="font-bold inline"
                      style={{
                        color: COMPANY_INFO.colors.navyHex,
                        fontSize: `${bodyFontSizePx + 0.8}px`,
                        borderBottom: `1.5px solid ${COMPANY_INFO.colors.navyHex}`,
                        paddingBottom: "2px",
                      }}
                    >
                      {subject.trim()}
                    </span>
                  </div>
                )}

                {/* Body Paragraphs & Lists */}
                {blocks.length > 0 && (
                  <div className="space-y-2.5">
                    {blocks.map((block, idx) => {
                      if (block.type === "spacer") {
                        return <div key={idx} className="h-1.5" />;
                      }
                      if (block.type === "heading") {
                        return (
                          <div
                            key={idx}
                            className="font-bold pt-1"
                            style={{ color: COMPANY_INFO.colors.navyHex }}
                          >
                            {block.text}
                          </div>
                        );
                      }
                      if (block.type === "bullet") {
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 pl-2"
                            style={{ textAlign }}
                          >
                            <span
                              className="w-[6px] h-[6px] rounded-full shrink-0 mt-[9px]"
                              style={{ backgroundColor: COMPANY_INFO.colors.navyHex }}
                            />
                            <span className="flex-1">{renderInlineBold(block.text)}</span>
                          </div>
                        );
                      }
                      if (block.type === "numbered") {
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2 pl-1"
                            style={{ textAlign }}
                          >
                            <span
                              className="font-bold shrink-0 min-w-[22px]"
                              style={{ color: COMPANY_INFO.colors.navyHex }}
                            >
                              {block.marker}
                            </span>
                            <span className="flex-1">{renderInlineBold(block.text)}</span>
                          </div>
                        );
                      }
                      return (
                        <p
                          key={idx}
                          className="m-0 text-slate-900"
                          style={{
                            textAlign,
                            fontSize: `${bodyFontSizePx}px`,
                            lineHeight: "1.55",
                            color: "#121C2D",
                          }}
                        >
                          {renderInlineBold(block.text)}
                        </p>
                      );
                    })}
                  </div>
                )}

                {/* Optional Official Bank Details Box */}
                {includeBankDetails && (
                  <div
                    className="mt-4 rounded-lg overflow-hidden border flex"
                    style={{
                      backgroundColor: "rgba(244, 247, 252, 0.92)",
                      borderColor: "#D6DEEA",
                      fontFamily: "Helvetica, Arial, sans-serif",
                    }}
                  >
                    <div
                      className="w-[7px] shrink-0"
                      style={{ backgroundColor: COMPANY_INFO.colors.navyHex }}
                    />
                    <div className="p-3 flex-1">
                      <div
                        className="font-bold uppercase tracking-wider mb-1.5"
                        style={{ fontSize: "12px", color: COMPANY_INFO.colors.navyHex }}
                      >
                        Official Bank Details
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1" style={{ fontSize: "12px" }}>
                        {BANK_DETAILS.map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-500">{label}:</span>
                            <span className="font-bold text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Signature Block (only renders fields manually filled by the user) */}
                {hasManualSignatureContent && (
                  <div className="pt-4">
                    {closingLines.map((line, idx) => (
                      <div key={idx} className="text-slate-900">
                        {line}
                      </div>
                    ))}

                    {signatureImage ? (
                      <div className="my-2">
                        <img
                          src={signatureImage}
                          alt="Signature"
                          className="h-[54px] max-w-[170px] object-contain"
                        />
                      </div>
                    ) : (
                      ((signatoryName || "").trim() || (signatoryTitle || "").trim()) && (
                        <div className="h-[40px]" />
                      )
                    )}

                    {((signatoryName || "").trim() ||
                      (signatoryTitle || "").trim() ||
                      signatureImage) && (
                      <div
                        className="w-[210px] mb-1.5"
                        style={{ height: "1.5px", backgroundColor: COMPANY_INFO.colors.navyHex }}
                      />
                    )}
                    {signatoryName && signatoryName.trim() && (
                      <div className="font-bold text-slate-950 leading-snug">
                        {signatoryName.trim()}
                      </div>
                    )}
                    {signatoryTitle && signatoryTitle.trim() && (
                      <div
                        className="text-slate-600 leading-snug"
                        style={{ fontSize: `${bodyFontSizePx - 1.3}px` }}
                      >
                        {signatoryTitle.trim()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Subtle fade hint if content continues to page 2+ */}
              {estimatedPages > 1 && (
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-2 pointer-events-none">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm"
                    style={{
                      fontFamily: "Helvetica, Arial, sans-serif",
                      backgroundColor: "#FFFBEB",
                      color: "#B45309",
                      borderColor: "#FCD34D",
                    }}
                  >
                    Content continues cleanly onto Page 2 in PDF export
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Navy Footer (20mm ≈ 75.5px — exact match to Quotation PDF) */}
            <div className="relative z-10 w-full shrink-0">
              <div
                className="w-full"
                style={{ height: "3px", backgroundColor: COMPANY_INFO.colors.goldHex }}
              />
              <div
                className="w-full flex flex-col items-center justify-center text-center px-8"
                style={{
                  height: "73px",
                  backgroundColor: COMPANY_INFO.colors.navyHex,
                  fontFamily: "Helvetica, Arial, sans-serif",
                }}
              >
                <div className="text-white font-medium" style={{ fontSize: "13.5px" }}>
                  {COMPANY_INFO.footerText}
                </div>
                <div style={{ fontSize: "10.5px", color: "#C8D8F0", marginTop: "3px" }}>
                  {COMPANY_INFO.fullAddress} &nbsp;|&nbsp; {COMPANY_INFO.phones} &nbsp;|&nbsp; {COMPANY_INFO.website}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LetterheadGenerator = ({ onNotify }) => {
  // All fields start completely blank for 100% manual entry
  const [pdfName, setPdfName] = useState("");
  const [letterDate, setLetterDate] = useState("");
  const [dateFormat, setDateFormat] = useState("long");
  const [refNumber, setRefNumber] = useState("");
  const [headerBadge, setHeaderBadge] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [salutation, setSalutation] = useState("");
  const [body, setBody] = useState("");
  const [closing, setClosing] = useState("");
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(false);
  const [includeBankDetails, setIncludeBankDetails] = useState(false);
  const [fontFamily, setFontFamily] = useState("helvetica");
  const [fontSize, setFontSize] = useState(11);
  const [textAlign, setTextAlign] = useState("justify");
  const [mobileTab, setMobileTab] = useState("editor"); // "editor" | "preview"
  const [isGenerating, setIsGenerating] = useState(false);

  const [signatureImage, setSignatureImage] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(SIGNATURE_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Saved letterheads history
  const [letterHistory, setLetterHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(LETTER_HISTORY_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [historySearch, setHistorySearch] = useState("");

  const bodyTextareaRef = useRef(null);
  const sigInputRef = useRef(null);

  // Persist saved letterheads history
  useEffect(() => {
    try {
      localStorage.setItem(LETTER_HISTORY_KEY, JSON.stringify(letterHistory));
    } catch {
      // ignore
    }
  }, [letterHistory]);

  const wordCount = useMemo(() => {
    const words = (body || "").trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [body]);

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return letterHistory;
    const term = historySearch.trim().toLowerCase();
    return letterHistory.filter((item) =>
      [item.pdfName, item.subject, item.recipient, item.refNumber, item.body]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [historySearch, letterHistory]);

  const notify = useCallback(
    (payload) => {
      if (onNotify) onNotify(payload);
    },
    [onNotify]
  );

  const handleReset = () => {
    if (
      (body.trim() || subject.trim() || recipient.trim()) &&
      typeof window !== "undefined" &&
      !window.confirm("Clear all fields in the current letterhead?")
    ) {
      return;
    }
    setPdfName("");
    setLetterDate("");
    setRefNumber("");
    setHeaderBadge("");
    setRecipient("");
    setSubject("");
    setSalutation("");
    setBody("");
    setClosing("");
    setSignatoryName("");
    setSignatoryTitle("");
    setIncludeBankDetails(false);
    setIncludeSignature(false);
    notify({
      type: "info",
      title: "Letterhead Cleared",
      message: "All fields reset to blank",
    });
  };

  // Formatting helpers for the main letter body textarea
  const insertBodyFormat = (kind) => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? body.length;
    const end = textarea.selectionEnd ?? body.length;
    const selected = body.slice(start, end);

    let insertion = "";
    let cursorOffset = 0;

    if (kind === "bold") {
      insertion = `**${selected}**`;
      cursorOffset = selected ? start + insertion.length : start + 2;
    } else if (kind === "bullet") {
      const prefix = start > 0 && body[start - 1] !== "\n" ? "\n" : "";
      if (selected) {
        insertion =
          prefix +
          selected
            .split("\n")
            .map((line) => (line.trim() ? `- ${line.replace(/^[-*•]\s*/, "")}` : ""))
            .join("\n");
      } else {
        insertion = `${prefix}- `;
      }
      cursorOffset = start + insertion.length;
    } else if (kind === "numbered") {
      const prefix = start > 0 && body[start - 1] !== "\n" ? "\n" : "";
      if (selected) {
        let count = 1;
        insertion =
          prefix +
          selected
            .split("\n")
            .map((line) => (line.trim() ? `${count++}. ${line.replace(/^\d+[.)]\s*/, "")}` : ""))
            .join("\n");
      } else {
        insertion = `${prefix}1. `;
      }
      cursorOffset = start + insertion.length;
    } else if (kind === "heading") {
      const prefix = start > 0 && body[start - 1] !== "\n" ? "\n\n" : "";
      insertion = `${prefix}**${selected}**`;
      cursorOffset = selected ? start + insertion.length : start + prefix.length + 2;
    }

    const updated = body.slice(0, start) + insertion + body.slice(end);
    setBody(updated);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    });
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify({
        type: "error",
        title: "Invalid File",
        message: "Please upload a PNG or JPG signature/stamp image",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 480;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const pngData = canvas.toDataURL("image/png");
        setSignatureImage(pngData);
        try {
          localStorage.setItem(SIGNATURE_STORAGE_KEY, pngData);
        } catch {
          // ignore
        }
        notify({
          type: "success",
          title: "Signature Attached",
          message: "Added to your letterhead",
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRemoveSignature = () => {
    setSignatureImage(null);
    try {
      localStorage.removeItem(SIGNATURE_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const getCurrentConfig = () => ({
    pdfName,
    letterDate,
    dateFormat,
    refNumber,
    headerBadge,
    recipient,
    subject,
    salutation,
    body,
    closing,
    signatoryName,
    signatoryTitle,
    signatureImage,
    includeWatermark,
    includeSignature,
    includeBankDetails,
    fontFamily,
    fontSize,
    textAlign,
  });

  const handleExportPdf = async (mode = "download") => {
    setIsGenerating(true);
    try {
      const config = getCurrentConfig();
      const result = await generateLetterheadPdf(config, mode);

      if (mode === "preview" && result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        notify({
          type: "info",
          title: "PDF Preview Opened",
          message: `${result.fileName} (${result.totalPages} page${result.totalPages > 1 ? "s" : ""})`,
        });
      } else {
        const entry = {
          id: `letter-${Date.now()}`,
          savedAt: new Date().toISOString(),
          pdfName: result.fileName.replace(/\.pdf$/i, ""),
          letterDate,
          dateFormat,
          refNumber,
          headerBadge,
          recipient,
          subject,
          salutation,
          body,
          closing,
          signatoryName,
          signatoryTitle,
          includeWatermark,
          includeSignature,
          includeBankDetails,
          fontFamily,
          fontSize,
          textAlign,
          totalPages: result.totalPages,
        };
        setLetterHistory((prev) => [entry, ...prev].slice(0, 200));

        notify({
          type: "success",
          title: "Letterhead PDF Ready!",
          message: `Downloaded ${result.fileName}`,
        });
      }
    } catch (err) {
      console.error("Failed to generate letterhead PDF:", err);
      notify({
        type: "error",
        title: "PDF Generation Error",
        message: "Could not build PDF. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadFromHistory = (entry) => {
    setPdfName(entry.pdfName || "");
    setLetterDate(entry.letterDate || "");
    setDateFormat(entry.dateFormat || "long");
    setRefNumber(entry.refNumber || "");
    setHeaderBadge(entry.headerBadge || "");
    setRecipient(entry.recipient || "");
    setSubject(entry.subject || "");
    setSalutation(entry.salutation || "");
    setBody(entry.body || "");
    setClosing(entry.closing || "");
    setSignatoryName(entry.signatoryName || "");
    setSignatoryTitle(entry.signatoryTitle || "");
    setIncludeWatermark(entry.includeWatermark ?? true);
    setIncludeSignature(entry.includeSignature ?? false);
    setIncludeBankDetails(entry.includeBankDetails ?? false);
    setFontFamily(entry.fontFamily || "helvetica");
    setFontSize(entry.fontSize || 11);
    setTextAlign(entry.textAlign || "justify");

    notify({
      type: "success",
      title: "Letterhead Loaded",
      message: `"${entry.subject || entry.pdfName}" ready for editing`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickRedownload = async (entry) => {
    try {
      const result = await generateLetterheadPdf(
        { ...entry, signatureImage },
        "download"
      );
      notify({
        type: "success",
        title: "PDF Downloaded",
        message: result.fileName,
      });
    } catch {
      notify({
        type: "error",
        title: "Download Failed",
        message: "Could not re-download letterhead PDF",
      });
    }
  };

  const handleDeleteHistory = (id) => {
    setLetterHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (!letterHistory.length) return;
    if (window.confirm("Clear all saved letterheads?")) {
      setLetterHistory([]);
    }
  };

  return (
    <section
      id="letterhead-studio"
      className="min-h-screen pt-16 sm:pt-20 pb-12 px-3 sm:px-4 md:px-8 lg:px-10"
      style={{
        background:
          "linear-gradient(180deg, #f0f4ff 0%, #ffffff 18%, #ffffff 60%, #f8fafc 85%, #f1f5f9 100%)",
      }}
    >
      {/* Hero Title */}
      <div className="max-w-5xl mx-auto text-center mb-6 sm:mb-8 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 text-indigo-800 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3.5 border border-indigo-100 shadow-sm">
          <FileSignature size={14} className="text-amber-500" />
          <span>Official Company Branding &bull; A4 Letterhead PDF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2.5 tracking-tight leading-[1.15]">
          Company Letterhead
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
            {" "}
            Generator
          </span>
        </h1>

        <p className="text-slate-500 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2">
          Enter your own text manually and instantly generate an official{" "}
          <strong className="text-slate-700">South Lanka Fireworks</strong> letterhead PDF matching your quotation branding.
        </p>
      </div>

      {/* Main Studio Card */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden mb-10">
        {/* Luxury Gradient Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 relative overflow-hidden border-b border-indigo-900/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                <FileSignature size={22} className="text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    Letterhead Studio
                  </h2>
                  <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    Live Preview
                  </span>
                </div>
                <p className="text-slate-300/85 text-xs sm:text-sm mt-0.5 font-medium">
                  Reg. No: SG/5276 &bull; 07 Dadalla Cross Road, Galle &bull; Instant A4 PDF
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold transition inline-flex items-center gap-1.5 border border-white/15 active:scale-95"
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportPdf("preview")}
                disabled={isGenerating}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition inline-flex items-center gap-1.5 border border-white/20 active:scale-95 disabled:opacity-50"
              >
                <Printer size={14} />
                <span>Preview / Print</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportPdf("download")}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs sm:text-sm font-black shadow-lg transition inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Download size={15} />
                <span>{isGenerating ? "Building PDF..." : "Download PDF"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet View Switcher */}
        <div className="lg:hidden flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
              mobileTab === "editor"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <PenTool size={14} />
            <span>Write Letter</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition ${
              mobileTab === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <Eye size={14} />
            <span>Live A4 Preview</span>
          </button>
        </div>

        {/* Split Editor + Live A4 Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x divide-slate-200">
          {/* LEFT: Manual Letter Composer */}
          <div
            className={`lg:col-span-6 p-4 sm:p-6 space-y-5 ${
              mobileTab === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Block 1: Document Metadata */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Document Details (Optional)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                    <FileText size={12} className="text-indigo-500" />
                    PDF File Name
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5 m-0 leading-tight">
                    Example: <span className="font-medium text-indigo-600/80">Police_Permission_Galle_2026</span>
                  </p>
                  <input
                    type="text"
                    value={pdfName}
                    onChange={(e) => setPdfName(e.target.value)}
                    placeholder="Type file name..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Calendar size={12} className="text-indigo-500" />
                    Letter Date
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5 m-0 leading-tight">
                    Example: <span className="font-medium text-indigo-600/80">23 November 2026</span> or <span className="font-medium text-indigo-600/80">23/11/2026</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      className="flex-1 min-w-0 border border-slate-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDateFormat((prev) => (prev === "long" ? "short" : "long"))
                      }
                      title="Toggle date format"
                      className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 text-[10px] font-bold text-slate-600 shrink-0"
                    >
                      {dateFormat === "long" ? "DD Mon" : "DD/MM"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Hash size={12} className="text-indigo-500" />
                    Reference No.
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5 m-0 leading-tight">
                    Example: <span className="font-medium text-indigo-600/80">SLF/2026/001</span>
                  </p>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="Type reference number..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    Header Label
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5 m-0 leading-tight">
                    Example: <span className="font-medium text-indigo-600/80">OFFICIAL LETTER</span>, <span className="font-medium text-indigo-600/80">PROPOSAL</span>, <span className="font-medium text-indigo-600/80">CONFIRMATION</span>
                  </p>
                  <input
                    type="text"
                    value={headerBadge}
                    onChange={(e) => setHeaderBadge(e.target.value)}
                    placeholder="Type header label..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Block 2: Recipient, Subject & Main Letter Content */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                    Letter Content
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                  {wordCount} word{wordCount !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                    <User size={12} className="text-purple-500" />
                    To / Recipient
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5 m-0 leading-tight">
                    Example: <span className="font-medium text-purple-600/80">The Officer-in-Charge, Police Station, Galle.</span>
                  </p>
                  <textarea
                    rows={3}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Type recipient name & address..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium resize-y"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Salutation
                    </label>
                    <p className="text-[10px] text-slate-400 mb-1.5 m-0 leading-tight">
                      Example: <span className="font-medium text-purple-600/80">Dear Sir / Madam,</span>
                    </p>
                    <input
                      type="text"
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value)}
                      placeholder="Type salutation..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Subject / Heading
                    </label>
                    <p className="text-[10px] text-slate-400 mb-1.5 m-0 leading-tight">
                      Example: <span className="font-medium text-purple-600/80">REQUEST FOR FIREWORKS DISPLAY PERMISSION</span>
                    </p>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Type subject heading..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Main Body Textarea + Example Guide + Mini Formatting Toolbar */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Letter Body Text
                  </label>
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => insertBodyFormat("bold")}
                      className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition"
                      title="Bold (**text**)"
                    >
                      <Bold size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertBodyFormat("heading")}
                      className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition"
                      title="Section heading"
                    >
                      <Heading size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertBodyFormat("bullet")}
                      className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition"
                      title="Bullet point (- item)"
                    >
                      <List size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertBodyFormat("numbered")}
                      className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition"
                      title="Numbered list (1. item)"
                    >
                      <ListOrdered size={13} />
                    </button>
                  </div>
                </div>

                <div className="mb-2 rounded-xl bg-indigo-50/60 border border-indigo-100 px-3 py-2 text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-indigo-700">Example: </span>
                  We, <span className="font-semibold text-slate-800">**South Lanka Fireworks**</span> (Reg. No: SG/5276), kindly request permission to conduct a fireworks display on 15 Dec 2026 at Galle Fort.
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Formatting tips: use <code className="px-1 py-0.5 rounded bg-white border border-indigo-100 text-indigo-700 font-semibold">**text**</code> for bold, <code className="px-1 py-0.5 rounded bg-white border border-indigo-100 text-indigo-700 font-semibold">- item</code> for bullets, or <code className="px-1 py-0.5 rounded bg-white border border-indigo-100 text-indigo-700 font-semibold">1. item</code> for numbered points.
                  </span>
                </div>

                <textarea
                  ref={bodyTextareaRef}
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type or paste your letter content here..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed resize-y font-normal text-slate-800"
                />
              </div>
            </div>

            {/* Block 3: Signatory, Typography & Add-ons */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Signatory, Style &amp; Options
                </h3>
              </div>

              {/* Typography Controls */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <Type size={11} /> Font Style
                  </span>
                  <div className="grid grid-cols-2 bg-white rounded-xl border border-slate-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => setFontFamily("helvetica")}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                        fontFamily === "helvetica"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Sans
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily("times")}
                      className={`py-1.5 rounded-lg text-[11px] font-serif font-bold transition ${
                        fontFamily === "times"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Serif
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Text Size
                  </span>
                  <div className="grid grid-cols-3 bg-white rounded-xl border border-slate-200 p-0.5">
                    {[10, 11, 12].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFontSize(sz)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                          fontSize === sz
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Alignment
                  </span>
                  <div className="grid grid-cols-2 bg-white rounded-xl border border-slate-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => setTextAlign("justify")}
                      className={`py-1.5 rounded-lg flex items-center justify-center transition ${
                        textAlign === "justify"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                      title="Justify paragraphs"
                    >
                      <AlignJustify size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlign("left")}
                      className={`py-1.5 rounded-lg flex items-center justify-center transition ${
                        textAlign === "left"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                      title="Align left"
                    >
                      <AlignLeft size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    label: "Watermark",
                    sub: "Fireworks bg",
                    checked: includeWatermark,
                    onChange: setIncludeWatermark,
                    icon: <Droplets size={13} className="text-indigo-500" />,
                  },
                  {
                    label: "Signature",
                    sub: "Add closing",
                    checked: includeSignature,
                    onChange: setIncludeSignature,
                    icon: <PenTool size={13} className="text-purple-500" />,
                  },
                  {
                    label: "Bank Details",
                    sub: "Commercial Bank",
                    checked: includeBankDetails,
                    onChange: setIncludeBankDetails,
                    icon: <Landmark size={13} className="text-amber-600" />,
                  },
                ].map((toggle) => (
                  <label
                    key={toggle.label}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 transition ${
                      toggle.checked
                        ? "border-indigo-500 bg-indigo-50/70"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={toggle.checked}
                      onChange={(e) => toggle.onChange(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border shrink-0 transition ${
                        toggle.checked
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {toggle.checked && <Check size={10} />}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1 leading-tight">
                        {toggle.icon}
                        <span className="truncate">{toggle.label}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {toggle.sub}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Signatory Details (all blank for manual entry when Signature enabled) */}
              {includeSignature && (
                <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        Closing Phrase
                      </label>
                      <p className="text-[10px] text-slate-400 mb-1 m-0 leading-tight">
                        Ex: <span className="text-indigo-600/80">Yours faithfully,</span>
                      </p>
                      <input
                        type="text"
                        value={closing}
                        onChange={(e) => setClosing(e.target.value)}
                        placeholder="Type closing..."
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        Signatory Name
                      </label>
                      <p className="text-[10px] text-slate-400 mb-1 m-0 leading-tight">
                        Ex: <span className="text-indigo-600/80">J.W. Chaminda Thushara</span>
                      </p>
                      <input
                        type="text"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        placeholder="Type name..."
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        Designation / Title
                      </label>
                      <p className="text-[10px] text-slate-400 mb-1 m-0 leading-tight">
                        Ex: <span className="text-indigo-600/80">Proprietor / Director</span>
                      </p>
                      <input
                        type="text"
                        value={signatoryTitle}
                        onChange={(e) => setSignatoryTitle(e.target.value)}
                        placeholder="Type title..."
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Optional Signature / Stamp Upload */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <input
                      ref={sigInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                    {signatureImage ? (
                      <div className="flex items-center gap-2.5">
                        <img
                          src={signatureImage}
                          alt="Uploaded signature"
                          className="h-9 max-w-[110px] object-contain rounded border border-slate-200 bg-slate-50 px-1.5"
                        />
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Signature / Stamp active
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Optional: Upload digital signature or rubber stamp PNG
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => sigInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold inline-flex items-center gap-1 transition"
                      >
                        <UploadCloud size={12} />
                        <span>{signatureImage ? "Change" : "Upload Sign"}</span>
                      </button>
                      {signatureImage && (
                        <button
                          type="button"
                          onClick={handleRemoveSignature}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
                          title="Remove signature"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Primary Download CTA Bar */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white m-0">
                  Ready to Export Official Letterhead?
                </p>
                <p className="text-[11px] text-slate-300 m-0 mt-0.5">
                  High-resolution A4 PDF with exact South Lanka Fireworks branding
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExportPdf("preview")}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 inline-flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Eye size={16} />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportPdf("download")}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3 px-6 rounded-xl shadow-xl transition inline-flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 disabled:opacity-50"
                >
                  <Download size={17} />
                  <span>{isGenerating ? "Generating..." : "Download Letterhead PDF"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Real-Time A4 Letterhead Preview */}
          <div
            className={`lg:col-span-6 p-4 sm:p-6 bg-slate-50/60 ${
              mobileTab === "editor" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="lg:sticky lg:top-20">
              <LetterheadPaperPreview
                letterDate={letterDate}
                dateFormat={dateFormat}
                refNumber={refNumber}
                headerBadge={headerBadge}
                recipient={recipient}
                subject={subject}
                salutation={salutation}
                body={body}
                closing={closing}
                signatoryName={signatoryName}
                signatoryTitle={signatoryTitle}
                signatureImage={signatureImage}
                includeWatermark={includeWatermark}
                includeSignature={includeSignature}
                includeBankDetails={includeBankDetails}
                fontFamily={fontFamily}
                fontSize={fontSize}
                textAlign={textAlign}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Saved Letterheads History */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-4 sm:p-6 relative overflow-hidden text-white border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
                  <History size={21} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                      Saved Letterheads
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {letterHistory.length}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                    {letterHistory.length > 0
                      ? "Reload, edit, or instantly re-download any generated company letter"
                      : "Your downloaded letterheads will appear here"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search subject, recipient..."
                    className="w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
                {letterHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 px-3.5 py-2 text-xs font-semibold text-red-200 transition active:scale-95"
                  >
                    <Trash2 size={14} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-slate-50/50">
            {letterHistory.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                  <FileSignature size={26} />
                </div>
                <h4 className="text-slate-800 font-bold text-sm sm:text-base mb-1">
                  No Letterheads Saved Yet
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                  Download your first letterhead PDF above and it will be saved here for instant reuse.
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-600 text-sm">
                  No letterheads found matching &ldquo;
                  <span className="text-indigo-600 font-bold">{historySearch}</span>&rdquo;
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-lg hover:border-amber-400/60 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 mb-0.5">
                            <FileText size={12} className="shrink-0" />
                            <span className="truncate">{item.pdfName}.pdf</span>
                          </div>
                          <h5 className="font-extrabold text-slate-900 text-sm truncate">
                            {item.subject || "Official Letterhead"}
                          </h5>
                          {item.recipient && (
                            <p className="text-xs text-slate-500 truncate mt-0.5 m-0">
                              To: {item.recipient.split("\n")[0]}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLoadFromHistory(item)}
                            className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 flex items-center justify-center transition"
                            title="Load into Editor"
                          >
                            <RefreshCcw size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickRedownload(item)}
                            className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-slate-950 border border-amber-200 flex items-center justify-center transition"
                            title="Re-download PDF"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHistory(item.id)}
                            className="h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 flex items-center justify-center transition"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {item.body && (
                        <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 m-0">
                          {item.body.replace(/\*\*/g, "")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-[11px]">
                      {item.letterDate ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold border border-indigo-100">
                          <Calendar size={10} />
                          {formatDateDDMMYYYY(item.letterDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400">No date</span>
                      )}
                      {item.refNumber && (
                        <span className="text-slate-500 font-semibold truncate">
                          {item.refNumber}
                        </span>
                      )}
                      <span className="text-slate-400 ml-auto shrink-0">
                        {item.totalPages || 1} pg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LetterheadGenerator;
