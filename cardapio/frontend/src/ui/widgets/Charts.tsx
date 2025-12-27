import React, { useMemo } from "react";
import type { PricingResult } from "../../lib/types";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { brl } from "../../lib/money";

export default function Charts(props: { pricing: PricingResult }){
  const p = props.pricing;

  const data = useMemo(() => ([
    { name: "Ingredientes", value: p.ingredientsTotal },
    { name: "Mão de obra", value: p.laborTotal },
    { name: "Variáveis", value: p.variableTotal },
    { name: "Fixos (rateio)", value: p.fixedAllocatedTotal },
  ]), [p]);

  // Sem setar cor fixa global; mas precisamos de cores no pie (recharts exige).
  // Usei duas cores "premium" e duas neutras, sem expor como tema dominante.
  const COLORS = ["#d4af37","#10b981","#64748b","#94a3b8"];

  return (
    <div className="row">
      <div className="kpi" style={{gridColumn:"1 / -1"}}>
        <div className="lbl">Composição do custo (por receita)</div>
        <div className="sub">Clique no gráfico para visualizar a distribuição.</div>
        <div style={{height:260, marginTop:10}}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v:any)=>brl(Number(v)||0)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
