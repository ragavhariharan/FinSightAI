/**
 * Lightweight stroke-based icon set (Lucide-style). One source of truth for
 * all iconography — no emojis anywhere in the product.
 */
const PATHS = {
  // ── Navigation ──
  dashboard: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  transactions: (<><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></>),
  reports: (<><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>),
  budget: (<><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>),
  recurring: (<><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></>),
  goals: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></>),

  // ── UI / actions ──
  search: (<><circle cx="11" cy="11" r="7.5" /><path d="m21 21-4.3-4.3" /></>),
  filter: (<><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></>),
  plus: (<><path d="M12 5v14M5 12h14" /></>),
  close: (<><path d="M18 6 6 18M6 6l12 12" /></>),
  trash: (<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>),
  send: (<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>),
  sparkle: (<><path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18" /><circle cx="12" cy="12" r="3.2" /></>),
  check: (<><path d="M20 6 9 17l-5-5" /></>),
  arrowRight: (<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>),
  arrowLeft: (<><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>),
  chevronRight: (<><path d="m9 6 6 6-6 6" /></>),
  chevronDown: (<><path d="m6 9 6 6 6-6" /></>),
  menu: (<><path d="M4 6h16M4 12h16M4 18h16" /></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>),
  eyeOff: (<><path d="M9.9 4.24A10.7 10.7 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" /><path d="M6.12 6.12A13.8 13.8 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.07-1.41" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></>),
  monitor: (<><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>),
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>),
  moon: (<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>),
  alert: (<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>),
  upload: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></>),
  shield: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>),
  trendUp: (<><path d="M22 7 13.5 15.5l-5-5L2 17" /><path d="M16 7h6v6" /></>),
  wallet: (<><path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-3a2 2 0 0 1 0-4h4" /><path d="M3 5v14a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" /></>),
  users: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  message: (<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>),

  // ── Categories ──
  income: (<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.4" /><path d="M6 12h.01M18 12h.01" /></>),
  housing: (<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>),
  food: (<><path d="M4 3v7a3 3 0 0 0 6 0V3" /><path d="M7 10v11" /><path d="M17 3c-1.5 0-3 1.5-3 5v5h3z" /><path d="M17 13v8" /></>),
  groceries: (<><circle cx="8" cy="21" r="1.2" /><circle cx="18" cy="21" r="1.2" /><path d="M2 3h2.5l2.2 12.1a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.47-1.2L20 7H5.2" /></>),
  transport: (<><path d="M5 17h14l1-5-2-5H6L4 12z" /><circle cx="7.5" cy="17" r="1.8" /><circle cx="16.5" cy="17" r="1.8" /><path d="M4 12h16" /></>),
  shopping: (<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>),
  utilities: (<><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></>),
  insurance: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>),
  entertainment: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5" /></>),
  health: (<><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.7 0-3 .5-4.5 2-1.5-1.5-2.8-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" /></>),
  fitness: (<><path d="M6.5 6.5 17.5 17.5M21 21l-1-1M4 4l-1-1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7" /></>),
  business: (<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>),
  savings: (<><path d="M4 22h16M5 18v-7M9.5 18v-7M14.5 18v-7M19 18v-7M3.5 9 12 3l8.5 6z" /></>),
  other: (<><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><path d="M7.5 7.5h.01" /></>),

  // ── Features ──
  news: (<><path d="M4 19h16V5H4z" /><path d="M8 9h8M8 13h5" /><path d="M16 5V3H8v2" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>),
  stocks: (<><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></>),
  funds: (<><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>),
  networth: (<><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>),
  tax: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>),
  document: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></>),
  split: (<><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.172-2.828L3 3M21 3l-7.828 7.828A4 4 0 0 0 12 13.7V22" /></>),
  challenge: (<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>),
  sip: (<><path d="M12 20V10M18 20V4M6 20v-4" /></>),
  download: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>),
  refresh: (<><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></>),
};

/** Solid filled shapes for category / accent icons */
const FILLED_PATHS = {
  income: <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm8 3.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z" />,
  housing: <path d="M12 2.6 2.5 11.2H6v10.8h12V11.2h3.5L12 2.6zM10 20.2v-5.4h4v5.4H10z" />,
  food: <><path d="M6.5 2v9.2a2.5 2.5 0 0 0 5 0V2h-5z" /><path d="M15.5 2h2.5v9.2h2.5v2.2h-2.5v9.6h-2.5V2z" /></>,
  groceries: <path d="M7.1 20.3a2 2 0 1 1-.1-4 2 2 0 0 1 .1 4zm9.8 0a2 2 0 1 1-.1-4 2 2 0 0 1 .1 4zM2.5 3.5h3.2l2.4 11.5c.2.8.9 1.4 1.7 1.4h9c.8 0 1.5-.6 1.7-1.4l2.2-8.3H7.1" />,
  transport: <path d="M5.2 11.5 6.8 6h10.4l1.6 5.5H5.2zm-1.4 1.5h16.4a1 1 0 0 1 1 1v2.2a2.3 2.3 0 0 1-2.3 2.3h-1a2.3 2.3 0 0 1-2.3-2.3H9.5a2.3 2.3 0 0 1-2.3 2.3h-1A2.3 2.3 0 0 1 4 16.2v-2.2a1 1 0 0 1 1-1z" />,
  shopping: <path d="M6.5 3 4 7.2v13.3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.2L17.5 3H6.5zm3.3 4.8a3.2 3.2 0 0 0 6.4 0H9.8z" />,
  utilities: <path d="M13.2 2.2 3.8 14.5h7.1l-1 7.3 10.1-13.5h-7.1l.3-6.1z" />,
  insurance: <path d="M12 2.4 4 6.2v6.1c0 5.4 3.4 9.2 8 11.3 4.6-2.1 8-5.9 8-11.3V6.2L12 2.4z" />,
  entertainment: <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5V5.5zm8 4.3 7 4-7 4V9.8z" />,
  health: <path d="M12 21.5s-7.5-4.6-7.5-10.5C4.5 7.6 7.6 4.5 12 4.5s7.5 3.1 7.5 6.5S12 21.5 12 21.5z" />,
  fitness: <path d="M2 10.5h4.5l2-3.5 2.8 2.8L14 6.3l2.7 2.7 2-3.5H22v3h-4l-2 3.5-2.7-2.7-4.7 3.5-2.8-2.8-2 3.5H2v-3z" />,
  business: <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V8h2.5A1.5 1.5 0 0 1 22 9.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 20.5v-11A1.5 1.5 0 0 1 3.5 8H6V4.5z" />,
  savings: <path d="M4 21.5h16v-2H4v2zm1.5-4h2.8V10h3.5v7.5h2.8V10h3.5v7.5h2.9V8.5L12 3 5.5 8.5V17.5z" />,
  other: <path d="M12.1 2.8a2.5 2.5 0 0 0-2.1 1.2L4.2 4.5A2 2 0 0 0 2.5 6.8v7.3c0 .7.3 1.4.8 1.9l7.1 7.1a2.4 2.4 0 0 0 3.4 0l7.1-7.1c.5-.5.8-1.2.8-1.9V6.8a2 2 0 0 0-1.7-2.3l-5.8-.5zm-.6 5.7a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z" />,
  goals: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4.5a5.5 5.5 0 1 1-5.5 5.5A5.5 5.5 0 0 1 12 6.5z" />,
  alert: <path d="M12 2.2 1.8 19.5a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L12 2.2zm0 12.3a1.4 1.4 0 1 1-1.4-1.4 1.4 1.4 0 0 1 1.4 1.4zm-1.1-6h2.2l-.3 7H10.2l-.3-7z" />,
};

export default function Icon({ name, size = 18, stroke = 1.7, filled = false, className, style }) {
  const content = filled
    ? (FILLED_PATHS[name] || FILLED_PATHS.other)
    : (PATHS[name] || PATHS.other);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? 0 : stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {content}
    </svg>
  );
}
