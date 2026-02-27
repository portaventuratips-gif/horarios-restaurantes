// generar-json.js
import fetch from "node-fetch";
import { Octokit } from "@octokit/rest";

const API_URL = "https://api.adventurelabs.xyz/restaurants/";
const API_KEY = "ApiKey 1234567890abcdef!";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // ⚠️ Mantener privado
const OWNER = "tu-usuario-github";
const REPO = "nombre-del-repo";
const PATH = "horarios.json"; // archivo en el repo
const BRANCH = "main";

const nombreMap = {
  "Aloha": "Aloha",
  "Altai": "Altai",
  "Augustu's Biergarten": "Augustu's Biergarten",
  // ... resto del mapa ...
  "Zona Indoor - El Gran Caribe": "Zona Indoor - El Gran Caribe"
};

async function generarYSubir() {
  // 1️⃣ Obtener datos de la API
  const res = await fetch(API_URL, { headers: { "x-api-key": API_KEY } });
  if (!res.ok) throw new Error("Error al obtener datos de la API");
  const shops = await res.json();

  // 2️⃣ Formatear JSON limpio
  const data = shops.map(shop => ({
    nombre: nombreMap[shop.name] || shop.name,
    horarios: shop.schedule?.map(slot => ({
      open: slot.open,
      close: slot.close
    })) || []
  }));

  const jsonString = JSON.stringify(data, null, 2);

  // 3️⃣ Subir a GitHub
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  // Comprobar si el archivo ya existe para obtener su SHA
  let sha;
  try {
    const { data: existing } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      ref: BRANCH
    });
    sha = existing.sha;
  } catch (err) {
    console.log("Archivo no existe, se creará uno nuevo");
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

  console.log("JSON actualizado en GitHub correctamente");
}

generarYSubir().catch(console.error);
