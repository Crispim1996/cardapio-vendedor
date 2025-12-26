# Cardápio Vendedor (web + mobile responsivo)

Tema premium **preto + dourado/verde**, com UX em **cards** e **a “planilha” só na Ficha Técnica**.

> Versão inicial **sem login** (feito pra você usar sozinha).  
> Próximo passo: adicionar autenticação e sincronização em nuvem.

---

## O que o app faz (MVP)

- Cadastro de produto/receita (código, nome, categoria, rendimento, observações)
- **Ficha técnica estilo planilha** (colunas) com:
  - Unidade: **g, kg, ml, L, und**
  - Qtde bruta, FC, líquida automática
  - Valor pago + **tamanho do pacote** (pra calcular custo unitário corretamente)
  - Custo total por item e total da ficha
- Mão de obra (R$/h, minutos, pessoas)
- Despesas variáveis (por unidade ou por receita)
- Configurações:
  - Impostos (%) e fees (%) (padrão 0)
  - Fixos mensais + base de rateio (unidades/mês, editável)
- Precificação:
  - margem desejada
  - preço sugerido por porção **e** por receita inteira
  - markup, margem de contribuição, ponto de equilíbrio
  - painel “Como eu cheguei nesse preço”
- **Snapshots** (histórico) + tela de relatórios
- Exportação **CSV** e **PDF**

---

## Fórmulas (resumo)

- `Qtde Líquida = Qtde Bruta / FC`
- `Custo unitário = Valor pago / Pacote (convertido para a unidade do item)`
- `Custo total item = Qtde Líquida × Custo unitário`
- `Rateio fixos (por receita) = (Fixos/mês ÷ Unidades/mês) × Rendimento`
- `Custo total produção = Ingredientes + Variáveis + Mão de obra + Rateio`
- `Custo por unidade = Custo total / Rendimento`
- `Preço sugerido (por unidade) = Custo por unidade / (1 - margem - impostos - fees)`
- `MC (R$) = Preço - (Ingredientes+MO+Variáveis)/Rendimento`
- `PE (unid/mês) = Fixos mensais / MC(R$ por unidade)`

---

## Rodar o FRONTEND (web)

Pré-requisitos: Node 18+

```bash
cd frontend
npm install
npm run dev
```

Abra: http://localhost:5173

> Ele salva tudo em `localStorage` (modo offline simples).

---

## Mobile (opcional)

Esse front pode virar app iOS/Android com Capacitor:

```bash
npm i -D @capacitor/cli @capacitor/core
npx cap init
npx cap add android
npx cap add ios
npx cap sync
```

(ou você pode preferir Flutter depois — mas pra MVP eu manteria React + PWA/Capacitor)

---

## Backend (opcional, para quando tiver login)

Pasta `backend/` tem:
- Prisma schema (Postgres)
- Esqueleto Express

Quando for ligar:
1) criar Postgres
2) setar `DATABASE_URL`
3) `npm i` e `npx prisma migrate dev`
4) implementar endpoints CRUD + JWT

---

## Próximas melhorias (validação do app)

- Atalhos de teclado “planilha real” (setas, enter, copy/paste avançado)
- Importação de CSV de insumos
- Catálogo global de insumos (pra reaproveitar entre receitas)
- Foto do produto na capa + PDF mais bonito
- Gráfico de evolução de preço por produto (a partir dos snapshots)
- Login (somente depois que você aprovar o MVP)

---

Feito para a Chef/Kaah 💛💚
