export const COMPANY_INFO = {
  name: "South Lanka Fireworks",
  tagline: "Spectacular displays since day one",
  regNo: "Reg.No : SG/5276",
  proprietor: "J.W. Chaminda Thushara.",
  proprietorClean: "J.W. Chaminda Thushara",
  proprietorTitle: "Proprietor / Managing Director",
  addressLine1: "07 Dadalla Cross Road,",
  addressLine2: "Dadalla, Galle.",
  fullAddress: "07 Dadalla Cross Road, Dadalla, Galle",
  phones: "077 713 5516 / 091 224 6572",
  email: "southlankafireworks@gmail.com",
  website: "www.slfireworks.com",
  footerText: "Thank you for choosing South Lanka Fireworks!",
  colors: {
    navy: [0, 47, 108],
    navyHex: "#002F6C",
    gold: [245, 180, 0],
    goldHex: "#F5B400",
    emerald: [0, 153, 102],
    textDark: [18, 28, 45],
    textMuted: [90, 102, 122],
    borderLight: [214, 222, 234],
  },
  assets: {
    bg: "/assets/invoice-bg.png",
    logo: "/assets/SouthLankaFireworks.png",
    icons: {
      reg: "/assets/icon-reg.png",
      person: "/assets/icon-person.png",
      address: "/assets/icon-address.png",
      phone: "/assets/icon-phone.png",
      email: "/assets/icon-email.png",
      web: "/assets/icon-web.png",
    },
  },
};

export const BANK_DETAILS = [
  { label: "Acc No", value: "8011371317" },
  { label: "Bank Name", value: "Commercial Bank" },
  { label: "Branch", value: "Galle" },
  { label: "Acc Holder Name", value: "J.W.C.Thushara" },
];

export const formatDateDDMMYYYY = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatDateLong = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(`${d}T00:00:00`);
  if (Number.isNaN(date.getTime())) return formatDateDDMMYYYY(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
