import { uid } from "./storage";
import type { DB, } from "./storage";
import type { IngredientItem, Product, Labor, VariableCost } from "./types";
import { recalcIngredient, recalcLabor } from "./calc";

export function seedIfEmpty(db: DB): DB {
  if (db.products.length) return db;

  const now = new Date().toISOString();
  const product: Product = {
    id: uid("prod"),
    code: "500",
    name: "Espeto Baiano",
    category: "Prato Principal",
    yieldQty: 1,
    notes: "Exemplo pré-cadastrado",
    createdAt: now,
    updatedAt: now
  };

  const base = (name: string, unit: any, grossQty: number, fc: number, paidValue: number, packageQty: number, packageUnit: any): IngredientItem => {
    const item: IngredientItem = {
      id: uid("ing"),
      productId: product.id,
      name,
      unit,
      grossQty,
      correctionFactor: fc,
      netQty: 0,
      paidValue,
      packageQty,
      packageUnit,
      unitCost: 0,
      totalCost: 0
    };
    return recalcIngredient(item);
  };

  const items = [
    base("Filé mignon", "kg", 0.300, 1.00, 29.00, 1.0, "kg"),
    base("Queijo parmesão ralado", "kg", 0.140, 1.00, 23.95, 1.0, "kg"),
    base("Leite integral", "L", 0.200, 1.00, 2.45, 1.0, "L"),
    base("Farinha de trigo", "kg", 0.150, 1.00, 2.17, 1.0, "kg"),
    base("Banana da terra", "kg", 0.186, 1.86, 0.50, 1.0, "kg"),
    base("Ovo", "und", 2, 1.00, 0.33, 1, "und"),
  ];

  const labor: Labor = recalcLabor({
    productId: product.id,
    hourlyRate: 25,
    minutes: 15,
    peopleCount: 1,
    totalCost: 0
  });

  const variableCosts: VariableCost[] = [
    { id: uid("var"), productId: product.id, name: "Embalagem", value: 0.50, appliesTo: "UNIDADE" },
  ];

  return {
    ...db,
    products: [product],
    ingredients: items,
    variableCosts,
    laborByProduct: { [product.id]: labor }
  };
}
