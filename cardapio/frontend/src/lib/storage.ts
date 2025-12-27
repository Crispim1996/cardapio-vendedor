import type { IngredientItem, Labor, PricingSnapshot, Product, Settings, VariableCost } from "./types";

const KEY = "cvdb_v1";

export type DB = {
  products: Product[];
  ingredients: IngredientItem[];
  variableCosts: VariableCost[];
  laborByProduct: Record<string, Labor>;
  settings: Settings;
  snapshots: PricingSnapshot[];
};

export const defaultSettings: Settings = {
  currency: "BRL",
  taxesPct: 0,
  feesPct: 0,
  fixedMonthly: 0,
  fixedUnitsPerMonth: 1000
};

export function loadDB(): DB {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {
    products: [],
    ingredients: [],
    variableCosts: [],
    laborByProduct: {},
    settings: defaultSettings,
    snapshots: []
  };
  try {
    const parsed = JSON.parse(raw) as DB;
    return {
      products: parsed.products || [],
      ingredients: parsed.ingredients || [],
      variableCosts: parsed.variableCosts || [],
      laborByProduct: parsed.laborByProduct || {},
      settings: parsed.settings || defaultSettings,
      snapshots: parsed.snapshots || []
    };
  } catch {
    return {
      products: [],
      ingredients: [],
      variableCosts: [],
      laborByProduct: {},
      settings: defaultSettings,
      snapshots: []
    };
  }
}

export function saveDB(db: DB): void {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function uid(prefix="id"): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
