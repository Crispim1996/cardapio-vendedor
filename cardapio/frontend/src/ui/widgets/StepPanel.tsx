import React from "react";
import { brl } from "../../lib/money";

export default function StepPanel(props: { steps: {label:string; value:number; note?:string}[] }){
  return (
    <div className="kpi" style={{gridColumn:"1 / -1"}}>
      <div className="lbl">Como eu cheguei nesse preço</div>
      <div className="hr" />
      <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:10}}>
        {props.steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div>
              <div style={{fontWeight:700}}>{s.label}</div>
              {s.note && <div className="small">{s.note}</div>}
            </div>
            <div style={{fontFamily:"var(--mono)"}}>{brl(s.value)}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
