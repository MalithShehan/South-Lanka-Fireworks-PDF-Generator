import { jsPDF } from "jspdf";
import { BANK_DETAILS, COMPANY_INFO, formatDateDDMMYYYY, formatDateLong } from "./companyInfo.js";

const assetCache = {};

const loadImageToDataUrl = (url, { width, height, maxWidth, preserveAspect = true } = {}) => {
  const cacheKey = `${url}|${width || ""}|${height || ""}|${maxWidth || ""}|${preserveAspect}`;
  if (assetCache[cacheKey]) {
    return Promise.resolve(assetCache[cacheKey]);
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (!url.startsWith("data:")) {
      img.crossOrigin = "Anonymous";
    }
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let targetW = img.width;
        let targetH = img.height;

        if (width && height && !preserveAspect) {
          targetW = width;
          targetH = height;
        } else if (maxWidth && img.width > maxWidth) {
          const scale = maxWidth / img.width;
          targetW = Math.round(img.width * scale);
          targetH = Math.round(img.height * scale);
        }

        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL("image/png", 0.92);
        const result = {
          dataUrl,
          width: targetW,
          height: targetH,
          ratio: targetW / (targetH || 1),
        };
        assetCache[cacheKey] = result;
        resolve(result);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
};

// Normalize common Unicode punctuation so jsPDF built-in fonts (WinAnsi) render cleanly
export const sanitizePdfText = (input) => {
  if (!input) return "";
  return String(input)
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2014/g, " - ")
    .replace(/\u2013/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
};

export const HEADER_BADGE_OPTIONS = [
  { id: "OFFICIAL LETTER", label: "Official Letter" },
  { id: "LETTERHEAD", label: "Letterhead" },
  { id: "PROPOSAL", label: "Proposal" },
  { id: "CONFIRMATION", label: "Confirmation" },
  { id: "AGREEMENT", label: "Agreement" },
  { id: "", label: "None (Clean)" },
];

export const LETTERHEAD_TEMPLATES = [
  {
    id: "blank",
    name: "Quick Blank Letter",
    badge: "Freestyle",
    description: "Start fresh — type or paste any text",
    data: {
      headerBadge: "OFFICIAL LETTER",
      recipient: "",
      subject: "",
      salutation: "Dear Sir / Madam,",
      body: "",
      closing: "Yours faithfully,",
      includeBankDetails: false,
      includeSignature: true,
    },
  },
  {
    id: "police-permission",
    name: "Police / Event Permit",
    badge: "Most Used",
    description: "Official fireworks display approval request",
    data: {
      headerBadge: "OFFICIAL LETTER",
      recipient: "The Officer-in-Charge,\nPolice Station,\nGalle.",
      subject: "REQUEST FOR PERMISSION TO CONDUCT A FIREWORKS DISPLAY",
      salutation: "Dear Sir,",
      body:
        "We, **South Lanka Fireworks** (Reg. No: SG/5276), a registered and experienced pyrotechnics company based in Galle, respectfully request your kind permission to conduct a controlled aerial fireworks display for an upcoming celebratory event.\n\n" +
        "**Event Details:**\n" +
        "- Event Name: [Enter Event / Wedding / Festival Name]\n" +
        "- Venue: [Enter Venue Name & Address]\n" +
        "- Date & Time: [Enter Date] at [Enter Time, e.g. 9:00 PM]\n" +
        "- Duration: Approximately 10 - 15 minutes\n\n" +
        "We assure you that the entire display will be handled exclusively by our trained, licensed pyrotechnic technicians in strict compliance with all safety standards, buffer distances, and fire-prevention protocols. Necessary fire safety equipment will remain on standby throughout the show.\n\n" +
        "We kindly request your favorable approval to proceed with this display. Please feel free to contact us on 077 713 5516 for any further clarification.",
      closing: "Thank you.\nYours faithfully,",
      includeBankDetails: false,
      includeSignature: true,
    },
  },
  {
    id: "event-proposal",
    name: "Event Proposal Cover",
    badge: "Sales",
    description: "Cover letter accompanying a fireworks quotation",
    data: {
      headerBadge: "PROPOSAL",
      recipient: "The Event Coordinator / Management,\n[Client / Hotel / Organization Name],\n[City].",
      subject: "PROPOSAL FOR BESPOKE FIREWORKS DISPLAY",
      salutation: "Dear Sir / Madam,",
      body:
        "Thank you for your interest in **South Lanka Fireworks**. It gives us great pleasure to present our proposal for an unforgettable pyrotechnic display tailored specifically for your upcoming celebration.\n\n" +
        "With years of expertise executing grand displays across Sri Lanka — from luxury weddings and college big matches to corporate galas and national festivals — we deliver precision choreography, vibrant high-altitude shells, and uncompromising safety.\n\n" +
        "**What Our Service Includes:**\n" +
        "- Complete site inspection and safety perimeter planning\n" +
        "- Premium imported aerial shells, fountains, and custom effects\n" +
        "- Professional electronic firing system and certified crew\n" +
        "- Post-display site clearance and safety verification\n\n" +
        "Kindly refer to the attached quotation for itemized pricing. To confirm your booking date, an advance payment may be remitted to our bank account below. We look forward to lighting up your special occasion.",
      closing: "Warm regards,",
      includeBankDetails: true,
      includeSignature: true,
    },
  },
  {
    id: "booking-confirmation",
    name: "Booking Confirmation",
    badge: "Client",
    description: "Confirm reserved date and advance received",
    data: {
      headerBadge: "CONFIRMATION",
      recipient: "Mr. / Mrs. [Client Name],\n[Client Address / Contact No].",
      subject: "CONFIRMATION OF FIREWORKS DISPLAY BOOKING",
      salutation: "Dear Valued Client,",
      body:
        "We are pleased to formally confirm your fireworks display reservation with **South Lanka Fireworks**. Thank you for placing your trust in our team for your celebration.\n\n" +
        "**Confirmed Schedule:**\n" +
        "- Event Date: [Enter Event Date]\n" +
        "- Venue: [Enter Venue]\n" +
        "- Package / Show Type: [Enter Package Name]\n" +
        "- Advance Received: Rs. [Amount]\n" +
        "- Balance Payable: Rs. [Balance Amount] (prior to display)\n\n" +
        "Our technical crew will arrive at the venue well in advance for setup and safety checks. Please ensure clear access to the designated firing area on the day of the event.\n\n" +
        "Should you wish to add any special effects such as Name & Logo displays, Silver Waterfalls, or Extra Aerial Shells, please contact us at least 3 days prior to the event.",
      closing: "Yours sincerely,",
      includeBankDetails: true,
      includeSignature: true,
    },
  },
  {
    id: "safety-assurance",
    name: "Safety & Compliance",
    badge: "Venue",
    description: "Safety undertaking letter for hotels & venues",
    data: {
      headerBadge: "OFFICIAL LETTER",
      recipient: "The General Manager / Safety Officer,\n[Hotel / Venue Name],\n[Location].",
      subject: "SAFETY ASSURANCE & LIABILITY UNDERTAKING FOR FIREWORKS DISPLAY",
      salutation: "Dear Sir / Madam,",
      body:
        "This letter serves as a formal safety assurance from **South Lanka Fireworks** (Reg. No: SG/5276) regarding the scheduled pyrotechnic display at your esteemed premises on [Enter Event Date].\n\n" +
        "**Our Safety Commitments:**\n" +
        "1. All pyrotechnic products are quality-tested and stored in sealed, moisture-protected containers until setup.\n" +
        "2. Firing zones are strictly cordoned off with safe fallout clearance from buildings, guests, vehicles, and greenery.\n" +
        "3. Every display is supervised directly by experienced senior technicians equipped with fire extinguishers and safety gear.\n" +
        "4. Upon completion of the display, our team conducts a thorough sweep of the firing site to clear all spent tubes and debris.\n\n" +
        "We take full operational responsibility for our pyrotechnic setup and will work closely with your venue management and security staff to guarantee a smooth, dazzling, and incident-free show.",
      closing: "Yours faithfully,",
      includeBankDetails: false,
      includeSignature: true,
    },
  },
];

// Parse a paragraph into structured display lines/segments for both live preview and PDF
export const parseBodyBlocks = (rawBody) => {
  const clean = sanitizePdfText(rawBody || "");
  if (!clean.trim()) return [];

  const lines = clean.split("\n");
  const blocks = [];

  lines.forEach((rawLine) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      blocks.push({ type: "spacer" });
      return;
    }

    const bulletMatch = trimmed.match(/^[-*\u2022]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({ type: "bullet", text: bulletMatch[1].trim() });
      return;
    }

    const numMatch = trimmed.match(/^(\d+[.)])\s+(.*)$/);
    if (numMatch) {
      blocks.push({ type: "numbered", marker: numMatch[1], text: numMatch[2].trim() });
      return;
    }

    // Pure bold heading line like **Event Details:**
    const boldHeadingMatch = trimmed.match(/^\*\*(.+)\*\*$/);
    if (boldHeadingMatch && !boldHeadingMatch[1].includes("**")) {
      blocks.push({ type: "heading", text: boldHeadingMatch[1] });
      return;
    }

    blocks.push({ type: "paragraph", text: trimmed });
  });

  // Collapse consecutive spacers
  return blocks.filter((b, i) => !(b.type === "spacer" && (i === 0 || blocks[i - 1]?.type === "spacer")));
};

// Parse inline **bold** segments inside a line
export const parseInlineSegments = (text) => {
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }
  return parts.length ? parts : [{ text, bold: false }];
};

// Strip **bold** markers for plain text measurement/rendering
const stripBoldMarkers = (text) => text.replace(/\*\*(.+?)\*\*/g, "$1");

// Wrap rich inline-bold text into lines of styled tokens so mixed bold+normal works seamlessly in jsPDF
const wrapStyledText = (doc, text, maxWidth, fontFamily, fontSize) => {
  const segments = parseInlineSegments(text);
  const words = [];

  segments.forEach((seg) => {
    const tokens = seg.text.split(/(\s+)/);
    tokens.forEach((token) => {
      if (!token) return;
      words.push({ text: token, bold: seg.bold, isSpace: /^\s+$/.test(token) });
    });
  });

  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  const measureToken = (token) => {
    doc.setFont(fontFamily, token.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    return doc.getTextWidth(token.text);
  };

  words.forEach((token) => {
    if (currentLine.length === 0 && token.isSpace) {
      return;
    }
    const tokenW = measureToken(token);
    if (currentWidth + tokenW > maxWidth && currentLine.length > 0) {
      // Remove trailing spaces
      while (currentLine.length > 0 && currentLine[currentLine.length - 1].isSpace) {
        currentLine.pop();
      }
      lines.push(currentLine);
      currentLine = token.isSpace ? [] : [token];
      currentWidth = token.isSpace ? 0 : tokenW;
    } else {
      currentLine.push(token);
      currentWidth += tokenW;
    }
  });

  if (currentLine.length > 0) {
    while (currentLine.length > 0 && currentLine[currentLine.length - 1].isSpace) {
      currentLine.pop();
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  }

  return lines;
};

// Render a single styled line, supporting optional full justification for non-last lines
const drawStyledLine = (doc, tokens, x, y, maxWidth, fontFamily, fontSize, justify) => {
  doc.setFontSize(fontSize);

  // Measure natural width and count spaces
  let totalTextWidth = 0;
  let spaceCount = 0;
  const measured = tokens.map((t) => {
    doc.setFont(fontFamily, t.bold ? "bold" : "normal");
    const w = doc.getTextWidth(t.text);
    if (t.isSpace) {
      spaceCount += 1;
    } else {
      totalTextWidth += w;
    }
    return { ...t, w };
  });

  // Compute extra space per gap if justified
  const naturalSpaceWidth = measured
    .filter((m) => m.isSpace)
    .reduce((acc, m) => acc + m.w, 0);
  const naturalTotal = totalTextWidth + naturalSpaceWidth;
  const leftover = maxWidth - naturalTotal;
  const shouldJustify = justify && spaceCount > 0 && leftover > 0 && leftover < maxWidth * 0.32;
  const extraPerSpace = shouldJustify ? leftover / spaceCount : 0;

  let cursorX = x;
  measured.forEach((m) => {
    if (m.isSpace) {
      cursorX += m.w + extraPerSpace;
    } else {
      doc.setFont(fontFamily, m.bold ? "bold" : "normal");
      doc.text(m.text, cursorX, y);
      cursorX += m.w;
    }
  });
};

export const generateLetterheadPdf = async (config, mode = "download") => {
  const {
    pdfName = "",
    letterDate = "",
    dateFormat = "long", // "long" | "short"
    refNumber = "",
    headerBadge = "",
    recipient = "",
    subject = "",
    salutation = "",
    body = "",
    closing = "",
    signatoryName = "",
    signatoryTitle = "",
    signatureImage = null,
    includeWatermark = true,
    includeSignature = false,
    includeBankDetails = false,
    fontFamily = "helvetica", // "helvetica" | "times"
    fontSize = 11,
    textAlign = "justify", // "justify" | "left"
  } = config;

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const footerHeight = 20;
  const safeBottomY = pageHeight - footerHeight - 8;

  // Load company assets in parallel (matching Quotation PDF assets)
  const [bgImg, logoImg, regIcon, personIcon, addressIcon, phoneIcon, emailIcon, webIcon] =
    await Promise.all([
      includeWatermark
        ? loadImageToDataUrl(COMPANY_INFO.assets.bg, {
            width: pageWidth * 4,
            height: pageHeight * 4,
            preserveAspect: false,
          })
        : Promise.resolve(null),
      loadImageToDataUrl(COMPANY_INFO.assets.logo, { maxWidth: 600 }),
      loadImageToDataUrl(COMPANY_INFO.assets.icons.reg, { maxWidth: 160 }),
      loadImageToDataUrl(COMPANY_INFO.assets.icons.person, { maxWidth: 160 }),
      loadImageToDataUrl(COMPANY_INFO.assets.icons.address, { maxWidth: 160 }),
      loadImageToDataUrl(COMPANY_INFO.assets.icons.phone, { maxWidth: 160 }),
      loadImageToDataUrl(COMPANY_INFO.assets.icons.email, { maxWidth: 160 }),
      loadImageToDataUrl(COMPANY_INFO.assets.icons.web, { maxWidth: 160 }),
    ]);

  let loadedSigImg = null;
  if (includeSignature && signatureImage) {
    loadedSigImg = await loadImageToDataUrl(signatureImage, { maxWidth: 500 });
  }

  const drawBackground = () => {
    if (includeWatermark && bgImg?.dataUrl) {
      doc.addImage(bgImg.dataUrl, "PNG", 0, 0, pageWidth, pageHeight);
    }
  };

  // Full official letterhead header for Page 1 (exact match to Quotation PDF styling)
  const drawPage1Header = () => {
    drawBackground();

    // Top Navy Banner (same rgb(0, 47, 108) & height 25mm as Quotation PDF)
    doc.setFillColor(...COMPANY_INFO.colors.navy);
    doc.rect(0, 0, pageWidth, 25, "F");

    // Thin Gold Accent Trim directly underneath the navy banner
    doc.setFillColor(...COMPANY_INFO.colors.gold);
    doc.rect(0, 25, pageWidth, 1.2, "F");

    // Company Logo (preserving natural aspect ratio inside 24x20 box)
    if (logoImg?.dataUrl) {
      const boxH = 20;
      const boxW = Math.min(25, boxH * (logoImg.ratio || 1.05));
      doc.addImage(logoImg.dataUrl, "PNG", 10, 2.5, boxW, boxH);
    }

    // Company Name centered (matching Quotation PDF)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(COMPANY_INFO.name, pageWidth / 2, 14.5, { align: "center" });

    // Subtle tagline under company name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(215, 228, 248);
    doc.text("SRI LANKA'S PREMIER PYROTECHNICS & FIREWORKS DISPLAYS", pageWidth / 2, 20.5, {
      align: "center",
    });

    // Optional right header badge (similar position to "INVOICE" in quotation PDF)
    if (headerBadge && headerBadge.trim()) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(255, 210, 77);
      doc.text(sanitizePdfText(headerBadge.trim().toUpperCase()), pageWidth - 12, 15.5, {
        align: "right",
      });
    }

    // Right-aligned Company Contact Block (exact same details & icons as Quotation PDF)
    let contactY = 32;
    const iconSize = 3.6;
    const iconX = pageWidth - 74;
    const textX = pageWidth - 68.5;
    const lineGap = 4.4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COMPANY_INFO.colors.textDark);

    const contactRows = [
      { icon: regIcon, text: COMPANY_INFO.regNo },
      { icon: personIcon, text: COMPANY_INFO.proprietor },
      { icon: addressIcon, text: COMPANY_INFO.addressLine1 },
      { icon: null, text: COMPANY_INFO.addressLine2 },
      { icon: phoneIcon, text: COMPANY_INFO.phones },
      { icon: emailIcon, text: COMPANY_INFO.email },
      { icon: webIcon, text: COMPANY_INFO.website },
    ];

    contactRows.forEach((row) => {
      if (row.icon?.dataUrl) {
        doc.addImage(row.icon.dataUrl, "PNG", iconX, contactY - 2.9, iconSize, iconSize);
      }
      doc.text(row.text, textX, contactY);
      contactY += lineGap;
    });

    // Left-aligned Date & Reference Number (only rendered when manually entered)
    let leftMetaY = 34;
    if (letterDate && letterDate.trim()) {
      const formattedDate =
        dateFormat === "short" ? formatDateDDMMYYYY(letterDate) : formatDateLong(letterDate);
      doc.setFont(fontFamily, "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...COMPANY_INFO.colors.navy);
      doc.text("Date :", marginX, leftMetaY);
      doc.setFont(fontFamily, "normal");
      doc.setTextColor(...COMPANY_INFO.colors.textDark);
      doc.text(formattedDate, marginX + 14, leftMetaY);
      leftMetaY += 5.8;
    }

    if (refNumber && refNumber.trim()) {
      doc.setFont(fontFamily, "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...COMPANY_INFO.colors.navy);
      doc.text("Ref No :", marginX, leftMetaY);
      doc.setFont(fontFamily, "normal");
      doc.setTextColor(...COMPANY_INFO.colors.textDark);
      doc.text(sanitizePdfText(refNumber.trim()), marginX + 17, leftMetaY);
      leftMetaY += 5.8;
    }

    // Divider line cleanly below the contact block
    const dividerY = Math.max(contactY + 0.5, leftMetaY + 2, 63);
    doc.setDrawColor(...COMPANY_INFO.colors.navy);
    doc.setLineWidth(0.5);
    doc.line(marginX, dividerY, pageWidth - marginX, dividerY);
    doc.setDrawColor(...COMPANY_INFO.colors.gold);
    doc.setLineWidth(0.35);
    doc.line(marginX, dividerY + 1.0, marginX + 46, dividerY + 1.0);

    return dividerY + 7.5;
  };

  // Slim official continuation header for Page 2+
  const drawContinuationHeader = () => {
    drawBackground();

    doc.setFillColor(...COMPANY_INFO.colors.navy);
    doc.rect(0, 0, pageWidth, 14, "F");
    doc.setFillColor(...COMPANY_INFO.colors.gold);
    doc.rect(0, 14, pageWidth, 0.9, "F");

    if (logoImg?.dataUrl) {
      const boxH = 10;
      const boxW = Math.min(13, boxH * (logoImg.ratio || 1.05));
      doc.addImage(logoImg.dataUrl, "PNG", 10, 2, boxW, boxH);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(COMPANY_INFO.name, 26, 9.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(215, 228, 248);
    const rightRef = refNumber?.trim()
      ? `Ref: ${sanitizePdfText(refNumber.trim())}  |  ${COMPANY_INFO.website}`
      : COMPANY_INFO.website;
    doc.text(rightRef, pageWidth - marginX, 9.2, { align: "right" });

    return 25;
  };

  const drawFooter = (pageNum, totalPages) => {
    doc.setFillColor(...COMPANY_INFO.colors.navy);
    doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");

    // Subtle top gold accent line on footer
    doc.setFillColor(...COMPANY_INFO.colors.gold);
    doc.rect(0, pageHeight - footerHeight, pageWidth, 0.8, "F");

    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(COMPANY_INFO.footerText, pageWidth / 2, pageHeight - 9.5, {
      align: "center",
    });

    doc.setFontSize(7.8);
    doc.setTextColor(200, 216, 240);
    doc.text(
      `${COMPANY_INFO.fullAddress}  |  ${COMPANY_INFO.phones}  |  ${COMPANY_INFO.website}`,
      pageWidth / 2,
      pageHeight - 4.2,
      { align: "center" }
    );

    if (totalPages > 1) {
      doc.setFontSize(8.2);
      doc.setTextColor(255, 210, 77);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, pageHeight - 9.5, {
        align: "right",
      });
    }
  };

  let y = drawPage1Header();

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > safeBottomY) {
      doc.addPage();
      y = drawContinuationHeader();
    }
  };

  const lineHeight = fontSize * 0.43 + 0.4; // crisp ~5.1mm at 11pt

  // 1. Recipient Block ("To:")
  const cleanRecipient = sanitizePdfText(recipient).trim();
  if (cleanRecipient) {
    const recipientLines = cleanRecipient
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    doc.setFont(fontFamily, "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...COMPANY_INFO.colors.textDark);

    recipientLines.forEach((line, idx) => {
      const wrapped = doc.splitTextToSize(line, contentWidth * 0.72);
      wrapped.forEach((wLine) => {
        ensureSpace(lineHeight);
        doc.setFont(fontFamily, idx === 0 ? "bold" : "normal");
        doc.text(wLine, marginX, y);
        y += lineHeight * 0.9;
      });
    });
    y += 3.5;
  }

  // 2. Salutation
  const cleanSalutation = sanitizePdfText(salutation).trim();
  if (cleanSalutation) {
    ensureSpace(lineHeight + 1.5);
    doc.setFont(fontFamily, "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...COMPANY_INFO.colors.textDark);
    doc.text(cleanSalutation, marginX, y);
    y += lineHeight + 1.2;
  }

  // 3. Subject Line (Bold & Underlined — formal business letter style)
  const cleanSubject = sanitizePdfText(subject).trim();
  if (cleanSubject) {
    const subjSize = fontSize + 0.5;
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(subjSize);
    doc.setTextColor(...COMPANY_INFO.colors.navy);

    const subjLines = doc.splitTextToSize(cleanSubject, contentWidth);
    subjLines.forEach((sLine) => {
      ensureSpace(lineHeight + 1.2);
      doc.text(sLine, marginX, y);
      const w = doc.getTextWidth(sLine);
      doc.setDrawColor(...COMPANY_INFO.colors.navy);
      doc.setLineWidth(0.32);
      doc.line(marginX, y + 1.1, marginX + w, y + 1.1);
      y += lineHeight + 0.3;
    });
    y += 3;
  }

  // 4. Letter Body
  const blocks = parseBodyBlocks(body);
  doc.setTextColor(...COMPANY_INFO.colors.textDark);

  blocks.forEach((block) => {
    if (block.type === "spacer") {
      y += lineHeight * 0.5;
      return;
    }

    if (block.type === "heading") {
      ensureSpace(lineHeight + 2);
      doc.setFont(fontFamily, "bold");
      doc.setFontSize(fontSize);
      doc.setTextColor(...COMPANY_INFO.colors.navy);
      const wrapped = doc.splitTextToSize(stripBoldMarkers(block.text), contentWidth);
      wrapped.forEach((line) => {
        ensureSpace(lineHeight);
        doc.text(line, marginX, y);
        y += lineHeight;
      });
      doc.setTextColor(...COMPANY_INFO.colors.textDark);
      y += 0.8;
      return;
    }

    if (block.type === "bullet" || block.type === "numbered") {
      const indent = block.type === "bullet" ? 7 : 9;
      const itemWidth = contentWidth - indent;
      const styledLines = wrapStyledText(doc, block.text, itemWidth, fontFamily, fontSize);

      styledLines.forEach((tokens, lineIdx) => {
        ensureSpace(lineHeight);
        doc.setTextColor(...COMPANY_INFO.colors.textDark);
        if (lineIdx === 0) {
          if (block.type === "bullet") {
            doc.setFillColor(...COMPANY_INFO.colors.navy);
            doc.circle(marginX + 2.8, y - 1.2, 0.85, "F");
          } else {
            doc.setFont(fontFamily, "bold");
            doc.setFontSize(fontSize);
            doc.setTextColor(...COMPANY_INFO.colors.navy);
            doc.text(block.marker, marginX + 1, y);
            doc.setTextColor(...COMPANY_INFO.colors.textDark);
          }
        }
        const isLastLine = lineIdx === styledLines.length - 1;
        drawStyledLine(
          doc,
          tokens,
          marginX + indent,
          y,
          itemWidth,
          fontFamily,
          fontSize,
          textAlign === "justify" && !isLastLine
        );
        y += lineHeight;
      });
      y += 1.2;
      return;
    }

    // Normal paragraph
    const styledLines = wrapStyledText(doc, block.text, contentWidth, fontFamily, fontSize);
    styledLines.forEach((tokens, lineIdx) => {
      ensureSpace(lineHeight);
      doc.setTextColor(...COMPANY_INFO.colors.textDark);
      const isLastLine = lineIdx === styledLines.length - 1;
      drawStyledLine(
        doc,
        tokens,
        marginX,
        y,
        contentWidth,
        fontFamily,
        fontSize,
        textAlign === "justify" && !isLastLine
      );
      y += lineHeight;
    });
    y += 1.2;
  });

  // 5. Optional Bank Details Box (matching Quotation PDF bank info)
  if (includeBankDetails) {
    const bankBoxHeight = 21;
    ensureSpace(bankBoxHeight + 4);
    y += 2.5;

    doc.setFillColor(244, 247, 252);
    doc.setDrawColor(...COMPANY_INFO.colors.borderLight);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, y, contentWidth, bankBoxHeight, 2.5, 2.5, "FD");

    // Left accent stripe
    doc.setFillColor(...COMPANY_INFO.colors.navy);
    doc.rect(marginX, y, 2, bankBoxHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COMPANY_INFO.colors.navy);
    doc.text("OFFICIAL BANK DETAILS", marginX + 6, y + 5.8);

    const colW = (contentWidth - 12) / 2;
    BANK_DETAILS.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = marginX + 6 + col * colW;
      const by = y + 11.8 + row * 5.4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.8);
      doc.setTextColor(...COMPANY_INFO.colors.textMuted);
      doc.text(`${item.label}:`, bx, by);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COMPANY_INFO.colors.textDark);
      const labelW = doc.getTextWidth(`${item.label}: `);
      doc.text(item.value, bx + labelW + 1, by);
    });

    y += bankBoxHeight + 3.5;
  }

  // 6. Signature & Closing Block (only renders what the user manually entered)
  const hasManualSignatureContent =
    includeSignature &&
    (sanitizePdfText(closing).trim() ||
      sanitizePdfText(signatoryName).trim() ||
      sanitizePdfText(signatoryTitle).trim() ||
      loadedSigImg?.dataUrl);

  if (hasManualSignatureContent) {
    const closingLines = sanitizePdfText(closing)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const sigBlockHeight =
      closingLines.length * lineHeight + (loadedSigImg ? 18 : 13) + 14;

    ensureSpace(sigBlockHeight + 2);
    y += 3.5;

    if (closingLines.length > 0) {
      doc.setFont(fontFamily, "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(...COMPANY_INFO.colors.textDark);
      closingLines.forEach((cLine) => {
        doc.text(cLine, marginX, y);
        y += lineHeight * 0.92;
      });
    }

    if (loadedSigImg?.dataUrl) {
      const sigH = 14;
      const sigW = Math.min(44, sigH * (loadedSigImg.ratio || 2.4));
      doc.addImage(loadedSigImg.dataUrl, "PNG", marginX, y + 0.5, sigW, sigH);
      y += sigH + 3;
    } else if (signatoryName?.trim() || signatoryTitle?.trim()) {
      y += 11;
    }

    if (signatoryName?.trim() || signatoryTitle?.trim() || loadedSigImg?.dataUrl) {
      doc.setDrawColor(...COMPANY_INFO.colors.navy);
      doc.setLineWidth(0.35);
      doc.line(marginX, y, marginX + 56, y);
      y += 4.4;
    }

    if (signatoryName && signatoryName.trim()) {
      doc.setFont(fontFamily, "bold");
      doc.setFontSize(fontSize);
      doc.setTextColor(...COMPANY_INFO.colors.textDark);
      doc.text(sanitizePdfText(signatoryName.trim()), marginX, y);
      y += 4.5;
    }

    if (signatoryTitle && signatoryTitle.trim()) {
      doc.setFont(fontFamily, "normal");
      doc.setFontSize(fontSize - 1);
      doc.setTextColor(...COMPANY_INFO.colors.textMuted);
      doc.text(sanitizePdfText(signatoryTitle.trim()), marginX, y);
      y += 4.2;
    }
  }

  // Stamp consistent official footers across all generated pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  const fallbackSlug = (subject || recipient || "official-letter")
    .trim()
    .slice(0, 36)
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const safeFileName = (pdfName || "").trim() || `SLF_Letterhead_${fallbackSlug || Date.now()}`;

  if (mode === "preview") {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    return { url, fileName: `${safeFileName}.pdf`, totalPages };
  }

  doc.save(`${safeFileName}.pdf`);
  return { fileName: `${safeFileName}.pdf`, totalPages };
};
