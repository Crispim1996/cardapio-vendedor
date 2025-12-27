import React from "react";
import type { PricingInput, PricingResult, Product } from "../../lib/types";
import { brl, pct } from "../../lib/money";

export default function ResultCards(props: { product: Product; pricing: PricingResult; input: PricingInput }){
  const { pricing, input } = props;
  const price = input.pricingMode === "PORCAO" ? pricing.suggestedUnitPrice : pricing.suggestedRecipePrice;

  return (
    <div className="kpis">
      <div className="kpi">
        <div className="lbl">Preço sugerido</div>
        <div className="val">{brl(price)}</div>
        <div className="sub">{input.pricingMode==="PORCAO" ? "por porção/unidade" : "receita inteira"}</div>
      </div>

      <div className="kpi">
        <div className="lbl">Custo por porção</div>
        <div className="val">{brl(pricing.unitCost)}</div>
        <div className="sub">custo total ÷ rendimento</div>
      </div>

      <div className="kpi">
        <div className="lbl">Margem de contribuição</div>
        <div className="val">{brl(pricing.contributionMarginValue)}</div>
        <div className="sub">{pct(pricing.contributionMarginPct)} sobre o preço</div>
      </div>

      <div className="kpi">
        <div className="lbl">Ponto de equilíbrio (mês)</div>
        <div className="val">{pricing.breakEvenUnits} un</div>
        <div className="sub">{brl(pricing.breakEvenRevenue)} em receita</div>
      </div>
    </div>
  );
}
