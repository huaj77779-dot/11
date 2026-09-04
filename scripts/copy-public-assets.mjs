import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("public");
const destination = path.resolve("dist/client");

try {
  await stat(source);
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
  console.log("Copied public assets into the deployment bundle.");
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
    console.log("No public assets directory found; nothing to copy.");
  } else {
    throw error;
  }
}
