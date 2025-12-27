import React from "react";
import type { DB } from "../../lib/storage";
import { brl, pct } from "../../lib/money";

export default function SettingsPage(props: { api: { db: DB; setDb:(d:DB)=>void } }){
  const { db, setDb } = props.api;
  const s = db.settings;

  const patch = (p: Partial<typeof s>) => setDb({ ...db, settings: { ...s, ...p } });

  return (
    <>
      <div className="hd">
        <div>
          <div style={{fontWeight:900}}>Configurações</div>
          <div className="small">Taxas padrão (impostos/fees), fixos e base de rateio</div>
        </div>
        <div className="badge">Preto + dourado/verde</div>
      </div>

      <div className="bd">
        <div className="row">
          <div className="field">
            <label>Impostos (%) — padrão 0%</label>
            <input className="input" type="number" min={0} max={95} value={Math.round((s.taxesPct||0)*100)} onChange={e=>patch({taxesPct: Math.max(0, Math.min(0.95, Number(e.target.value||0)/100))})} />
          </div>
          <div className="field">
            <label>Fees (%) — cartão/app/delivery (padrão 0%)</label>
            <input className="input" type="number" min={0} max={95} value={Math.round((s.feesPct||0)*100)} onChange={e=>patch({feesPct: Math.max(0, Math.min(0.95, Number(e.target.value||0)/100))})} />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Custos fixos mensais (R$)</label>
            <input className="input" type="number" min={0} value={s.fixedMonthly||0} onChange={e=>patch({fixedMonthly: Number(e.target.value||0)})} />
          </div>
          <div className="field">
            <label>Base de rateio: unidades/mês (editável)</label>
            <input className="input" type="number" min={1} value={s.fixedUnitsPerMonth||1000} onChange={e=>patch({fixedUnitsPerMonth: Math.max(1, Number(e.target.value||1000))})} />
            <div className="small">Rateio usado: fixos/mês ÷ unidades/mês × rendimento</div>
          </div>
        </div>

        <div className="hr" />
        <div className="kpis" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
          <div className="kpi">
            <div className="lbl">Impostos</div>
            <div className="val">{pct(s.taxesPct||0)}</div>
          </div>
          <div className="kpi">
            <div className="lbl">Fees</div>
            <div className="val">{pct(s.feesPct||0)}</div>
          </div>
          <div className="kpi">
            <div className="lbl">Fixo por unidade (rateio)</div>
            <div className="val">{brl((s.fixedMonthly||0) / Math.max(1, s.fixedUnitsPerMonth||1))}</div>
          </div>
        </div>

        <div className="hr" />
        <div className="small">
          ✅ Sem “xícara/colher”: eu deixei unidades só em <b>g, kg, ml, L, und</b>.<br/>
          ✅ Login ficou de fora agora (app só pra você), mas já deixei o projeto pronto pra evoluir depois.
        </div>
      </div>
    </>
  );
}
