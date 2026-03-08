import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT_DIR = fileURLToPath(new URL("../", import.meta.url));

export const getESMPaths = (url) => {
  const __filename = fileURLToPath(url);
  const __dirname = path.dirname(__filename);

  return { __filename, __dirname };
};

export const throwError = (message, cause) => {
  throw new Error(message, { cause });
};
