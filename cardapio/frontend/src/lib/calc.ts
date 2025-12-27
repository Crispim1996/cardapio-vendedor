import type { IngredientItem, Labor, PricingInput, PricingResult, Settings, VariableCost } from "./types";
import { convertQty, toBase } from "./units";
import { round } from "./money";

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }

export function recalcIngredient(item: IngredientItem): IngredientItem {
  const fc = item.correctionFactor > 0 ? item.correctionFactor : 1;
  const netQty = item.grossQty / fc;

  // calcula unitCost baseado no pacote informado:
  // unitCost = paidValue / packageQty (convertendo para unidade base do item.unit)
  // Ex: paidValue=29.90, packageQty=1, packageUnit="kg", item.unit="g"
  // => custo por g
  let unitCost = 0;
  try {
    const pkgInItemUnit = convertQty(item.packageQty, item.packageUnit, item.unit);
    unitCost = pkgInItemUnit > 0 ? item.paidValue / pkgInItemUnit : 0;
  } catch {
    // se unidades incompatíveis, mantém 0
    unitCost = 0;
  }

  const totalCost = netQty * unitCost;

  return {
    ...item,
    correctionFactor: fc,
    netQty: round(netQty, 3),
    unitCost: round(unitCost, 6),
    totalCost: round(totalCost, 2)
  };
}

export function recalcLabor(labor: Labor): Labor {
  const hours = Math.max(0, labor.minutes) / 60;
  const people = Math.max(1, labor.peopleCount || 1);
  const total = Math.max(0, labor.hourlyRate) * hours * people;
  return { ...labor, peopleCount: people, totalCost: round(total, 2) };
}

export function calcPricing(args: {
  items: IngredientItem[];
  labor: Labor;
  variableCosts: VariableCost[];
  productYield: number;
  settings: Settings;
  input: PricingInput;
}): PricingResult {
  const yieldQty = Math.max(1, args.productYield || 1);
  const taxes = clamp01(args.settings.taxesPct || 0);
  const fees = clamp01(args.settings.feesPct || 0);
  const margin = clamp01(args.input.marginDesiredPct || 0);

  const ingredientsTotal = round(args.items.reduce((s, it) => s + (it.totalCost || 0), 0), 2);

  const laborTotal = round(args.labor.totalCost || 0, 2);

  // variáveis: valor por receita + valor por unidade * yield
  const variableRecipe = args.variableCosts
    .filter(v => v.appliesTo === "RECEITA")
    .reduce((s, v) => s + (v.value || 0), 0);

  const variableUnit = args.variableCosts
    .filter(v => v.appliesTo === "UNIDADE")
    .reduce((s, v) => s + (v.value || 0), 0) * yieldQty;

  const variableTotal = round(variableRecipe + variableUnit, 2);

  // rateio fixo (por receita) = (fixos/mês ÷ unidades/mês) * yield
  const fixedMonthly = Math.max(0, args.settings.fixedMonthly || 0);
  const fixedUnitsPerMonth = Math.max(1, args.settings.fixedUnitsPerMonth || 1);
  const fixedPerUnit = fixedMonthly / fixedUnitsPerMonth;
  const fixedAllocatedTotal = round(fixedPerUnit * yieldQty, 2);

  const productionTotal = round(ingredientsTotal + laborTotal + variableTotal + fixedAllocatedTotal, 2);
  const unitCost = round(productionTotal / yieldQty, 2);

  const denom = 1 - margin - taxes - fees;
  const suggestedUnitPrice = round(denom > 0 ? unitCost / denom : 0, 2);
  const suggestedRecipePrice = round(suggestedUnitPrice * yieldQty, 2);

  // markup (sobre custo unitário)
  const markup = unitCost > 0 ? round(suggestedUnitPrice / unitCost, 3) : 0;

  // custos variáveis por unidade (para MC): aqui considero como "variáveis por unidade" =
  // (ingredientes + mão de obra + variáveis) / yield  (fixos não entram na MC)
  const variablePerUnitForMC = round((ingredientsTotal + laborTotal + variableTotal) / yieldQty, 2);
  const contributionMarginValue = round(suggestedUnitPrice - variablePerUnitForMC, 2);
  const contributionMarginPct = suggestedUnitPrice > 0 ? round(contributionMarginValue / suggestedUnitPrice, 4) : 0;

  // ponto de equilíbrio mensal
  const breakEvenUnits = contributionMarginValue > 0 ? Math.ceil(fixedMonthly / contributionMarginValue) : 0;
  const breakEvenRevenue = round(breakEvenUnits * suggestedUnitPrice, 2);

  const steps = [
    { label: "Soma dos ingredientes", value: ingredientsTotal },
    { label: "Mão de obra (total)", value: laborTotal, note: `${args.labor.hourlyRate || 0}/h • ${args.labor.minutes || 0} min • pessoas: ${args.labor.peopleCount || 1}` },
    { label: "Despesas variáveis (receita)", value: variableTotal },
    { label: "Rateio de fixos (receita)", value: fixedAllocatedTotal, note: `fixos/mês ÷ unidades/mês × rendimento` },
    { label: "Custo total de produção", value: productionTotal },
    { label: "Custo por porção/unidade", value: unitCost, note: `custo total ÷ rendimento (${yieldQty})` },
    { label: "Preço sugerido (por porção)", value: suggestedUnitPrice, note: `custo ÷ (1 - margem - taxas)` },
  ];

  return {
    ingredientsTotal,
    laborTotal,
    variableTotal,
    fixedAllocatedTotal,
    productionTotal,
    unitCost,
    suggestedUnitPrice,
    suggestedRecipePrice,
    markup,
    contributionMarginValue,
    contributionMarginPct,
    breakEvenUnits,
    breakEvenRevenue,
    steps
  };
}

export function suggestedMargins(): { label: string; value: number; hint: string }[] {
  return [
    { label: "Conservador", value: 0.25, hint: "25% (boa para validar preço e ganhar giro)" },
    { label: "Padrão", value: 0.33, hint: "33% (equilíbrio saudável)" },
    { label: "Agressivo", value: 0.45, hint: "45% (premium / baixo volume)" },
  ];
}
