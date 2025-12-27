import React, { useMemo, useState } from "react";
import type { DB } from "../../lib/storage";
import { uid } from "../../lib/storage";
import type { Product } from "../../lib/types";

export default function ProductsPage(props: { api: { db: DB; setDb: (d: DB)=>void; nav: (r:any)=>void } }){
  const { db, setDb, nav } = props.api;
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return db.products
      .filter(p => !qq || (p.name + " " + p.code + " " + p.category).toLowerCase().includes(qq))
      .sort((a,b)=> (b.updatedAt||"").localeCompare(a.updatedAt||""));
  }, [db.products, q]);

  const create = () => {
    const now = new Date().toISOString();
    const p: Product = {
      id: uid("prod"),
      code: String(Math.floor(100 + Math.random()*900)),
      name: "Novo Produto",
      category: "Prato Principal",
      yieldQty: 1,
      notes: "",
      createdAt: now,
      updatedAt: now
    };
    setDb({ ...db, products: [p, ...db.products] });
    nav({ name: "product", productId: p.id });
  };

  return (
    <>
      <div className="hd">
        <div>
          <div style={{fontWeight:800}}>Produtos</div>
          <div className="small">Lista, busca, filtros e acesso ao editor</div>
        </div>
        <div style={{display:"flex", gap:10}}>
          <button className="btn" onClick={create}>+ Novo produto</button>
        </div>
      </div>

      <div className="bd">
        <div className="row">
          <div className="field">
            <label>Buscar</label>
            <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex.: espeto, 500, prato principal..." />
          </div>
          <div className="field">
            <label>Total</label>
            <input className="input" value={`${items.length} produto(s)`} readOnly />
          </div>
        </div>

        <div className="hr" />

        <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
          {items.map(p => (
            <div key={p.id} className="kpi" style={{cursor:"pointer"}} onClick={()=>nav({name:"product", productId: p.id})}>
              <div style={{display:"flex", justifyContent:"space-between", gap:10}}>
                <div>
                  <div className="lbl">{p.category} • cód {p.code}</div>
                  <div className="val" style={{fontSize:18}}>{p.name}</div>
                  <div className="sub">Rendimento: {p.yieldQty} • Atualizado: {new Date(p.updatedAt).toLocaleDateString("pt-BR")}</div>
                </div>
                <div className="pill">Abrir</div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && <div className="small">Nada encontrado.</div>}
      </div>
    </>
  );
}
