import fs from "node:fs";
import path from "node:path";
const FILE = path.join(process.cwd(), "messages.dev.json");
type Msg = { text: string; created_at: string };
function read(): Msg | null {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8"))?.last ?? null; }
  catch { return null; }
}
function write(text: string) {
  const payload = { last: { text, created_at: new Date().toISOString() } };
  fs.writeFileSync(FILE, JSON.stringify(payload), "utf8");
}
export const store = { read, write };