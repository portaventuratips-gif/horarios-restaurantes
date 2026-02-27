// generar-json.js (ES Module)

// ---------------- CONFIGURACIÓN ----------------
import { Octokit } from "@octokit/rest";

const API_URL = "https://api.adventurelabs.xyz/restaurants/";
const API_KEY = process.env.API_KEY;   // tu API Key Adventure Labs
const TOKEN = process.env.TOKEN;       // Personal Access Token GitHub
const OWNER = "portaventuratips-gif";       // tu usuario GitHub
const REPO = process.env.REPO;         // nombre del repo
const PATH = "horarios.json";          // archivo en el repo
const BRANCH = "main";

// ---------------- MAPEOS ----------------
const nombreMap = {
  "Aloha": "Aloha",
  "Altai": "Altai",
  "Augustu's Biergarten": "Augustu's Biergarten",
  "Beach Bar": "Beach Bar",
  "Ben & Jerrys": "Ben & Jerrys",
  "Black Smith": "Black Smith",
  "Bora Bora": "Bora Bora",
  "Bufalo": "Bufalo",
  "Cactus Express": "Cactus Express",
  "Café Saula": "Café Saula",
  "Cafetería Bora Bora": "Cafetería Bora Bora",
  "Canton": "Canton",
  "Captain's Refuge": "Captain's Refuge",
  "Cerveseria L'Estació": "Cerveseria L'Estació",
  "Chickens' Stampida": "Chickens' Stampida",
  "Cookie Monster Corner": "Cookie Monster Corner",
  "Dagana": "Dagana",
  "Dakini": "Dakini",
  "Economato": "Economato",
  "El Kaktus": "El Kaktus",
  "El Molino": "El Molino",
  "El Posit": "El Posit",
  "Erawan": "Erawan",
  "Finish Line": "Finish Line",
  "Focacceria": "Focacceria",
  "Fresh Island": "Fresh Island",
  "Gran Caribe": "Gran Caribe",
  "Grand Canyon Drinks": "Grand Canyon Drinks",
  "Hacienda El Charro": "Hacienda El Charro",
  "Happiness Station Caribe": "Happiness Station Caribe",
  "Happiness Station China": "Happiness Station China",
  "Heladería Carte D'or": "Heladería Carte D'or",
  "Hot Dogs": "Hot Dogs",
  "Ice Cream Box": "Ice Cream Box",
  "Jeremia's Food": "Jeremias' Food",
  "Jiangsu": "Jiangsu",
  "King Kamehameha": "King Kamehameha",
  "La Cabaña": "La Cabaña",
  "La Cantina": "La Cantina",
  "La Cantonada": "La Cantonada",
  "La Cara": "La Cara",
  "La Cocina de Epi": "La Cocina de Epi",
  "La Glorieta - You by Danone": "La Glorieta - You by Danone",
  "La Laguna de Woody": "La Laguna de Woody",
  "LaLiga Twentynine's ": "LaLiga TwentyNine's",
  "La Posada de los Gnomos": "La Posada de los Gnomos",
  "Loggers Creppe - You by Danone": "Loggers Creppe  - You by Danone",
  "Long Branch Saloon": "Long Branch Saloon",
  " Marco Polo": "Marco Polo",
  "Moll Vell": "Moll Vell",
  "Paddock": "Paddock",
  "Palma Real": "Palma Real",
  "Pit Lane": "Pit Lane",
  "Racó de Mar": "Racó de Mar",
  "Reggae Cafe": "Reggae Café",
  "Sichuan": "Sichuan",
  "Spirello": "Spirello",
  "Stop&Go": "Stop & Go",
  "Stunt Pop Corn": "Stunt Pop Corn",
  "Sweet House": "Sweet House by Nutella",
  "Taquería La Catrina": "Taquería La Catrina",
  "The Iron Horse": "The Iron Horse",
  "The Old Steak House": "The Old Steak House",
  "The Surfer": "The Surfer",
  "Tropical Juice": "Tropical Juice",
  "Vinosfera Tapes i Vins": "Vinosfera Tapes i Vins",
  "Waitan": "Waitan",
  "Zona Indoor - El Gran Caribe": "Zona Indoor - El Gran Caribe"
};

// ---------------- FUNCION PRINCIPAL ----------------
async function generarYSubir() {
  try {
    console.log("📡 Consultando API de Adventure Labs...");

    console.log({ API_KEY: API_KEY?.substring(0,10)+"****", TOKEN: TOKEN?.substring(0,10)+"****", OWNER: OWNER?.substring(0,10)+"****", REPO });

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
