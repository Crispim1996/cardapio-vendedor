export function brl(v: number): string {
  const n = Number.isFinite(v) ? v : 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function pct(v: number): string {
  const n = Number.isFinite(v) ? v : 0;
  return (n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
}
export function round(v: number, d = 2): number {
  const p = Math.pow(10, d);
  return Math.round((v + Number.EPSILON) * p) / p;
}
