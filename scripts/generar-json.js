// generar-json.js (ES Module)
import { Octokit } from "@octokit/rest";

// ---------------- CONFIGURACIÓN ----------------
const TOKEN = process.env.TOKEN;   // tu Personal Access Token GitHub
const OWNER = portaventuratips-gif;   // tu usuario GitHub
const REPO = process.env.REPO;     // nombre del repo
const PATH = "horarios.json";      // archivo en el repo
const BRANCH = "main";

// ---------------- FUNCION PRINCIPAL ----------------
async function generarYSubir() {
  try {
    // Generar hora actual
    const ahora = new Date().toISOString();
    const data = { hora: ahora };
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

    // Subir a GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: "Actualizar hora actual",
      content: Buffer.from(jsonString).toString("base64"),
      sha,
      branch: BRANCH
    });

    console.log("🎉 JSON actualizado correctamente con la hora:", ahora);
  } catch (err) {
    console.error("❌ Error en script:", err);
  }
}

// ---------------- EJECUTAR ----------------
generarYSubir();
