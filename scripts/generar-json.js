// generar-json.js (ES Module)

// ---------------- CONFIGURACIÓN ----------------
import { Octokit } from "@octokit/rest";

const API_URL = "https://api.adventurelabs.xyz/restaurants/";
const API_KEY = process.env.API_KEY;   // tu API Key Adventure Labs
const TOKEN = process.env.TOKEN;       // Personal Access Token GitHub
const OWNER = process.env.OWNER;       // tu usuario GitHub
const REPO = process.env.REPO;         // nombre del repo
const PATH = "horarios.json";          // archivo en el repo
const BRANCH = "main";

// ---------------- MAPEOS ----------------
const nombreMap = {
  "Aloha": "Aloha",
  "Altai": "Altai",
  "Augustu's Biergarten": "Augustu's Biergarten",
  "Beach Bar": "Beach Bar",
  "Ben & Jerrys": "Ben & Jerrys"
  // ... agrega todos tus restaurantes ...
};

// ---------------- FUNCION PRINCIPAL ----------------
async function generarYSubir() {
  try {
    console.log("📡 Consultando API de Adventure Labs...");

    const res = await fetch(API_URL, { headers: { "x-api-key": "ApiKey 1234567890abcdef!" } });
    if (!res.ok) throw new Error(`Error API: ${res.status} ${res.statusText}`);

    const shops = await res.json();
    console.log(`✅ API devuelve ${shops.length} restaurantes`);

    if (!shops || shops.length === 0) {
      console.log("⚠️ No hay datos para generar JSON");
      return;
    }

    const data = shops.map(shop => ({
      nombre: nombreMap[shop.name] || shop.name,
      horarios: shop.schedule?.map(slot => `${slot.open} - ${slot.close}`) || []
    }));

    const jsonString = JSON.stringify(data, null, 2);
    const octokit = new Octokit({ auth: TOKEN });

    // Comprobar si existe el archivo para obtener SHA
    let sha;
    try {
      const existing = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: PATH,
        ref: BRANCH
      });
      sha = existing.data.sha;
      console.log("🔹 Archivo existe, actualizando...");
    } catch {
      console.log("🔹 Archivo no existe, se creará nuevo");
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: "Actualizar horarios de restaurantes",
      content: Buffer.from(jsonString).toString("base64"),
      sha,
      branch: BRANCH
    });

    console.log("🎉 JSON actualizado correctamente en GitHub!");
  } catch (err) {
    console.error("❌ Error en script:", err);
  }
}

// ---------------- EJECUTAR ----------------
generarYSubir();
