export type Unit = "g" | "kg" | "ml" | "L" | "und";

export type PricingMode = "PORCAO" | "RECEITA_INTEIRA";

export type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  yieldQty: number; // porções / unidades produzidas
  notes?: string;
  photoDataUrl?: string;
  updatedAt: string; // ISO
  createdAt: string; // ISO
};

export type IngredientItem = {
  id: string;
  productId: string;
  name: string;
  unit: Unit; // unidade usada nas quantidades (gross/net)
  grossQty: number; // qtde bruta na unidade selecionada
  correctionFactor: number; // FC (>0)
  netQty: number; // calculado: gross/FC
  // compra
  paidValue: number; // preço pago pelo pacote
  packageQty: number; // tamanho do pacote (ex: 1000g, 1kg, 2000ml)
  packageUnit: Unit; // unidade do pacote
  unitCost: number; // custo por 1 unidade base (g/ml/und ou kg/L conforme regra)
  totalCost: number; // netQty * unitCost (com conversão)
};

export type VariableCost = {
  id: string;
  productId: string;
  name: string;
  value: number;
  appliesTo: "RECEITA" | "UNIDADE";
};

export type Labor = {
  productId: string;
  hourlyRate: number; // R$/h
  minutes: number;
  peopleCount: number;
  totalCost: number;
};

export type Settings = {
  currency: "BRL";
  taxesPct: number; // 0..1 (default 0)
  feesPct: number; // 0..1 (default 0)
  fixedMonthly: number; // custos fixos mensais
  fixedUnitsPerMonth: number; // base de rateio (editável)
};

export type PricingInput = {
  marginDesiredPct: number; // 0..1
  discountMaxPct?: number; // 0..1
  pricingMode: PricingMode;
};

export type PricingResult = {
  // custos
  ingredientsTotal: number;
  laborTotal: number;
  variableTotal: number; // por receita
  fixedAllocatedTotal: number; // rateio por receita (com base em yield e units/mês)
  productionTotal: number; // ingredientes + variáveis + mão de obra + fixos(rateio)
  unitCost: number; // por porção/unidade
  // preço
  suggestedUnitPrice: number;
  suggestedRecipePrice: number;
  markup: number; // multiplicador sobre custo unitário
  // margens
  contributionMarginValue: number; // R$ por porção
  contributionMarginPct: number; // sobre preço
  // ponto de equilíbrio (mensal)
  breakEvenUnits: number;
  breakEvenRevenue: number;
  // passos
  steps: { label: string; value: number; note?: string }[];
};

export type PricingSnapshot = {
  id: string;
  productId: string;
  createdAt: string;
  input: PricingInput;
  settings: Settings;
  result: PricingResult;
};
