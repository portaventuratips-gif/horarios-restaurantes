// scripts/generar-json.js (ES Module)
import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";

// ---------------- CONFIG ----------------
const TOKEN = process.env.TOKEN;      // GitHub Personal Access Token
const OWNER = process.env.OWNER;      // tu usuario GitHub
const REPO = process.env.REPO;        // nombre del repo
const PATH = "horarios.json";         // archivo a crear/actualizar
const BRANCH = "main";                // rama

// URL del JSON ya generado por la web
const WEB_JSON_URL = "https://pa-tips.com/horarios-restaurantes-solicitud/horarios.json";

async function generarYSubir() {
  try {
    console.log("📡 Leyendo JSON desde la web...");

    const res = await fetch(WEB_JSON_URL);
    if (!res.ok) throw new Error(`Error al leer JSON de la web: ${res.status} ${res.statusText}`);
    const data = await res.json();

    const jsonString = JSON.stringify(data, null, 2);
    const octokit = new Octokit({ auth: TOKEN });

    // Comprobar si ya existe el archivo para obtener el SHA
    let sha;
    try {
      const existing = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH, ref: BRANCH });
      sha = existing.data.sha;
      console.log("🔹 Archivo existente, se actualizará");
    } catch {
      console.log("🔹 Archivo no existe, se creará nuevo");
    }

    // Subir/actualizar archivo en GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: "Actualizar horarios desde la web",
      content: Buffer.from(jsonString).toString("base64"),
      sha,
      branch: BRANCH
    });

    console.log("🎉 JSON actualizado correctamente en GitHub!");
  } catch (err) {
    console.error("❌ Error en script:", err);
  }
}

// Ejecutar una vez
generarYSubir();
