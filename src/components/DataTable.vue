<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  getSeriesMeta,
  getDatasetDisplayName,
} from "../utils/chartHelpers";
import { getProvinceScale } from "../services/pkrtAPI";

const props = defineProps({
  cards: { type: Array, default: () => [] },
  globalComponentOptions: { type: Array, default: () => [] },
  staticComponent: { type: String, default: "" },
  activeMappedSource: { type: String, default: "" },
  isPageBusy: { type: Boolean, default: false },
  // Wilayah aktif (cross-section): kode provinsi yang menjadi baris tabel.
  regionCodes: { type: Array, default: () => [] },
  regionLabels: { type: Object, default: () => ({}) },
  isAllRegions: { type: Boolean, default: true },
});

const emit = defineEmits(["update:static-component"]);

// ═══════════════════════════════════════
//  THEME SYSTEM — persisted via localStorage
// ═══════════════════════════════════════
const THEME_STORAGE_KEY = "dt-active-theme";

const themes = [
  {
    id: "midnight",
    name: "Midnight",
    icon: "🌙",
    tagline: "Dark & Sleek",
    preview: ["#0f172a", "#1e293b", "#3b82f6", "#60a5fa"],
    buttonStyle: "rounded",
    vars: {
      "--dt-bg": "#0f172a",
      "--dt-surface": "#1e293b",
      "--dt-surface-alt": "#162033",
      "--dt-border": "#334155",
      "--dt-text": "#f1f5f9",
      "--dt-text-dim": "#94a3b8",
      "--dt-accent": "#3b82f6",
      "--dt-accent-2": "#60a5fa",
      "--dt-accent-glow": "rgba(59,130,246,0.18)",
      "--dt-accent-text": "#93c5fd",
      "--dt-header-bg": "linear-gradient(135deg, #1e293b 0%, #1a2744 100%)",
      "--dt-frozen-bg": "#162033",
      "--dt-frozen-alt": "#131c2e",
      "--dt-hover": "rgba(59,130,246,0.09)",
      "--dt-chip-bg": "#1e3a5f",
      "--dt-chip-active": "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      "--dt-chip-text": "#93c5fd",
      "--dt-chip-active-text": "#fff",
      "--dt-toolbar-bg": "rgba(15,23,42,0.85)",
      "--dt-glow": "0 0 60px rgba(59,130,246,0.10)",
      "--dt-btn-radius": "10px",
      "--dt-chip-radius": "999px",
      "--dt-select-radius": "10px",
      "--dt-badge-bg": "rgba(59,130,246,0.15)",
      "--dt-dl-csv-bg": "#1e3a5f",
      "--dt-dl-csv-color": "#93c5fd",
      "--dt-dl-csv-border": "#3b82f6",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #065f46, #059669)",
      "--dt-dl-excel-color": "#fff",
      "--dt-table-radius": "16px",
      "--dt-row-glow": "none",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    icon: "🌊",
    tagline: "Deep & Vibrant",
    preview: ["#0c1222", "#0e2439", "#0891b2", "#22d3ee"],
    buttonStyle: "pill",
    vars: {
      "--dt-bg": "#051523",
      "--dt-surface": "#0a2035",
      "--dt-surface-alt": "#081a2c",
      "--dt-border": "#0e4d6b",
      "--dt-text": "#e0f7fa",
      "--dt-text-dim": "#4dd0e1",
      "--dt-accent": "#06b6d4",
      "--dt-accent-2": "#22d3ee",
      "--dt-accent-glow": "rgba(6,182,212,0.20)",
      "--dt-accent-text": "#67e8f9",
      "--dt-header-bg": "linear-gradient(135deg, #0a2035 0%, #0c2d44 100%)",
      "--dt-frozen-bg": "#081a2c",
      "--dt-frozen-alt": "#061523",
      "--dt-hover": "rgba(6,182,212,0.10)",
      "--dt-chip-bg": "#0a2d3d",
      "--dt-chip-active": "linear-gradient(135deg, #0369a1, #06b6d4)",
      "--dt-chip-text": "#67e8f9",
      "--dt-chip-active-text": "#fff",
      "--dt-toolbar-bg": "rgba(5,21,35,0.90)",
      "--dt-glow": "0 0 60px rgba(6,182,212,0.12)",
      "--dt-btn-radius": "999px",
      "--dt-chip-radius": "8px",
      "--dt-select-radius": "999px",
      "--dt-badge-bg": "rgba(6,182,212,0.15)",
      "--dt-dl-csv-bg": "#0a2d3d",
      "--dt-dl-csv-color": "#67e8f9",
      "--dt-dl-csv-border": "#06b6d4",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #0369a1, #0891b2)",
      "--dt-dl-excel-color": "#fff",
      "--dt-table-radius": "20px",
      "--dt-row-glow": "none",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    icon: "🌌",
    tagline: "Cosmic & Magical",
    preview: ["#1a0a2e", "#2d1b4e", "#a855f7", "#e879f9"],
    buttonStyle: "sharp",
    vars: {
      "--dt-bg": "#130820",
      "--dt-surface": "#1e1035",
      "--dt-surface-alt": "#190d2e",
      "--dt-border": "#4c1d95",
      "--dt-text": "#f5f0ff",
      "--dt-text-dim": "#c084fc",
      "--dt-accent": "#a855f7",
      "--dt-accent-2": "#e879f9",
      "--dt-accent-glow": "rgba(168,85,247,0.20)",
      "--dt-accent-text": "#d8b4fe",
      "--dt-header-bg": "linear-gradient(135deg, #1e1035 0%, #2e1060 100%)",
      "--dt-frozen-bg": "#190d2e",
      "--dt-frozen-alt": "#130820",
      "--dt-hover": "rgba(168,85,247,0.10)",
      "--dt-chip-bg": "#2e1060",
      "--dt-chip-active": "linear-gradient(135deg, #7c3aed, #c026d3)",
      "--dt-chip-text": "#d8b4fe",
      "--dt-chip-active-text": "#fff",
      "--dt-toolbar-bg": "rgba(19,8,32,0.90)",
      "--dt-glow": "0 0 80px rgba(168,85,247,0.14)",
      "--dt-btn-radius": "4px",
      "--dt-chip-radius": "4px",
      "--dt-select-radius": "4px",
      "--dt-badge-bg": "rgba(168,85,247,0.15)",
      "--dt-dl-csv-bg": "#2e1060",
      "--dt-dl-csv-color": "#d8b4fe",
      "--dt-dl-csv-border": "#a855f7",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #7c3aed, #a855f7)",
      "--dt-dl-excel-color": "#fff",
      "--dt-table-radius": "8px",
      "--dt-row-glow": "none",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    icon: "💎",
    tagline: "Rich & Natural",
    preview: ["#052e16", "#14532d", "#10b981", "#34d399"],
    buttonStyle: "leaf",
    vars: {
      "--dt-bg": "#031a0e",
      "--dt-surface": "#0b3320",
      "--dt-surface-alt": "#092a19",
      "--dt-border": "#14532d",
      "--dt-text": "#ecfdf5",
      "--dt-text-dim": "#6ee7b7",
      "--dt-accent": "#10b981",
      "--dt-accent-2": "#34d399",
      "--dt-accent-glow": "rgba(16,185,129,0.20)",
      "--dt-accent-text": "#34d399",
      "--dt-header-bg": "linear-gradient(135deg, #0b3320 0%, #0f4423 100%)",
      "--dt-frozen-bg": "#092a19",
      "--dt-frozen-alt": "#071f13",
      "--dt-hover": "rgba(16,185,129,0.10)",
      "--dt-chip-bg": "#0d3d22",
      "--dt-chip-active": "linear-gradient(135deg, #047857, #10b981)",
      "--dt-chip-text": "#6ee7b7",
      "--dt-chip-active-text": "#fff",
      "--dt-toolbar-bg": "rgba(3,26,14,0.90)",
      "--dt-glow": "0 0 60px rgba(16,185,129,0.10)",
      "--dt-btn-radius": "12px",
      "--dt-chip-radius": "6px",
      "--dt-select-radius": "12px",
      "--dt-badge-bg": "rgba(16,185,129,0.15)",
      "--dt-dl-csv-bg": "#0d3d22",
      "--dt-dl-csv-color": "#6ee7b7",
      "--dt-dl-csv-border": "#10b981",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #065f46, #10b981)",
      "--dt-dl-excel-color": "#fff",
      "--dt-table-radius": "14px",
      "--dt-row-glow": "none",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    icon: "🌅",
    tagline: "Warm & Fiery",
    preview: ["#1c0c0a", "#3b1510", "#f97316", "#fb923c"],
    buttonStyle: "glow",
    vars: {
      "--dt-bg": "#130704",
      "--dt-surface": "#260f09",
      "--dt-surface-alt": "#1f0c07",
      "--dt-border": "#7c2d12",
      "--dt-text": "#fff7ed",
      "--dt-text-dim": "#fdba74",
      "--dt-accent": "#f97316",
      "--dt-accent-2": "#fb923c",
      "--dt-accent-glow": "rgba(249,115,22,0.22)",
      "--dt-accent-text": "#fb923c",
      "--dt-header-bg": "linear-gradient(135deg, #260f09 0%, #3a1509 100%)",
      "--dt-frozen-bg": "#1f0c07",
      "--dt-frozen-alt": "#170904",
      "--dt-hover": "rgba(249,115,22,0.10)",
      "--dt-chip-bg": "#3a1509",
      "--dt-chip-active": "linear-gradient(135deg, #c2410c, #f97316)",
      "--dt-chip-text": "#fdba74",
      "--dt-chip-active-text": "#fff",
      "--dt-toolbar-bg": "rgba(19,7,4,0.90)",
      "--dt-glow": "0 0 80px rgba(249,115,22,0.14)",
      "--dt-btn-radius": "999px",
      "--dt-chip-radius": "999px",
      "--dt-select-radius": "999px",
      "--dt-badge-bg": "rgba(249,115,22,0.15)",
      "--dt-dl-csv-bg": "#3a1509",
      "--dt-dl-csv-color": "#fdba74",
      "--dt-dl-csv-border": "#f97316",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #ea580c, #f97316)",
      "--dt-dl-excel-color": "#fff",
      "--dt-table-radius": "18px",
      "--dt-row-glow": "none",
    },
  },
  {
    id: "frost",
    name: "Frost",
    icon: "❄️",
    tagline: "Clean & Crisp",
    preview: ["#f0f6ff", "#e2ecf9", "#2563eb", "#1d4ed8"],
    buttonStyle: "outline",
    vars: {
      "--dt-bg": "#eef4ff",
      "--dt-surface": "#ffffff",
      "--dt-surface-alt": "#f1f7ff",
      "--dt-border": "#bfcfe8",
      "--dt-text": "#0f172a",
      "--dt-text-dim": "#4a6080",
      "--dt-accent": "#2563eb",
      "--dt-accent-2": "#3b82f6",
      "--dt-accent-glow": "rgba(37,99,235,0.12)",
      "--dt-accent-text": "#1d4ed8",
      "--dt-header-bg": "linear-gradient(135deg, #dbeafe 0%, #e0eafc 100%)",
      "--dt-frozen-bg": "#e8f0fe",
      "--dt-frozen-alt": "#dde8fa",
      "--dt-hover": "rgba(37,99,235,0.05)",
      "--dt-chip-bg": "#dbeafe",
      "--dt-chip-active": "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      "--dt-chip-text": "#1e40af",
      "--dt-chip-active-text": "#fff",
      "--dt-toolbar-bg": "rgba(238,244,255,0.95)",
      "--dt-glow": "0 4px 30px rgba(37,99,235,0.07)",
      "--dt-btn-radius": "8px",
      "--dt-chip-radius": "6px",
      "--dt-select-radius": "8px",
      "--dt-badge-bg": "rgba(37,99,235,0.10)",
      "--dt-dl-csv-bg": "#dbeafe",
      "--dt-dl-csv-color": "#1e40af",
      "--dt-dl-csv-border": "#93c5fd",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #16a34a, #22c55e)",
      "--dt-dl-excel-color": "#fff",
      "--dt-table-radius": "12px",
      "--dt-row-glow": "none",
    },
  },
  {
    id: "neon",
    name: "Neon",
    icon: "⚡",
    tagline: "Cyber & Electric",
    preview: ["#000000", "#0d0d0d", "#00ff88", "#ff00aa"],
    buttonStyle: "neon",
    vars: {
      "--dt-bg": "#000000",
      "--dt-surface": "#0a0a0a",
      "--dt-surface-alt": "#060606",
      "--dt-border": "#1a1a1a",
      "--dt-text": "#e0ffe0",
      "--dt-text-dim": "#00cc66",
      "--dt-accent": "#00ff88",
      "--dt-accent-2": "#ff00aa",
      "--dt-accent-glow": "rgba(0,255,136,0.25)",
      "--dt-accent-text": "#00ff88",
      "--dt-header-bg": "linear-gradient(135deg, #0a0a0a 0%, #0d1a0d 100%)",
      "--dt-frozen-bg": "#050f05",
      "--dt-frozen-alt": "#030a03",
      "--dt-hover": "rgba(0,255,136,0.07)",
      "--dt-chip-bg": "#0a1f0a",
      "--dt-chip-active": "linear-gradient(135deg, #00aa55, #00ff88)",
      "--dt-chip-text": "#00ff88",
      "--dt-chip-active-text": "#000",
      "--dt-toolbar-bg": "rgba(0,0,0,0.95)",
      "--dt-glow": "0 0 60px rgba(0,255,136,0.12), 0 0 120px rgba(255,0,170,0.06)",
      "--dt-btn-radius": "2px",
      "--dt-chip-radius": "2px",
      "--dt-select-radius": "2px",
      "--dt-badge-bg": "rgba(0,255,136,0.12)",
      "--dt-dl-csv-bg": "#0a1f0a",
      "--dt-dl-csv-color": "#00ff88",
      "--dt-dl-csv-border": "#00ff88",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #00aa55, #00ff88)",
      "--dt-dl-excel-color": "#000",
      "--dt-table-radius": "4px",
      "--dt-row-glow": "none",
    },
  },
  {
    id: "rose",
    name: "Rose Gold",
    icon: "🌸",
    tagline: "Elegant & Luxurious",
    preview: ["#1a0a10", "#3b1220", "#f43f5e", "#fb7185"],
    buttonStyle: "elegant",
    vars: {
      "--dt-bg": "#120608",
      "--dt-surface": "#200a10",
      "--dt-surface-alt": "#1a070d",
      "--dt-border": "#6b1428",
      "--dt-text": "#fff1f2",
      "--dt-text-dim": "#fda4af",
      "--dt-accent": "#f43f5e",
      "--dt-accent-2": "#fb7185",
      "--dt-accent-glow": "rgba(244,63,94,0.22)",
      "--dt-accent-text": "#fda4af",
      "--dt-header-bg": "linear-gradient(135deg, #200a10 0%, #2e0d18 100%)",
      "--dt-frozen-bg": "#1a070d",
      "--dt-frozen-alt": "#14050a",
      "--dt-hover": "rgba(244,63,94,0.09)",
      "--dt-chip-bg": "#3b1220",
      "--dt-chip-active": "linear-gradient(135deg, #be123c, #f43f5e)",
      "--dt-chip-text": "#fda4af",
      "--dt-chip-active-text": "#fff",
      "--dt-toolbar-bg": "rgba(18,6,8,0.92)",
      "--dt-glow": "0 0 80px rgba(244,63,94,0.14)",
      "--dt-btn-radius": "999px",
      "--dt-chip-radius": "999px",
      "--dt-select-radius": "999px",
      "--dt-badge-bg": "rgba(244,63,94,0.15)",
      "--dt-dl-csv-bg": "#3b1220",
      "--dt-dl-csv-color": "#fda4af",
      "--dt-dl-csv-border": "#f43f5e",
      "--dt-dl-excel-bg": "linear-gradient(135deg, #9f1239, #f43f5e)",
      "--dt-dl-excel-color": "#fff",
      "--dt-table-radius": "20px",
      "--dt-row-glow": "none",
    },
  },
];

// Load persisted theme (survives tab switch / view change)
const savedTheme = typeof localStorage !== "undefined"
  ? localStorage.getItem(THEME_STORAGE_KEY)
  : null;
const activeThemeId = ref(
  savedTheme && themes.find((t) => t.id === savedTheme) ? savedTheme : "midnight"
);
const showThemePicker = ref(false);
const themeTransitioning = ref(false);

const activeTheme = computed(
  () => themes.find((t) => t.id === activeThemeId.value) ?? themes[0]
);

const themeStyle = computed(() => activeTheme.value.vars);

function selectTheme(id) {
  themeTransitioning.value = true;
  activeThemeId.value = id;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  }
  showThemePicker.value = false;
  setTimeout(() => { themeTransitioning.value = false; }, 500);
}

// Close dropdown on outside click
function onDocClick(e) {
  if (!e.target.closest(".dt-theme-wrapper")) {
    showThemePicker.value = false;
  }
}
onMounted(() => document.addEventListener("click", onDocClick));

// ═══════════════════════════════════════
//  FILTER STATE
// ═══════════════════════════════════════
const tablePeriod = ref("quarterly");
const rangeFromYear = ref("");
const rangeToYear = ref("");
const rangeFromSub = ref("");
const rangeToSub = ref("");
const specificFilter = ref([]);

const localComponent = computed({
  get: () => props.staticComponent,
  set: (val) => emit("update:static-component", val),
});

const tableIndicators = computed(() => props.cards ?? []);

// Indikator yang dipilih untuk ditampilkan datanya per provinsi.
const selectedTableIndicator = ref("");

watch(
  tableIndicators,
  (list) => {
    const exists = list.some(
      (ds) => String(ds.id) === String(selectedTableIndicator.value)
    );
    if (!exists) {
      selectedTableIndicator.value = list.length ? String(list[0].id) : "";
    }
  },
  { immediate: true }
);

const indicatorOptions = computed(() =>
  tableIndicators.value.map((ds) => ({
    value: String(ds.id),
    label: getDatasetDisplayName(ds),
  }))
);

const selectedIndicatorCard = computed(
  () =>
    tableIndicators.value.find(
      (ds) => String(ds.id) === String(selectedTableIndicator.value)
    ) ??
    tableIndicators.value[0] ??
    null
);

// Baris tabel = provinsi sesuai wilayah aktif.
const tableRegionCodes = computed(() =>
  props.regionCodes && props.regionCodes.length ? props.regionCodes : []
);

const allPeriodsForType = computed(() => {
  const periodSet = new Set();
  const card = selectedIndicatorCard.value;
  if (card) {
    const meta = getSeriesMeta(card, tablePeriod.value);
    (meta.periods ?? []).forEach((p) => periodSet.add(p));
  }
  return [...periodSet].sort();
});

const availableYears = computed(() => {
  const years = new Set();
  allPeriodsForType.value.forEach((p) => {
    const y = extractYear(p);
    if (y) years.add(y);
  });
  return [...years].sort();
});

watch(
  [tablePeriod, availableYears],
  () => {
    const yrs = availableYears.value;
    specificFilter.value = [];
    if (!yrs.length) {
      rangeFromYear.value = "";
      rangeToYear.value = "";
      rangeFromSub.value = "";
      rangeToSub.value = "";
      return;
    }
    rangeFromYear.value = yrs[0];
    rangeToYear.value = yrs[yrs.length - 1];
    if (tablePeriod.value === "monthly") {
      rangeFromSub.value = "1";
      rangeToSub.value = "12";
    } else if (tablePeriod.value === "quarterly") {
      rangeFromSub.value = "1";
      rangeToSub.value = "4";
    } else {
      rangeFromSub.value = "";
      rangeToSub.value = "";
    }
  },
  { immediate: true }
);

// ═══════════════════════════════════════
//  PERIOD HELPERS
// ═══════════════════════════════════════
function extractYear(period) {
  const m = String(period).match(/(\d{4})/);
  return m ? m[1] : null;
}
function extractQuarter(period) {
  const m = String(period).match(/Q(\d)/i);
  return m ? parseInt(m[1]) : 1;
}
function extractMonth(period) {
  const str = String(period);
  const mDash = str.match(/(\d{4})-(\d{2})/);
  if (mDash) return parseInt(mDash[2]);
  const mM = str.match(/(\d{4})M(\d{1,2})/i);
  if (mM) return parseInt(mM[2]);
  const names = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const lower = str.toLowerCase();
  for (let i = 0; i < names.length; i++) {
    if (lower.includes(names[i])) return i + 1;
  }
  return 1;
}

// ── Format monthly period label: "2018M1" → "Jan 2018" ──
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
function formatPeriodLabel(period) {
  if (tablePeriod.value === "monthly") {
    const year = extractYear(period);
    const month = extractMonth(period);
    if (year && month >= 1 && month <= 12) {
      return `${MONTH_ABBR[month - 1]} ${year}`;
    }
  }
  return period;
}

function periodInRange(period) {
  const year = extractYear(period);
  if (!year || !rangeFromYear.value || !rangeToYear.value) return true;
  const y = parseInt(year);
  const fromY = parseInt(rangeFromYear.value);
  const toY = parseInt(rangeToYear.value);
  if (tablePeriod.value === "yearly") return y >= fromY && y <= toY;
  if (tablePeriod.value === "quarterly") {
    const q = extractQuarter(period);
    const fromQ = parseInt(rangeFromSub.value || "1");
    const toQ = parseInt(rangeToSub.value || "4");
    const val = y * 10 + q;
    return val >= fromY * 10 + fromQ && val <= toY * 10 + toQ;
  }
  if (tablePeriod.value === "monthly") {
    const m = extractMonth(period);
    const fromM = parseInt(rangeFromSub.value || "1");
    const toM = parseInt(rangeToSub.value || "12");
    const val = y * 100 + m;
    return val >= fromY * 100 + fromM && val <= toY * 100 + toM;
  }
  return true;
}

function periodMatchesSpecific(period) {
  if (!specificFilter.value.length) return true;
  if (tablePeriod.value === "monthly") {
    return specificFilter.value.includes(String(extractMonth(period)));
  }
  if (tablePeriod.value === "quarterly") {
    return specificFilter.value.includes(String(extractQuarter(period)));
  }
  if (tablePeriod.value === "yearly") {
    return specificFilter.value.includes(extractYear(period));
  }
  return true;
}

function toggleSpecific(val) {
  const idx = specificFilter.value.indexOf(val);
  if (idx >= 0) specificFilter.value.splice(idx, 1);
  else specificFilter.value.push(val);
}
function clearSpecific() { specificFilter.value = []; }

const specificChipOptions = computed(() => {
  if (tablePeriod.value === "monthly") {
    return [
      { value: "1", label: "Jan" },{ value: "2", label: "Feb" },
      { value: "3", label: "Mar" },{ value: "4", label: "Apr" },
      { value: "5", label: "Mei" },{ value: "6", label: "Jun" },
      { value: "7", label: "Jul" },{ value: "8", label: "Agu" },
      { value: "9", label: "Sep" },{ value: "10", label: "Okt" },
      { value: "11", label: "Nov" },{ value: "12", label: "Des" },
    ];
  }
  if (tablePeriod.value === "quarterly") {
    return [
      { value: "1", label: "Q1" },{ value: "2", label: "Q2" },
      { value: "3", label: "Q3" },{ value: "4", label: "Q4" },
    ];
  }
  return availableYears.value.map((y) => ({ value: y, label: y }));
});

// ═══════════════════════════════════════
//  TABLE DATA
// ═══════════════════════════════════════
const filteredPeriods = computed(() =>
  allPeriodsForType.value.filter((p) => periodInRange(p) && periodMatchesSpecific(p))
);

const tableRows = computed(() => {
  const card = selectedIndicatorCard.value;
  if (!card) return [];

  const kode = String(card.apiCode ?? card.kode ?? "");
  const meta = getSeriesMeta(card, tablePeriod.value);
  const periods = meta.periods ?? [];
  const data = meta.data ?? [];
  const valMap = {};
  periods.forEach((p, i) => {
    valMap[p] = data[i] ?? null;
  });

  return tableRegionCodes.value.map((code) => {
    const factor = getProvinceScale(code, kode);
    const label = props.regionLabels[code] ?? String(code).toUpperCase();
    const values = filteredPeriods.value.map((p) => {
      const base = valMap[p];
      if (base === null || base === undefined || isNaN(base)) return null;
      return Number((Number(base) * factor).toFixed(2));
    });
    return { id: code, name: label, values };
  });
});

function fmtVal(v) {
  if (v === null || v === undefined) return "";
  return Number(v).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ═══════════════════════════════════════
//  SUB-PERIOD OPTIONS
// ═══════════════════════════════════════
const monthOptions = [
  { value: "1", label: "Jan" },{ value: "2", label: "Feb" },
  { value: "3", label: "Mar" },{ value: "4", label: "Apr" },
  { value: "5", label: "Mei" },{ value: "6", label: "Jun" },
  { value: "7", label: "Jul" },{ value: "8", label: "Agu" },
  { value: "9", label: "Sep" },{ value: "10", label: "Okt" },
  { value: "11", label: "Nov" },{ value: "12", label: "Des" },
];
const quarterOptions = [
  { value: "1", label: "Q1" },{ value: "2", label: "Q2" },
  { value: "3", label: "Q3" },{ value: "4", label: "Q4" },
];

// ═══════════════════════════════════════
//  DOWNLOAD — data only
// ═══════════════════════════════════════
function downloadCSV() {
  // Use formatted period labels for monthly, raw for others
  const periodLabels = filteredPeriods.value.map((p) =>
    tablePeriod.value === "monthly" ? formatPeriodLabel(p) : p
  );
  const headers = ["Provinsi", ...periodLabels];
  const lines = [
    headers.join(","),
    ...tableRows.value.map((row) =>
      [`"${row.name}"`, ...row.values.map((v) => (v === null ? "" : v))].join(",")
    ),
  ];
  downloadBlob(
    new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" }),
    `data-tabel-${tablePeriod.value}-${Date.now()}.csv`
  );
}

function downloadExcel() {
  const periodLabels = filteredPeriods.value.map((p) =>
    tablePeriod.value === "monthly" ? formatPeriodLabel(p) : p
  );
  const headers = ["Provinsi", ...periodLabels];
  // Clean neutral styling — no theme colors exported
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
th { background:#f0f4f8;color:#1a202c;font-weight:bold;font-size:11px;padding:6px 10px;text-align:center;border:1px solid #cbd5e0; }
td { font-size:11px;padding:4px 10px;color:#2d3748;background:#ffffff;border:1px solid #e2e8f0; }
tr:nth-child(even) td { background:#f7fafc; }
.ind { font-weight:bold;background:#edf2f7;min-width:200px;text-align:left; }
</style></head><body><table border="1">
<thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>`;
  tableRows.value.forEach((row) => {
    html += `<tr><td class="ind">${row.name}</td>${row.values
      .map((v) => `<td style="text-align:center">${v === null ? "" : v}</td>`)
      .join("")}</tr>`;
  });
  html += `</tbody></table></body></html>`;
  downloadBlob(
    new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    `data-tabel-${tablePeriod.value}-${Date.now()}.xls`
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="dt-root" :style="themeStyle" :class="[`dt-theme-${activeThemeId}`, { 'dt-transitioning': themeTransitioning }]">

    <!-- ═══ TOP BAR ═══ -->
    <div class="dt-topbar">
      <div class="dt-topbar-left">
        <h2 class="dt-title">
          <span class="dt-title-icon">📊</span>
          TABEL DATA
        </h2>
        <span class="dt-indicator-badge" v-if="tableRows.length">
          {{ tableRows.length }} provinsi
        </span>
      </div>

      <div class="dt-topbar-right">
        <!-- Theme toggle -->
        <div class="dt-theme-wrapper">
          <button
            type="button"
            class="dt-theme-toggle"
            @click.stop="showThemePicker = !showThemePicker"
            :title="'Tema: ' + activeTheme.name"
          >
            <span class="dt-theme-toggle-icon">{{ activeTheme.icon }}</span>
            <span class="dt-theme-toggle-label">{{ activeTheme.name }}</span>
            <span class="dt-theme-tagline">{{ activeTheme.tagline }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              :class="{ 'dt-chevron-open': showThemePicker }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <!-- Theme picker dropdown -->
          <Transition name="dt-dropdown">
            <div v-if="showThemePicker" class="dt-theme-dropdown" @click.stop>
              <div class="dt-theme-dropdown-header">
                <span class="dt-theme-dropdown-title">✨ Pilih Tema</span>
                <span class="dt-theme-dropdown-sub">{{ themes.length }} tema tersedia</span>
              </div>
              <div class="dt-theme-grid">
                <button
                  v-for="theme in themes"
                  :key="theme.id"
                  type="button"
                  class="dt-theme-card"
                  :class="{ active: activeThemeId === theme.id }"
                  @click="selectTheme(theme.id)"
                >
                  <div class="dt-theme-preview">
                    <div
                      v-for="(color, ci) in theme.preview"
                      :key="ci"
                      class="dt-theme-swatch"
                      :style="{ background: color }"
                    ></div>
                  </div>
                  <div class="dt-theme-card-label">
                    <span class="dt-theme-card-icon">{{ theme.icon }}</span>
                    <div class="dt-theme-card-info">
                      <span class="dt-theme-card-name">{{ theme.name }}</span>
                      <span class="dt-theme-card-tagline">{{ theme.tagline }}</span>
                    </div>
                  </div>
                  <div v-if="activeThemeId === theme.id" class="dt-theme-check">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Downloads -->
        <div class="dt-download-group">
          <button type="button" class="dt-dl-btn dt-dl-csv"
            :disabled="isPageBusy || !tableRows.length" @click="downloadCSV">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            CSV
          </button>
          <button type="button" class="dt-dl-btn dt-dl-excel"
            :disabled="isPageBusy || !tableRows.length" @click="downloadExcel">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Excel
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ FILTER BAR ═══ -->
    <div class="dt-filterbar">
      <div class="dt-fb-item">
        <label class="dt-fb-label">Komponen</label>
        <select v-model="localComponent" class="dt-fb-select dt-fb-komponen" :disabled="isPageBusy">
          <option value="" disabled>Pilih komponen</option>
          <option v-for="opt in globalComponentOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="dt-fb-item">
        <label class="dt-fb-label">Indikator</label>
        <select v-model="selectedTableIndicator" class="dt-fb-select dt-fb-komponen" :disabled="isPageBusy">
          <option v-for="opt in indicatorOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="dt-fb-item">
        <label class="dt-fb-label">Periode</label>
        <select v-model="tablePeriod" class="dt-fb-select" :disabled="isPageBusy">
          <option value="monthly">Bulanan</option>
          <option value="quarterly">Triwulanan</option>
          <option value="yearly">Tahunan</option>
        </select>
      </div>

      <div class="dt-fb-divider"></div>

      <div class="dt-fb-item">
        <label class="dt-fb-label">Dari</label>
        <div class="dt-fb-row">
          <select v-if="tablePeriod === 'monthly'" v-model="rangeFromSub"
            class="dt-fb-select dt-fb-sm" :disabled="isPageBusy">
            <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <select v-if="tablePeriod === 'quarterly'" v-model="rangeFromSub"
            class="dt-fb-select dt-fb-sm" :disabled="isPageBusy">
            <option v-for="q in quarterOptions" :key="q.value" :value="q.value">{{ q.label }}</option>
          </select>
          <select v-model="rangeFromYear" class="dt-fb-select dt-fb-year" :disabled="isPageBusy">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <div class="dt-fb-item">
        <label class="dt-fb-label">Sampai</label>
        <div class="dt-fb-row">
          <select v-if="tablePeriod === 'monthly'" v-model="rangeToSub"
            class="dt-fb-select dt-fb-sm" :disabled="isPageBusy">
            <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <select v-if="tablePeriod === 'quarterly'" v-model="rangeToSub"
            class="dt-fb-select dt-fb-sm" :disabled="isPageBusy">
            <option v-for="q in quarterOptions" :key="q.value" :value="q.value">{{ q.label }}</option>
          </select>
          <select v-model="rangeToYear" class="dt-fb-select dt-fb-year" :disabled="isPageBusy">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ═══ SPECIFIC PERIOD CHIPS ═══ -->
    <div class="dt-chips-bar" v-if="specificChipOptions.length && tableIndicators.length">
      <div class="dt-chips-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filter:
      </div>
      <div class="dt-chips-list">
        <button
          v-for="chip in specificChipOptions"
          :key="chip.value"
          type="button"
          class="dt-chip"
          :class="{ active: specificFilter.includes(chip.value) }"
          @click="toggleSpecific(chip.value)"
        >
          {{ chip.label }}
        </button>
      </div>
      <button
        v-if="specificFilter.length"
        type="button"
        class="dt-chips-clear"
        @click="clearSpecific"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Reset
      </button>
      <span v-if="specificFilter.length" class="dt-chips-count">
        {{ specificFilter.length }} dipilih
      </span>
    </div>

    <!-- ═══ LOADING ═══ -->
    <div v-if="isPageBusy" class="dt-loading">
      <div class="dt-loading-ring">
        <div></div><div></div><div></div>
      </div>
      <p>Memuat data...</p>
    </div>

    <!-- ═══ EMPTY ═══ -->
    <div v-else-if="!tableIndicators.length" class="dt-empty">
      <div class="dt-empty-icon">📋</div>
      <h3 class="dt-empty-title"><!-- Pilih Komponen --></h3>
      <p class="dt-empty-desc"><!-- Gunakan dropdown Komponen di atas untuk menampilkan data dalam bentuk tabel. --></p>
    </div>

    <!-- ═══ TABLE ═══ -->
    <div v-else class="dt-table-wrap">
      <table class="dt-table" :class="{ 'dt-few-cols': filteredPeriods.length <= 4 }">
        <thead>
          <tr>
            <th class="dt-th-frozen">Provinsi</th>
            <th v-for="period in filteredPeriods" :key="period" class="dt-th-period">
              {{ formatPeriodLabel(period) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIdx) in tableRows" :key="row.id"
            :class="{ 'dt-row-alt': rIdx % 2 === 1 }">
            <td class="dt-td-frozen" :title="row.name">{{ row.name }}</td>
            <td v-for="(val, cIdx) in row.values" :key="cIdx"
              class="dt-td-val" :class="{ 'dt-val-null': val === null }">
              {{ fmtVal(val) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════
   ROOT
   ═══════════════════════════════════════ */
.dt-root {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  background: var(--dt-bg);
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: var(--dt-glow);
  transition: background 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease;
  overflow: hidden;
}

.dt-transitioning * {
  transition-duration: 0.45s !important;
}

/* ═══ TOP BAR ═══ */
.dt-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--dt-border);
  transition: border-color 0.4s ease;
}

.dt-topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dt-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--dt-text);
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.4s ease;
}

.dt-title-icon { font-size: 18px; }

.dt-indicator-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--dt-accent-text);
  background: var(--dt-badge-bg);
  border: 1px solid var(--dt-accent);
  border-radius: 999px;
  padding: 3px 12px;
  letter-spacing: 0.04em;
  transition: all 0.4s ease;
}

.dt-topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ═══ THEME PICKER ═══ */
.dt-theme-wrapper { position: relative; }

.dt-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--dt-btn-radius);
  border: 1.5px solid var(--dt-border);
  background: var(--dt-surface);
  color: var(--dt-text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.dt-theme-toggle::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--dt-accent-glow);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.dt-theme-toggle:hover::before { opacity: 1; }
.dt-theme-toggle:hover {
  border-color: var(--dt-accent);
  box-shadow: 0 0 16px var(--dt-accent-glow);
  transform: translateY(-1px);
}

.dt-theme-toggle-icon { font-size: 15px; }
.dt-theme-toggle-label { font-size: 12px; font-weight: 700; }
.dt-theme-tagline {
  font-size: 9px;
  opacity: 0.6;
  font-weight: 500;
  display: none;
}

.dt-chevron-open { transform: rotate(180deg); transition: transform 0.2s ease; }

/* Dropdown */
.dt-theme-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 100;
  width: 340px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--dt-border);
  background: var(--dt-surface);
  box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
}

.dt-theme-dropdown-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 2px;
}

.dt-theme-dropdown-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--dt-text);
  letter-spacing: 0.04em;
}

.dt-theme-dropdown-sub {
  font-size: 10px;
  color: var(--dt-text-dim);
  font-weight: 500;
}

.dt-theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.dt-theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: var(--dt-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dt-theme-card:hover {
  border-color: var(--dt-accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.dt-theme-card.active {
  border-color: var(--dt-accent);
  box-shadow: 0 0 20px var(--dt-accent-glow);
  background: color-mix(in srgb, var(--dt-bg) 80%, var(--dt-accent) 20%);
}

.dt-theme-preview {
  display: flex;
  gap: 2px;
  height: 22px;
  border-radius: 6px;
  overflow: hidden;
}

.dt-theme-swatch { flex: 1; transition: background 0.3s ease; }

.dt-theme-card-label {
  display: flex;
  align-items: center;
  gap: 7px;
}

.dt-theme-card-icon { font-size: 14px; }

.dt-theme-card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.dt-theme-card-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--dt-text);
}

.dt-theme-card-tagline {
  font-size: 9px;
  color: var(--dt-text-dim);
  font-weight: 500;
}

.dt-theme-check {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dt-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.dt-dropdown-enter-active,
.dt-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dt-dropdown-enter-from,
.dt-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* ═══ DOWNLOAD BUTTONS ═══ */
.dt-download-group { display: flex; gap: 6px; }

.dt-dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 38px;
  padding: 0 15px;
  border-radius: var(--dt-btn-radius);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.dt-dl-csv {
  background: var(--dt-dl-csv-bg);
  border: 1.5px solid var(--dt-dl-csv-border);
  color: var(--dt-dl-csv-color);
}

.dt-dl-csv:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px var(--dt-accent-glow);
  filter: brightness(1.15);
}

.dt-dl-excel {
  background: var(--dt-dl-excel-bg);
  border: 1.5px solid transparent;
  color: var(--dt-dl-excel-color);
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
}

.dt-dl-excel:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  filter: brightness(1.1);
}

.dt-dl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
  filter: none !important;
}

/* ═══ FILTER BAR ═══ */
.dt-filterbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
  padding: 14px 0 12px;
}

.dt-fb-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dt-fb-label {
  font-size: 9px;
  color: var(--dt-text-dim);
  padding-left: 2px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  transition: color 0.4s ease;
}

.dt-fb-select {
  height: 36px;
  min-width: 100px;
  padding: 0 12px;
  border-radius: var(--dt-select-radius);
  border: 1.5px solid var(--dt-border);
  background: var(--dt-surface);
  color: var(--dt-text);
  font-size: 12px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: all 0.25s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.dt-fb-select:focus {
  border-color: var(--dt-accent);
  box-shadow: 0 0 0 3px var(--dt-accent-glow);
}

.dt-fb-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dt-fb-komponen { min-width: 180px; }
.dt-fb-sm { min-width: 72px; }
.dt-fb-year { min-width: 82px; }

.dt-fb-row { display: flex; gap: 5px; }

.dt-fb-divider {
  width: 1px;
  height: 36px;
  background: var(--dt-border);
  margin: 0 4px;
  align-self: flex-end;
  opacity: 0.5;
}

/* ═══ CHIPS ═══ */
.dt-chips-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0 12px;
  flex-wrap: wrap;
}

.dt-chips-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  color: var(--dt-text-dim);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: color 0.4s ease;
}

.dt-chips-list { display: flex; gap: 5px; flex-wrap: wrap; }

.dt-chip {
  height: 30px;
  padding: 0 14px;
  border-radius: var(--dt-chip-radius);
  border: 1.5px solid var(--dt-border);
  background: var(--dt-chip-bg);
  color: var(--dt-chip-text);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
  letter-spacing: 0.03em;
}

.dt-chip:hover {
  border-color: var(--dt-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--dt-accent-glow);
}

.dt-chip.active {
  background: var(--dt-chip-active);
  color: var(--dt-chip-active-text);
  border-color: transparent;
  box-shadow: 0 4px 16px var(--dt-accent-glow);
  transform: translateY(-1px);
}

.dt-chips-clear {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--dt-chip-radius);
  border: 1px dashed var(--dt-border);
  background: transparent;
  color: var(--dt-text-dim);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.03em;
}

.dt-chips-clear:hover {
  color: var(--dt-accent-text);
  border-color: var(--dt-accent);
}

.dt-chips-count {
  font-size: 10px;
  color: var(--dt-accent-text);
  font-weight: 800;
  background: var(--dt-accent-glow);
  padding: 2px 8px;
  border-radius: 999px;
}

/* ═══ LOADING ═══ */
.dt-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: var(--dt-text-dim);
  font-size: 13px;
  flex: 1;
}

.dt-loading-ring {
  width: 38px;
  height: 38px;
  position: relative;
}

.dt-loading-ring div {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: var(--dt-accent);
  border-radius: 50%;
  animation: dtRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.dt-loading-ring div:nth-child(1) { animation-delay: -0.45s; }
.dt-loading-ring div:nth-child(2) { animation-delay: -0.3s; opacity: 0.6; }
.dt-loading-ring div:nth-child(3) { animation-delay: -0.15s; opacity: 0.35; }

@keyframes dtRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ═══ EMPTY ═══ */
.dt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px 24px;
  text-align: center;
  flex: 1;
}

.dt-empty-icon { font-size: 44px; opacity: 0.45; }

.dt-empty-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--dt-text);
}

.dt-empty-desc {
  margin: 0;
  font-size: 13px;
  color: var(--dt-text-dim);
  max-width: 300px;
  line-height: 1.6;
}

/* ═══ TABLE ═══ */
.dt-table-wrap {
  flex: 1;
  overflow: auto;
  border: 1px solid var(--dt-border);
  border-radius: var(--dt-table-radius);
  background: var(--dt-surface);
  transition: all 0.4s ease;
}

.dt-table {
  border-collapse: separate;
  border-spacing: 0;
  width: max-content;
  min-width: 100%;
}

.dt-table.dt-few-cols {
  width: 100%;
  table-layout: fixed;
}

.dt-table.dt-few-cols .dt-th-frozen,
.dt-table.dt-few-cols .dt-td-frozen {
  width: 300px;
  min-width: 220px;
  max-width: 360px;
}

.dt-table.dt-few-cols .dt-th-period,
.dt-table.dt-few-cols .dt-td-val {
  width: auto;
  min-width: 120px;
}

/* Header */
.dt-th-frozen,
.dt-th-period {
  position: sticky;
  top: 0;
  z-index: 4;
  padding: 11px 14px;
  font-size: 11px;
  font-weight: 800;
  color: var(--dt-text);
  white-space: nowrap;
  text-align: left;
  background: var(--dt-header-bg);
  border-bottom: 2px solid var(--dt-accent);
  letter-spacing: 0.04em;
  transition: all 0.4s ease;
}

.dt-th-frozen {
  position: sticky;
  left: 0;
  z-index: 6;
  min-width: 240px;
  max-width: 360px;
  background: var(--dt-frozen-bg);
  border-right: 2px solid var(--dt-accent);
  text-align: center;
}

.dt-th-period {
  min-width: 100px;
  text-align: center;
}

/* Body */
.dt-td-frozen,
.dt-td-val {
  padding: 9px 14px;
  font-size: 12px;
  color: var(--dt-text);
  border-bottom: 1px solid color-mix(in srgb, var(--dt-border) 50%, transparent);
  white-space: nowrap;
  transition: background 0.15s ease;
}

.dt-td-frozen {
  position: sticky;
  left: 0;
  z-index: 3;
  font-weight: 600;
  font-size: 11px;
  background: var(--dt-frozen-bg);
  border-right: 2px solid var(--dt-accent);
  min-width: 240px;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dt-td-val {
  text-align: center;
  font-variant-numeric: tabular-nums;
  background: var(--dt-surface);
}

.dt-val-null {
  color: color-mix(in srgb, var(--dt-text-dim) 35%, transparent);
}

/* Alt row */
.dt-row-alt .dt-td-frozen { background: var(--dt-frozen-alt); }
.dt-row-alt .dt-td-val { background: var(--dt-surface-alt); }

/* Hover */
tbody tr:hover .dt-td-val {
  background: var(--dt-hover);
}

/* Frozen column on hover — must stay opaque and above scrolling cells */
tbody tr:hover .dt-td-frozen {
  background: var(--dt-frozen-bg);
  z-index: 5;
  box-shadow: 4px 0 8px -2px rgba(0, 0, 0, 0.15), inset 3px 0 0 var(--dt-accent);
}

/* Alt row frozen on hover — keep alt background opaque */
tbody tr.dt-row-alt:hover .dt-td-frozen {
  background: var(--dt-frozen-alt);
  z-index: 5;
}

tbody tr:last-child .dt-td-frozen,
tbody tr:last-child .dt-td-val {
  border-bottom: none;
}

/* ═══ THEME-SPECIFIC OVERRIDES ═══ */
/* Neon: glowing borders on header */
.dt-theme-neon .dt-th-frozen,
.dt-theme-neon .dt-th-period {
  text-shadow: 0 0 8px var(--dt-accent);
  border-bottom-color: var(--dt-accent);
}
.dt-theme-neon .dt-th-frozen {
  border-right-color: var(--dt-accent);
  box-shadow: 4px 0 12px rgba(0,255,136,0.08);
}
.dt-theme-neon .dt-indicator-badge {
  border-color: var(--dt-accent);
  box-shadow: 0 0 8px var(--dt-accent-glow);
}
.dt-theme-neon .dt-chip.active {
  box-shadow: 0 0 12px var(--dt-accent-glow);
  text-shadow: 0 0 6px rgba(0,255,136,0.5);
}
.dt-theme-neon .dt-dl-csv {
  box-shadow: 0 0 10px rgba(0,255,136,0.15);
}

/* Aurora: subtle star shimmer on header */
.dt-theme-aurora .dt-th-period {
  background: linear-gradient(180deg, #1e1035 0%, #2e1060 100%);
}

/* Rose: soft glow on frozen col */
.dt-theme-rose .dt-th-frozen {
  box-shadow: 4px 0 12px rgba(244,63,94,0.08);
}

/* Frost: no glow on buttons, clean shadows */
.dt-theme-frost .dt-theme-toggle:hover {
  box-shadow: 0 4px 16px rgba(37,99,235,0.15);
}
.dt-theme-frost .dt-table-wrap {
  box-shadow: 0 4px 24px rgba(37,99,235,0.07);
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .dt-root { padding: 12px 12px; border-radius: 14px; }
  .dt-th-frozen, .dt-td-frozen { min-width: 160px; max-width: 220px; }
  .dt-fb-select { min-width: 80px; height: 32px; font-size: 11px; }
  .dt-fb-komponen { min-width: 140px; }
  .dt-theme-toggle-label { display: none; }
  .dt-theme-tagline { display: none; }
  .dt-theme-dropdown { width: 280px; right: -20px; }
  .dt-theme-grid { grid-template-columns: 1fr 1fr; }
  .dt-table.dt-few-cols .dt-th-frozen,
  .dt-table.dt-few-cols .dt-td-frozen { width: 180px; min-width: 160px; max-width: 220px; }
}
</style>