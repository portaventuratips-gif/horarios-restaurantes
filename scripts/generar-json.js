// scripts/generar-json.js
import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";

const API_URL = "https://api.adventurelabs.xyz/restaurants/";
const API_KEY = process.env.API_KEY;
const TOKEN = process.env.TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const PATH = "horarios.json";
const BRANCH = "main";

async function generarYSubir() {
  try {
    console.log("📡 Consultando API de Adventure Labs...");
    const res = await fetch(API_URL, { headers: { "x-api-key": API_KEY } });
    if (!res.ok) throw new Error(`Error API: ${res.status}`);

    const shops = await res.json();
    const data = shops.map(shop => ({
      nombre: shop.name,
      horarios: shop.schedule?.map(s => `${s.open} - ${s.close}`).join(" y ") || ""
    }));

    const jsonString = JSON.stringify(data, null, 2);
    const octokit = new Octokit({ auth: TOKEN });

    let sha;
    try {
      const existing = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH, ref: BRANCH });
      sha = existing.data.sha;
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

generarYSubir();
