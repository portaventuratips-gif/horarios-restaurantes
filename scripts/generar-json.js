// scripts/generar-json.js
import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";

const TOKEN = process.env.TOKEN;      // GitHub PAT
const OWNER = process.env.OWNER;      // usuario GitHub
const REPO = process.env.REPO;        // repo
const PATH = "horarios.json";         // archivo a actualizar
const BRANCH = "main";                // rama principal

// URL del JSON que genera la web
const WEB_JSON_URL = "https://pa-tips.com/horarios-restaurantes-solicitud";

async function generarYSubir() {
  try {
    console.log("📡 Leyendo JSON desde la web...");

    const res = await fetch(WEB_JSON_URL);
    if (!res.ok) throw new Error(`Error al leer JSON: ${res.status} ${res.statusText}`);
    const data = await res.json();

    const jsonString = JSON.stringify(data, null, 2);
    const octokit = new Octokit({ auth: TOKEN });

    // Obtener SHA si el archivo ya existe
    let sha;
    try {
      const existing = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH, ref: BRANCH });
      sha = existing.data.sha;
      console.log("🔹 Archivo existente, se actualizará");
    } catch {
      console.log("🔹 Archivo no existe, se creará nuevo");
    }

    // Subir o actualizar archivo
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

// Ejecutar script
generarYSubir();
