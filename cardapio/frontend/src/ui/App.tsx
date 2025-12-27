import React, { useMemo, useState } from "react";
import { loadDB, saveDB } from "../lib/storage";
import { seedIfEmpty } from "../lib/seed";
import type { DB, } from "../lib/storage";
import Sidebar from "./Sidebar";
import ProductsPage from "./pages/ProductsPage";
import ProductEditorPage from "./pages/ProductEditorPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

type Route =
  | { name: "products" }
  | { name: "product"; productId: string }
  | { name: "reports" }
  | { name: "settings" };

export default function App(){
  const [db, setDb] = useState<DB>(() => seedIfEmpty(loadDB()));
  const [route, setRoute] = useState<Route>({ name: "products" });

  const api = useMemo(() => ({
    db,
    setDb: (next: DB) => { setDb(next); saveDB(next); },
    nav: setRoute
  }), [db]);

  return (
    <>
      <div className="topbar">
        <div className="brand container">
          <div className="logo" />
          <div style={{flex:1}}>
            <h1>Cardápio Vendedor <span className="badge">Beta local (sem login)</span></h1>
            <small>Precificação premium: ficha técnica estilo planilha + cards e dashboards</small>
          </div>
          <button className="btn ghost" onClick={() => {
            if(confirm("Isso vai apagar os dados locais e re-criar o exemplo. Continuar?")){
              const fresh = seedIfEmpty({
                products: [],
                ingredients: [],
                variableCosts: [],
                laborByProduct: {},
                settings: db.settings,
                snapshots: []
              });
              api.setDb(fresh);
              api.nav({ name: "products" });
            }
          }}>Reset demo</button>
        </div>
      </div>

      <div className="container" style={{marginTop: 14}}>
        <div className="grid">
          <div className="card">
            <Sidebar route={route} nav={setRoute} />
          </div>

          <div className="card">
            {route.name === "products" && (
              <ProductsPage api={api} />
            )}
            {route.name === "product" && (
              <ProductEditorPage api={api} productId={route.productId} />
            )}
            {route.name === "reports" && (
              <ReportsPage api={api} />
            )}
            {route.name === "settings" && (
              <SettingsPage api={api} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
