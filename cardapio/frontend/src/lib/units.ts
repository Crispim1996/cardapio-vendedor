import type { Unit } from "./types";

export function toBase(u: Unit): { base: "g"|"ml"|"und"|"kg"|"L"; factor: number } {
  // base usada para cálculo interno:
  // - g (para g/kg)
  // - ml (para ml/L)
  // - und (para und)
  // Retornamos fator para converter unidade -> base interna.
  if (u === "g") return { base: "g", factor: 1 };
  if (u === "kg") return { base: "g", factor: 1000 };
  if (u === "ml") return { base: "ml", factor: 1 };
  if (u === "L") return { base: "ml", factor: 1000 };
  return { base: "und", factor: 1 };
}

export function convertQty(qty: number, from: Unit, to: Unit): number {
  const a = toBase(from);
  const b = toBase(to);
  if (a.base !== b.base) throw new Error(`Unidades incompatíveis: ${from} -> ${to}`);
  const qtyInBase = qty * a.factor;
  return qtyInBase / b.factor;
}
