import React, { useMemo, useState } from "react";
import type { DB } from "../../lib/storage";
import { brl, pct } from "../../lib/money";

export default function ReportsPage(props: { api: { db: DB; setDb:(d:DB)=>void } }){
  const { db, setDb } = props.api;
  const [q, setQ] = useState("");

  const snaps = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return db.snapshots
      .filter(s => {
        if (!qq) return true;
        const p = db.products.find(x=>x.id===s.productId);
        const txt = (p?.name||"") + " " + (p?.code||"");
        return txt.toLowerCase().includes(qq);
      });
  }, [db.snapshots, db.products, q]);

  const clear = () => {
    if(confirm("Apagar todo o histórico de snapshots?")){
      setDb({ ...db, snapshots: [] });
    }
  };

  return (
    <>
      <div className="hd">
        <div>
          <div style={{fontWeight:900}}>Relatórios (Histórico)</div>
          <div className="small">Snapshots salvos por produto (evolução de preço e margens)</div>
        </div>
        <button className="btn" onClick={clear}>Limpar histórico</button>
      </div>

      <div className="bd">
        <div className="row">
          <div className="field">
            <label>Buscar produto</label>
            <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex.: Espeto, 500..." />
          </div>
          <div className="field">
            <label>Total de snapshots</label>
            <input className="input" value={`${snaps.length}`} readOnly />
          </div>
        </div>

        <div className="hr" />

        <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
          {snaps.map(s => {
            const p = db.products.find(x=>x.id===s.productId);
            return (
              <div key={s.id} className="kpi">
                <div className="lbl">{p?.name || "Produto"} • {new Date(s.createdAt).toLocaleString("pt-BR")}</div>
                <div className="val" style={{fontSize:18}}>
                  {brl(s.result.suggestedUnitPrice)} <span className="pill">por porção</span>
                </div>
                <div className="sub">
                  Margem desejada: {pct(s.input.marginDesiredPct)} • Markup: {s.result.markup.toLocaleString("pt-BR",{maximumFractionDigits:3})}
                </div>
                <div className="sub">
                  PE: {s.result.breakEvenUnits} un • {brl(s.result.breakEvenRevenue)}
                </div>
              </div>
            );
          })}
        </div>

        {snaps.length === 0 && <div className="small">Nenhum snapshot ainda. Abra um produto e clique em “Salvar snapshot”.</div>}
      </div>
    </>
  );
}
