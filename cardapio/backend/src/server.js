import express from "express";
import cors from "cors";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(express.json());

// OBS: aqui é só um esqueleto.
// Quando você ativar login, eu conecto Prisma + JWT e troco "localStorage" por API.

app.get("/health", (_, res) => res.json({ ok: true, name: "Cardapio Vendedor API" }));

// Exemplo de validação de payload (quando plugar o front):
const ProductSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  yieldQty: z.number().positive()
});

app.post("/products", (req, res) => {
  const parsed = ProductSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  // TODO: salvar no banco via Prisma
  res.status(201).json({ id: "TODO", ...parsed.data });
});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log("API on :" + port));
