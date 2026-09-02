/* RepUp API and static server. Run with: npm start */
"use strict";

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, "data", "repup.json");

const exercises = [
    { id: "bench-press", name: "Bench Press", category: "chest", categoryLabel: "Pecho", equipment: "Barra", level: "Intermedio", description: "Press horizontal con barra.", sets: 4, reps: 8, weight: 80 },
    { id: "incline-dumbbell-press", name: "Press inclinado con mancuernas", category: "chest", categoryLabel: "Pecho", equipment: "Mancuernas", level: "Intermedio", description: "Press inclinado para pecho superior.", sets: 3, reps: 10, weight: 30 },
    { id: "pull-up", name: "Pull Up", category: "back", categoryLabel: "Espalda", equipment: "Peso corporal", level: "Intermedio", description: "Dominada pronada.", sets: 4, reps: 8, weight: 0 },
    { id: "barbell-row", name: "Barbell Row", category: "back", categoryLabel: "Espalda", equipment: "Barra", level: "Intermedio", description: "Remo con barra.", sets: 4, reps: 8, weight: 70 },
    { id: "squat", name: "Back Squat", category: "legs", categoryLabel: "Piernas", equipment: "Barra", level: "Avanzado", description: "Sentadilla trasera con barra.", sets: 4, reps: 6, weight: 100 },
    { id: "hack-squat", name: "Hack Squat", category: "legs", categoryLabel: "Piernas", equipment: "Máquina", level: "Intermedio", description: "Sentadilla en máquina hack.", sets: 3, reps: 10, weight: 120 },
    { id: "shoulder-press", name: "Shoulder Press", category: "shoulders", categoryLabel: "Hombros", equipment: "Mancuernas", level: "Intermedio", description: "Press vertical para hombros.", sets: 3, reps: 10, weight: 24 },
    { id: "lateral-raise", name: "Lateral Raise", category: "shoulders", categoryLabel: "Hombros", equipment: "Mancuernas", level: "Principiante", description: "Elevación lateral.", sets: 3, reps: 15, weight: 10 },
    { id: "barbell-curl", name: "Barbell Curl", category: "arms", categoryLabel: "Brazos", equipment: "Barra", level: "Intermedio", description: "Curl de bíceps con barra.", sets: 3, reps: 10, weight: 30 }
];

const json = (response, status, body) => { response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" }); response.end(JSON.stringify(body)); };
async function readBody(request) { let body = ""; for await (const chunk of request) { body += chunk; if (body.length > 100000) throw new Error("Solicitud demasiado grande"); } return body ? JSON.parse(body) : {}; }
async function readData() { try { return JSON.parse(await fs.readFile(DATA_FILE, "utf8")); } catch (error) { if (error.code === "ENOENT") return { state: null }; throw error; } }
const coachResponse = (message) => { const text = String(message || "").toLowerCase(); if (text.includes("peso") || text.includes("kg")) return "Usa una carga que te deje 1–3 repeticiones en reserva con técnica sólida. Si la última serie es muy fácil, aumenta ligeramente."; if (text.includes("cansado") || text.includes("fatiga")) return "Si estás fatigado, reduce un poco la carga o el volumen y prioriza una técnica controlada. La recuperación también construye progreso."; if (text.includes("técnica") || text.includes("tecnica")) return "Controla la fase excéntrica, mantén una posición estable y usa un rango de movimiento que puedas repetir con consistencia."; return "Puedo ayudarte a ajustar carga, técnica, volumen o recuperación para tu sesión de hoy."; };

async function handleApi(request, response, url) {
    if (request.method === "GET" && url.pathname === "/api/health") return json(response, 200, { ok: true });
    if (request.method === "GET" && url.pathname === "/api/exercises") return json(response, 200, { exercises });
    if (request.method === "GET" && url.pathname === "/api/state") return json(response, 200, await readData());
    if (request.method === "PUT" && url.pathname === "/api/state") { const state = await readBody(request); if (!state || typeof state !== "object" || Array.isArray(state)) return json(response, 400, { error: "El estado debe ser un objeto JSON." }); await fs.mkdir(path.dirname(DATA_FILE), { recursive: true }); await fs.writeFile(DATA_FILE, JSON.stringify({ state, updatedAt: new Date().toISOString() }, null, 2)); return json(response, 200, { ok: true }); }
    if (request.method === "POST" && url.pathname === "/api/coach") { const { message } = await readBody(request); if (typeof message !== "string" || !message.trim()) return json(response, 400, { error: "El mensaje es obligatorio." }); return json(response, 200, { response: coachResponse(message) }); }
    return json(response, 404, { error: "Ruta de API no encontrada." });
}

const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
async function serveStatic(response, pathname) { const requested = pathname === "/" ? "/index.html" : pathname; const filename = path.resolve(ROOT, `.${requested}`); if (!filename.startsWith(ROOT + path.sep)) return json(response, 403, { error: "Acceso denegado." }); try { const file = await fs.readFile(filename); response.writeHead(200, { "Content-Type": contentTypes[path.extname(filename)] || "application/octet-stream" }); response.end(file); } catch (error) { json(response, error.code === "ENOENT" ? 404 : 500, { error: "Archivo no encontrado." }); } }

http.createServer(async (request, response) => { const url = new URL(request.url, `http://${request.headers.host}`); try { if (url.pathname.startsWith("/api/")) await handleApi(request, response, url); else await serveStatic(response, url.pathname); } catch (error) { console.error(error); json(response, 500, { error: "Error interno del servidor." }); } }).listen(PORT, () => console.log(`RepUp disponible en http://localhost:${PORT}`));
