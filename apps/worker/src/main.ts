import { hostname } from "node:os";
import { createClient } from "@supabase/supabase-js";
import { runOnce, type Handler, type JobKind } from "./worker.ts";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.example).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const workerId = process.env.WORKER_ID || `${hostname()}-${process.pid}`;

// Les handlers arrivent avec chaque jalon (M1 : ingest_source…). Aucun handler factice ici.
const handlers: Partial<Record<JobKind, Handler>> = {};

let stopping = false;
process.on("SIGTERM", () => (stopping = true));
process.on("SIGINT", () => (stopping = true));

console.log(`worker ${workerId} démarré, types gérés : ${Object.keys(handlers).join(", ") || "aucun"}`);
while (!stopping) {
  try {
    const id = await runOnce(db, workerId, handlers);
    if (!id) await new Promise((r) => setTimeout(r, 2000)); // file vide : attente courte
  } catch (e) {
    console.error("erreur de boucle", e);
    await new Promise((r) => setTimeout(r, 5000));
  }
}
console.log("worker arrêté proprement");
