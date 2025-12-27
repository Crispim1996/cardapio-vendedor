import React from "react";

export default function Sidebar(props: {
  route: any;
  nav: (r: any) => void;
}){
  const { route, nav } = props;
  const a = (name: string) => route.name === name ? "active" : "";
  return (
    <>
      <div className="hd">
        <div>
          <div style={{fontWeight:700}}>Menu</div>
          <div className="small">Web + mobile responsivo</div>
        </div>
      </div>
      <div className="nav">
        <a className={a("products")} href="#" onClick={(e)=>{e.preventDefault(); nav({name:"products"})}}>
          Produtos
        </a>
        <a className={a("reports")} href="#" onClick={(e)=>{e.preventDefault(); nav({name:"reports"})}}>
          Relatórios
        </a>
        <a className={a("settings")} href="#" onClick={(e)=>{e.preventDefault(); nav({name:"settings"})}}>
          Configurações
        </a>

        <div className="hr" />
        <div className="small">
          💡 Dica: a “planilha” fica só na <b>Ficha Técnica</b>. O resto é tudo em cards e telas.
        </div>
      </div>
    </>
  );
}
