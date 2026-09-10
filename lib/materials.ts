export const materialCategories = [
  { value: "CEMENT", label: "Cement" },
  { value: "STEEL_RODS", label: "Steel Rods & Reinforcement" },
  { value: "SAND", label: "Sand & Aggregates" },
  { value: "GRANITE", label: "Granite & Gravel" },
  { value: "BLOCKS", label: "Blocks & Bricks" },
  { value: "TIMBER", label: "Timber & Wood" },
  { value: "ROOFING", label: "Roofing Materials" },
  { value: "TILES", label: "Tiles & Flooring" },
  { value: "PAINT", label: "Paint & Coatings" },
  { value: "PLUMBING", label: "Plumbing Materials" },
  { value: "ELECTRICAL", label: "Electrical Materials" },
  { value: "DOORS_WINDOWS", label: "Doors & Windows" },
  { value: "FINISHING", label: "Finishing Materials" },
  { value: "HEAVY_EQUIPMENT", label: "Heavy Equipment" },
  { value: "OTHER", label: "Other" },
] as const;

export const materialCategoryLabels: Record<string, string> = Object.fromEntries(
  materialCategories.map((c) => [c.value, c.label])
);

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const formatMaterialPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
