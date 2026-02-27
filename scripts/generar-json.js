const fetch = require("node-fetch");
const { Octokit } = require("@octokit/rest");

const API_URL = "https://api.adventurelabs.xyz/restaurants/";
const API_KEY = process.env.API_KEY;       // tu clave Adventure Labs
const TOKEN = process.env.TOKEN; // PAT con repo
const OWNER = "TU_USUARIO";
const REPO = "horarios-restaurantes";
const PATH = "horarios.json";
const BRANCH = "main";

const nombreMap = {
  "Aloha": "Aloha",
  "Altai": "Altai",
  "Augustu's Biergarten": "Augustu's Biergarten",
  // ... resto del mapa ...
  "Zona Indoor - El Gran Caribe": "Zona Indoor - El Gran Caribe"
};

async function generarYSubir() {
  const res = await fetch(API_URL, { headers: { "x-api-key": API_KEY } });
  if (!res.ok) throw new Error("Error al obtener datos de Adventure Labs");
  const shops = await res.json();

  const data = shops.map(shop => ({
    nombre: nombreMap[shop.name] || shop.name,
    horarios: (shop.schedule?.map(slot => `${slot.open} - ${slot.close}`) || [])
  }));

  const jsonString = JSON.stringify(data, null, 2);

  const octokit = new Octokit({ auth: TOKEN });

  let sha;
  try {
    const existing = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH, ref: BRANCH });
    sha = existing.data.sha;
  } catch (err) {
    console.log("Archivo no existe, se creará nuevo");
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

  console.log("JSON actualizado correctamente");
}

generarYSubir().catch(console.error);
