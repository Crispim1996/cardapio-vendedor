import React from "react";
import type { IngredientItem, Unit } from "../../lib/types";
import { uid } from "../../lib/storage";
import { brl } from "../../lib/money";

const UNITS: Unit[] = ["g","kg","ml","L","und"];

export default function SheetEditor(props: {
  items: IngredientItem[];
  onChange: (items: IngredientItem[]) => void;
  productId: string;
}){
  const { items, onChange, productId } = props;

  const set = (id: string, patch: Partial<IngredientItem>) => {
    onChange(items.map(it => it.id === id ? { ...it, ...patch } : it));
  };

  const add = () => {
    const it: IngredientItem = {
      id: uid("ing"),
      productId,
      name: "Novo insumo",
      unit: "g",
      grossQty: 0,
      correctionFactor: 1,
      netQty: 0,
      paidValue: 0,
      packageQty: 1000,
      packageUnit: "g",
      unitCost: 0,
      totalCost: 0
    };
    onChange([...items, it]);
  };

  const dup = (id: string) => {
    const src = items.find(i=>i.id===id);
    if(!src) return;
    const copy = { ...src, id: uid("ing"), name: src.name + " (cópia)" };
    onChange([...items, copy]);
  };

  const del = (id: string) => onChange(items.filter(i=>i.id!==id));

  const sum = items.reduce((s, it) => s + (it.totalCost||0), 0);

  return (
    <div className="tableWrap">
      <table className="sheet">
        <thead>
          <tr>
            <th style={{minWidth:240}}>Item insumo</th>
            <th style={{minWidth:90}}>Unid</th>
            <th style={{minWidth:110}}>Qtde bruta</th>
            <th style={{minWidth:90}}>FC</th>
            <th style={{minWidth:120}}>Qtde líquida</th>
            <th style={{minWidth:130}}>Valor pago (R$)</th>
            <th style={{minWidth:130}}>Pacote (qtde)</th>
            <th style={{minWidth:90}}>Pacote unid</th>
            <th style={{minWidth:140}}>Custo unit.</th>
            <th style={{minWidth:140}}>Custo total</th>
            <th style={{minWidth:210}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>
                <input className="cell" value={it.name} onChange={e=>set(it.id, {name:e.target.value})}/>
              </td>
              <td>
                <select className="cell" value={it.unit} onChange={e=>set(it.id, {unit: e.target.value as any})}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </td>
              <td><input className="cell" type="number" min={0} value={it.grossQty} onChange={e=>set(it.id, {grossQty:Number(e.target.value||0)})}/></td>
              <td><input className="cell" type="number" min={0.0001} step="0.01" value={it.correctionFactor} onChange={e=>set(it.id, {correctionFactor:Number(e.target.value||1)})}/></td>
              <td><input className="cell" value={it.netQty?.toLocaleString("pt-BR",{maximumFractionDigits:3})} readOnly /></td>
              <td><input className="cell" type="number" min={0} step="0.01" value={it.paidValue} onChange={e=>set(it.id, {paidValue:Number(e.target.value||0)})}/></td>
              <td><input className="cell" type="number" min={0.0001} value={it.packageQty} onChange={e=>set(it.id, {packageQty:Number(e.target.value||0)})}/></td>
              <td>
                <select className="cell" value={it.packageUnit} onChange={e=>set(it.id, {packageUnit: e.target.value as any})}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </td>
              <td><input className="cell" value={it.unitCost?.toLocaleString("pt-BR",{maximumFractionDigits:6})} readOnly /></td>
              <td><input className="cell" value={brl(it.totalCost||0)} readOnly /></td>
              <td style={{display:"flex", gap:8, alignItems:"center"}}>
                <button className="btn" onClick={()=>dup(it.id)}>Duplicar</button>
                <button className="btn" onClick={()=>del(it.id)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={8}>Total ingredientes</td>
            <td colSpan={3}>{brl(sum)}</td>
          </tr>
        </tfoot>
      </table>

      <div style={{padding:12, display:"flex", justifyContent:"space-between", gap:10, alignItems:"center"}}>
        <div className="small">Atalho: você pode tabular entre células e colar números rapidamente.</div>
        <button className="btn" onClick={add}>+ Adicionar linha</button>
      </div>
    </div>
  );
}
