import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// La app no usa ISR/revalidate (todas las rutas son dinámicas o
// estáticas simples), así que el caché incremental por defecto alcanza
// — no hace falta configurar un bucket R2 para esto.
export default defineCloudflareConfig();
