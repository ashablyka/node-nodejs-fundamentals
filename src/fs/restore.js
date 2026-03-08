import path from "node:path";
import fs from "node:fs/promises";

import { ROOT_DIR, throwError } from "../utils.js";
import { ERROR_MESSAGE } from "../constants.js";

const restore = async () => {
  try {
    const snapshotPath = path.join(ROOT_DIR, "snapshot.json");
    const restorePath = path.join(ROOT_DIR, "workspace_restored");

    const snapshotRaw = await fs.readFile(snapshotPath, "utf8");
    const { entries } = JSON.parse(snapshotRaw);

    await fs.mkdir(restorePath);

    for (const entry of entries) {
      const fullPath = path.join(restorePath, ...entry.path.split("/"));

      if (entry.type === "directory") {
        await fs.mkdir(fullPath, { recursive: true });
      } else if (entry.type === "file") {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, Buffer.from(entry.content, "base64"));
      }
    }
  } catch (e) {
    throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e);
  }
};

await restore();
