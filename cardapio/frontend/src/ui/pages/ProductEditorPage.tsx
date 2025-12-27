import React, { useMemo, useState } from "react";
import type { DB } from "../../lib/storage";
import type { IngredientItem, Labor, PricingInput, Product, VariableCost } from "../../lib/types";
import { uid } from "../../lib/storage";
import { recalcIngredient, recalcLabor, calcPricing, suggestedMargins } from "../../lib/calc";
import { brl, pct } from "../../lib/money";
import SheetEditor from "../widgets/SheetEditor";
import ResultCards from "../widgets/ResultCards";
import Charts from "../widgets/Charts";
import StepPanel from "../widgets/StepPanel";
import ExportButtons from "../widgets/ExportButtons";

type Tab = "CADASTRO" | "FICHA" | "DESPESAS" | "PRECIFICACAO" | "RESULTADO";

export default function ProductEditorPage(props: { api: { db: DB; setDb:(d:DB)=>void; nav:(r:any)=>void }, productId: string }){
  const { db, setDb, nav } = props.api;
  const product = db.products.find(p => p.id === props.productId);

  const [tab, setTab] = useState<Tab>("RESULTADO");

  if (!product) return (
    <div className="bd">
      <div className="small">Produto não encontrado.</div>
      <button className="btn" onClick={()=>nav({name:"products"})}>Voltar</button>
    </div>
  );

  const items = db.ingredients.filter(i => i.productId === product.id);
  const labor = db.laborByProduct[product.id] || recalcLabor({ productId: product.id, hourlyRate: 0, minutes: 0, peopleCount: 1, totalCost: 0 });
  const variableCosts = db.variableCosts.filter(v => v.productId === product.id);

  const [input, setInput] = useState<PricingInput>(() => ({
    marginDesiredPct: 0.33,
    pricingMode: "PORCAO"
  }));

  const pricing = useMemo(() => calcPricing({
    items,
    labor,
    variableCosts,
    productYield: product.yieldQty,
    settings: db.settings,
    input
  }), [items, labor, variableCosts, product.yieldQty, db.settings, input]);

  const updateProduct = (patch: Partial<Product>) => {
    const now = new Date().toISOString();
    const updated = { ...product, ...patch, updatedAt: now };
    setDb({ ...db, products: db.products.map(p => p.id === product.id ? updated : p) });
  };

  const upsertItems = (nextItems: IngredientItem[]) => {
    const other = db.ingredients.filter(i => i.productId !== product.id);
    setDb({ ...db, ingredients: [...other, ...nextItems] });
  };

  const upsertLabor = (next: Labor) => {
    setDb({ ...db, laborByProduct: { ...db.laborByProduct, [product.id]: recalcLabor(next) } });
  };

  const upsertVariableCosts = (next: VariableCost[]) => {
    const other = db.variableCosts.filter(v => v.productId !== product.id);
    setDb({ ...db, variableCosts: [...other, ...next] });
  };

  const addSnapshot = () => {
    const snap = {
      id: uid("snap"),
      productId: product.id,
      createdAt: new Date().toISOString(),
      input,
      settings: db.settings,
      result: pricing
    };
    setDb({ ...db, snapshots: [snap, ...db.snapshots] });
    alert("Snapshot salvo no histórico ✅");
  };

  return (
    <>
      <div className="hd">
        <div>
          <div style={{fontWeight:900}}>{product.name} <span className="pill">cód {product.code}</span></div>
          <div className="small">{product.category} • rendimento: {product.yieldQty}</div>
        </div>
        <div style={{display:"flex", gap:10, flexWrap:"wrap", justifyContent:"flex-end"}}>
          <button className="btn" onClick={()=>nav({name:"products"})}>← Voltar</button>
          <button className="btn primary" onClick={addSnapshot}>Salvar snapshot</button>
        </div>
      </div>

      <div className="bd">
        <div className="tabs">
          {(["RESULTADO","PRECIFICACAO","FICHA","DESPESAS","CADASTRO"] as Tab[]).map(t => (
            <button key={t} className={"tab " + (tab===t ? "active":"")} onClick={()=>setTab(t)}>
              {t === "CADASTRO" ? "Cadastro" :
               t === "FICHA" ? "Ficha técnica" :
               t === "DESPESAS" ? "Despesas & Mão de obra" :
               t === "PRECIFICACAO" ? "Precificação" : "Resultado"}
            </button>
          ))}
        </div>

        <div className="hr" />

        {tab === "CADASTRO" && (
          <>
            <div className="row">
              <div className="field">
                <label>Código do produto</label>
                <input className="input" value={product.code} onChange={e=>updateProduct({code:e.target.value})}/>
              </div>
              <div className="field">
                <label>Categoria</label>
                <input className="input" value={product.category} onChange={e=>updateProduct({category:e.target.value})}/>
              </div>
            </div>

            <div className="field">
              <label>Nome / Descrição</label>
              <input className="input" value={product.name} onChange={e=>updateProduct({name:e.target.value})}/>
            </div>

            <div className="row">
              <div className="field">
                <label>Rendimento (porções/unidades produzidas)</label>
                <input className="input" type="number" min={1} value={product.yieldQty} onChange={e=>updateProduct({yieldQty: Math.max(1, Number(e.target.value||1))})}/>
              </div>
              <div className="field">
                <label>Data da última alteração</label>
                <input className="input" value={new Date(product.updatedAt).toLocaleString("pt-BR")} readOnly />
              </div>
            </div>

            <div className="field">
              <label>Observações</label>
              <textarea className="textarea" rows={4} value={product.notes||""} onChange={e=>updateProduct({notes:e.target.value})} />
            </div>

            <div style={{display:"flex", gap:10}}>
              <button className="btn" onClick={()=>setTab("DESPESAS")}>Ir para despesas</button>
              <button className="btn" onClick={()=>setTab("FICHA")}>Ir para ficha técnica</button>
            </div>
          </>
        )}

        {tab === "FICHA" && (
          <>
            <div className="small">Tabela editável estilo planilha (a parte “planilha” do app fica aqui).</div>
            <div className="hr" />
            <SheetEditor
              items={items}
              onChange={(next) => upsertItems(next.map(recalcIngredient))}
              productId={product.id}
            />
            <div className="hr" />
            <div className="kpis" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
              <div className="kpi">
                <div className="lbl">Custo ingredientes (total)</div>
                <div className="val">{brl(pricing.ingredientsTotal)}</div>
                <div className="sub">Somatório da ficha técnica</div>
              </div>
              <div className="kpi">
                <div className="lbl">Custo por porção</div>
                <div className="val">{brl(pricing.unitCost)}</div>
                <div className="sub">Já inclui variáveis, mão de obra e rateio</div>
              </div>
              <div className="kpi">
                <div className="lbl">Preço sugerido</div>
                <div className="val">{brl(pricing.suggestedUnitPrice)}</div>
                <div className="sub">por porção/unidade</div>
              </div>
            </div>
          </>
        )}

        {tab === "DESPESAS" && (
          <>
            <div className="row">
              <div>
                <div style={{fontWeight:800, marginBottom:8}}>Mão de obra</div>
                <div className="row">
                  <div className="field">
                    <label>Custo/hora (R$/h)</label>
                    <input className="input" type="number" min={0} value={labor.hourlyRate} onChange={e=>upsertLabor({...labor, hourlyRate:Number(e.target.value||0)})}/>
                  </div>
                  <div className="field">
                    <label>Tempo (min)</label>
                    <input className="input" type="number" min={0} value={labor.minutes} onChange={e=>upsertLabor({...labor, minutes:Number(e.target.value||0)})}/>
                  </div>
                </div>
                <div className="row">
                  <div className="field">
                    <label>Pessoas</label>
                    <input className="input" type="number" min={1} value={labor.peopleCount} onChange={e=>upsertLabor({...labor, peopleCount:Number(e.target.value||1)})}/>
                  </div>
                  <div className="field">
                    <label>Total mão de obra</label>
                    <input className="input" value={brl(pricing.laborTotal)} readOnly />
                  </div>
                </div>
              </div>

              <div>
                <div style={{fontWeight:800, marginBottom:8}}>Despesas variáveis</div>
                <div className="small">Ex.: embalagem, gás por receita, etiqueta, delivery por unidade…</div>
                <div className="hr" />
                {variableCosts.map(vc => (
                  <div key={vc.id} className="row" style={{alignItems:"end"}}>
                    <div className="field">
                      <label>Nome</label>
                      <input className="input" value={vc.name} onChange={e=>upsertVariableCosts(variableCosts.map(v=>v.id===vc.id?{...v,name:e.target.value}:v))}/>
                    </div>
                    <div className="field">
                      <label>Tipo</label>
                      <select className="select" value={vc.appliesTo} onChange={e=>upsertVariableCosts(variableCosts.map(v=>v.id===vc.id?{...v,appliesTo:e.target.value as any}:v))}>
                        <option value="UNIDADE">Por unidade</option>
                        <option value="RECEITA">Por receita</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Valor (R$)</label>
                      <input className="input" type="number" min={0} value={vc.value} onChange={e=>upsertVariableCosts(variableCosts.map(v=>v.id===vc.id?{...v,value:Number(e.target.value||0)}:v))}/>
                    </div>
                    <div style={{display:"flex", justifyContent:"flex-end"}}>
                      <button className="btn" onClick={()=>upsertVariableCosts(variableCosts.filter(v=>v.id!==vc.id))}>Remover</button>
                    </div>
                  </div>
                ))}
                <button className="btn" onClick={()=>upsertVariableCosts([...variableCosts, { id: uid("var"), productId: product.id, name: "Nova despesa variável", value: 0, appliesTo: "UNIDADE" }])}>
                  + Adicionar variável
                </button>

                <div className="hr" />
                <div className="kpi">
                  <div className="lbl">Total de variáveis (receita)</div>
                  <div className="val">{brl(pricing.variableTotal)}</div>
                  <div className="sub">Somando variáveis por receita + variáveis por unidade × rendimento</div>
                </div>
              </div>
            </div>

            <div className="hr" />
            <div className="small">Rateio fixos e taxas ficam em <b>Configurações</b>.</div>
          </>
        )}

        {tab === "PRECIFICACAO" && (
          <>
            <div className="row">
              <div className="field">
                <label>Margem de lucro desejada (%)</label>
                <input className="input" type="number" min={0} max={95} value={Math.round(input.marginDesiredPct*100)} onChange={e=>setInput({...input, marginDesiredPct: Math.max(0, Math.min(0.95, Number(e.target.value||0)/100))})}/>
                <div className="small">Taxas padrão (impostos/fees) estão 0% e você configura em Configurações.</div>
              </div>
              <div className="field">
                <label>Precificar por</label>
                <select className="select" value={input.pricingMode} onChange={e=>setInput({...input, pricingMode: e.target.value as any})}>
                  <option value="PORCAO">Por porção/unidade</option>
                  <option value="RECEITA_INTEIRA">Receita inteira</option>
                </select>
              </div>
            </div>

            <div className="hr" />

            <div style={{fontWeight:800, marginBottom:8}}>Sugestões rápidas</div>
            <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
              {suggestedMargins().map(s => (
                <button key={s.label} className="btn" onClick={()=>setInput({...input, marginDesiredPct: s.value})}>
                  {s.label}: {Math.round(s.value*100)}% <span className="small">• {s.hint}</span>
                </button>
              ))}
            </div>

            <div className="hr" />
            <div className="kpis" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
              <div className="kpi">
                <div className="lbl">Custo por porção</div>
                <div className="val">{brl(pricing.unitCost)}</div>
                <div className="sub">inclui fixos(rateio) + variáveis + mão de obra</div>
              </div>
              <div className="kpi">
                <div className="lbl">Markup (multiplicador)</div>
                <div className="val">{pricing.markup.toLocaleString("pt-BR",{maximumFractionDigits:3})}</div>
                <div className="sub">preço sugerido ÷ custo unitário</div>
              </div>
              <div className="kpi">
                <div className="lbl">Preço sugerido</div>
                <div className="val">{input.pricingMode==="PORCAO" ? brl(pricing.suggestedUnitPrice) : brl(pricing.suggestedRecipePrice)}</div>
                <div className="sub">{input.pricingMode==="PORCAO" ? "por porção/unidade" : "receita inteira"}</div>
              </div>
            </div>

            <div className="hr" />
            <StepPanel steps={pricing.steps} />
          </>
        )}

        {tab === "RESULTADO" && (
          <>
            <ResultCards product={product} pricing={pricing} input={input} />
            <div className="hr" />
            <Charts pricing={pricing} />
            <div className="hr" />
            <StepPanel steps={pricing.steps} />
            <div className="hr" />
            <ExportButtons product={product} items={items} pricing={pricing} input={input} settings={db.settings} />
          </>
        )}
      </div>
    </>
  );
}
