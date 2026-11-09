// Connecteur d'embeddings (1024 dimensions, figées par le schéma `halfvec(1024)`).
// Fournisseur et modèle viennent de la configuration : aucun nom de modèle codé en dur (décision D1).
// Sans clé : la recherche fonctionne en plein texte seul, et c'est journalisé (pas de faux vecteurs).
export const EMBEDDING_DIM = 1024;

export type Embedder = { model: string; embed: (texts: string[]) => Promise<number[][]> };

export function embedderFromEnv(env = process.env): Embedder | null {
  const key = env.EMBEDDINGS_API_KEY;
  const model = env.EMBEDDINGS_MODEL;
  const provider = env.EMBEDDINGS_PROVIDER;
  if (!key || !model || !provider) return null;
  if (provider !== "voyage" && provider !== "mistral") throw new Error(`EMBEDDINGS_PROVIDER inconnu : ${provider}`);
  const endpoint = provider === "voyage" ? "https://api.voyageai.com/v1/embeddings" : "https://api.mistral.ai/v1/embeddings";

  return {
    model: `${provider}:${model}`,
    async embed(texts) {
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += 64) {
        const batch = texts.slice(i, i + 64);
        const body = provider === "voyage"
          ? { model, input: batch, input_type: "document", output_dimension: EMBEDDING_DIM }
          : { model, input: batch };
        let res: Response | undefined;
        for (let attempt = 0; attempt < 4; attempt++) {
          res = await fetch(endpoint, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(body) });
          if (res.status !== 429 && res.status < 500) break;
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        }
        if (!res?.ok) throw new Error(`embeddings_http_${res?.status}`);
        const json = (await res.json()) as { data: { embedding: number[] }[] };
        for (const d of json.data) {
          if (d.embedding.length !== EMBEDDING_DIM) throw new Error(`dimension ${d.embedding.length} ≠ ${EMBEDDING_DIM} : changer de modèle`);
          out.push(d.embedding);
        }
      }
      return out;
    },
  };
}
