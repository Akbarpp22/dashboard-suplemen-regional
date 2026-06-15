export const provinceOptions = [
  { label: "INDONESIA", value: "indonesia" },
  { label: "ACEH", value: "aceh" },
  { label: "SUMATERA UTARA", value: "sumut" },
  { label: "SUMATERA BARAT", value: "sumbar" },
  { label: "RIAU", value: "riau" },
  { label: "JAMBI", value: "jambi" },
  { label: "SUMATERA SELATAN", value: "sumsel" },
  { label: "BENGKULU", value: "bengkulu" },
  { label: "LAMPUNG", value: "lampung" },
  { label: "KEP. BANGKA BELITUNG", value: "babel" },
  { label: "KEP. RIAU", value: "kepri" },
  { label: "DKI JAKARTA", value: "dki" },
  { label: "JAWA BARAT", value: "jabar" },
  { label: "JAWA TENGAH", value: "jateng" },
  { label: "DI YOGYAKARTA", value: "diy" },
  { label: "JAWA TIMUR", value: "jatim" },
  { label: "BANTEN", value: "banten" },
  { label: "BALI", value: "bali" },
  { label: "NUSA TENGGARA BARAT", value: "ntb" },
  { label: "NUSA TENGGARA TIMUR", value: "ntt" },
  { label: "KALIMANTAN BARAT", value: "kalbar" },
  { label: "KALIMANTAN TENGAH", value: "kalteng" },
  { label: "KALIMANTAN SELATAN", value: "kalsel" },
  { label: "KALIMANTAN TIMUR", value: "kaltim" },
  { label: "KALIMANTAN UTARA", value: "kaltara" },
  { label: "SULAWESI UTARA", value: "sulut" },
  { label: "SULAWESI TENGAH", value: "sulteng" },
  { label: "SULAWESI SELATAN", value: "sulsel" },
  { label: "SULAWESI TENGGARA", value: "sultra" },
  { label: "GORONTALO", value: "gorontalo" },
  { label: "SULAWESI BARAT", value: "sulbar" },
  { label: "MALUKU", value: "maluku" },
  { label: "MALUKU UTARA", value: "malut" },
  { label: "PAPUA BARAT", value: "pabar" },
  { label: "PAPUA BARAT DAYA", value: "pbd" },
  { label: "PAPUA", value: "papua" },
  { label: "PAPUA SELATAN", value: "pasel" },
  { label: "PAPUA TENGAH", value: "pateng" },
  { label: "PAPUA PEGUNUNGAN", value: "papeg" },
];

// Daftar provinsi (tanpa "indonesia"/nasional) untuk mode wilayah.
export const provinceCodes = provinceOptions
  .filter((opt) => opt.value !== "indonesia")
  .map((opt) => opt.value);

// Batas pemilihan pada mode wilayah.
export const MAX_PROVINCE_SELECTION = 5;
export const MAX_INDICATOR_SELECTION = 5;

// [HIDDEN] Tombol 1Y, 5Y, 8Y disembunyikan sementara dari UI.
// Jangan hapus kode ini agar mudah diaktifkan kembali di masa depan.
// export const rangeButtons = [
//   { label: "1Y", value: "1Y" },
//   { label: "5Y", value: "5Y" },
//   { label: "8Y", value: "8Y" },
// ];
export const rangeButtons = [];

export const FILTER_OPTIONS = {
  measure: [
    { label: "Nilai", value: "nilai" },
    { label: "Pertumbuhan", value: "pertumbuhan" },
  ],
  monthlyMethods: [
    { label: "M to M", value: "mtom" },
    { label: "Y on Y", value: "yony" },
    { label: "Y to D", value: "ytod" },
  ],
  quarterlyMethods: [
    { label: "Q to Q", value: "qtoq" },
    { label: "Y on Y", value: "yony" },
    { label: "C to C", value: "ctoc" },
  ],
  staticPeriod: [
    { label: "Triwulanan", value: "quarterly" },
    { label: "Tahunan", value: "yearly" },
  ],
  staticQuarterlyMethods: [
    { label: "Q to Q", value: "qtoq" },
    { label: "Y on Y", value: "yony" },
    { label: "C to C", value: "ctoc" },
  ],
  chartTypes: [
    { label: "Line Chart", value: "line" },
    { label: "Bar Chart", value: "bar" },
  ],
  combineBarModes: [
    { label: "Mode Standar", value: "standard" },
    { label: "Mode Stack Bar", value: "stack" },
  ],
};

export const LOADING_STAGES = [
  {
    title: "Mengambil data...",
    subtitle: "Menghubungkan komponen dengan sumber data",
  },
  {
    title: "Menyusun grafik...",
    subtitle: "Menyiapkan tampilan chart dinamis dan statis",
  },
  {
    title: "Merapikan tampilan...",
    subtitle: "Menyelaraskan filter, card, dan visual akhir",
  },
];

export const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const palette = [
  { line: "#3B82F6", fill: "rgba(59,130,246,0.45)" },
  { line: "#F59E0B", fill: "rgba(245,158,11,0.45)" },
  { line: "#A855F7", fill: "rgba(168,85,247,0.45)" },
  { line: "#22C55E", fill: "rgba(34,197,94,0.45)" },
  { line: "#EF4444", fill: "rgba(239,68,68,0.45)" },
];

export const DATASET_COLOR_FAMILIES = [
  ["#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#FECACA"],
  ["#CA8A04", "#EAB308", "#FACC15", "#FDE047", "#FEF9C3"],
  ["#16A34A", "#22C55E", "#4ADE80", "#86EFAC", "#BBF7D0"],
  ["#1E3A8A", "#2563EB", "#3B82F6", "#93C5FD", "#DBEAFE"],
  ["#6B21A8", "#7C3AED", "#8B5CF6", "#C4B5FD", "#EDE9FE"],
];

export const TOTAL_BAR_COLOR = {
  line: "#14B8A6",
  fill: "rgba(20, 184, 166, 0.35)",
};