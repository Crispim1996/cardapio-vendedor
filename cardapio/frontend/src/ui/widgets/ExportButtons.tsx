import React from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
// @ts-expect-error - no types bundled
import autoTable from "jspdf-autotable";
import type { IngredientItem, PricingInput, PricingResult, Product, Settings } from "../../lib/types";
import { brl, pct } from "../../lib/money";

function download(filename: string, blob: Blob){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExportButtons(props: {
  product: Product;
  items: IngredientItem[];
  pricing: PricingResult;
  input: PricingInput;
  settings: Settings;
}){
  const { product, items, pricing, input, settings } = props;

  const exportCSV = () => {
    const rows = items.map(i => ({
      insumo: i.name,
      unidade: i.unit,
      qtde_bruta: i.grossQty,
      fc: i.correctionFactor,
      qtde_liquida: i.netQty,
      valor_pago: i.paidValue,
      pacote_qtde: i.packageQty,
      pacote_unid: i.packageUnit,
      custo_unit: i.unitCost,
      custo_total: i.totalCost
    }));
    const csv = Papa.unparse(rows, { delimiter: ";" });
    download(`ficha_${product.code}_${product.name}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text(`Cardápio Vendedor • Ficha Técnica`, 40, 40);
    doc.setFontSize(11);
    doc.text(`${product.name} (cód ${product.code}) • ${product.category}`, 40, 62);
    doc.text(`Rendimento: ${product.yieldQty}`, 40, 78);

    const body = items.map(i => ([
      i.name,
      i.unit,
      String(i.grossQty),
      String(i.correctionFactor),
      String(i.netQty),
      brl(i.totalCost||0),
    ]));

    autoTable(doc, {
      startY: 98,
      head: [["Insumo","Unid","Bruta","FC","Líquida","Custo"]],
      body
    });

    const y = (doc as any).lastAutoTable.finalY + 18;
    doc.text(`Custo total produção: ${brl(pricing.productionTotal)}`, 40, y);
    doc.text(`Custo por porção: ${brl(pricing.unitCost)}`, 40, y + 16);
    doc.text(`Preço sugerido (por porção): ${brl(pricing.suggestedUnitPrice)}`, 40, y + 32);
    doc.text(`Margem desejada: ${pct(input.marginDesiredPct)} • Impostos: ${pct(settings.taxesPct)} • Fees: ${pct(settings.feesPct)}`, 40, y + 48);

    doc.save(`relatorio_${product.code}_${product.name}.pdf`);
  };

  return (
    <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
      <button className="btn" onClick={exportCSV}>Exportar CSV</button>
      <button className="btn" onClick={exportPDF}>Exportar PDF</button>
      <div className="small" style={{alignSelf:"center"}}>
        Exporta a ficha + principais resultados. (Você pode evoluir depois para relatório completo.)
      </div>
    </div>
  );
}
