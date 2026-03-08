import path from "node:path";
import fs from "node:fs/promises";

import { ROOT_DIR, throwError } from "../utils.js";
import { ERROR_MESSAGE } from "../constants.js";

const snapshot = async () => {
  const workspacePath = path.join(ROOT_DIR, "workspace");

  const stat = await fs
    .stat(workspacePath)
    .catch((e) => throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e));

  if (!stat.isDirectory()) {
    throwError(ERROR_MESSAGE.FS_OPERATION_FAILED);
  }

  const walk = async (currentPath) => {
    const dirEntries = await fs.readdir(currentPath, { withFileTypes: true });

    const nestedEntries = await Promise.all(
      dirEntries.map(async (dirEntry) => {
        const fullPath = path.join(currentPath, dirEntry.name);
        const relativePath = path
          .relative(workspacePath, fullPath)
          .split(path.sep)
          .join("/");

        if (dirEntry.isDirectory()) {
          const subEntries = await walk(fullPath);
          return [{ path: relativePath, type: "directory" }, ...subEntries];
        }

        if (dirEntry.isFile()) {
          const fileBuffer = await fs.readFile(fullPath);
          return [
            {
              path: relativePath,
              type: "file",
              size: fileBuffer.length,
              content: fileBuffer.toString("base64"),
            },
          ];
        }

        return [];
      }),
    );

    return nestedEntries.flat();
  };

  const entries = await walk(workspacePath).catch((e) =>
    throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e),
  );

  const snapshotData = { rootPath: workspacePath, entries };

  const outputPath = path.join(ROOT_DIR, "snapshot.json");

  await fs
    .writeFile(outputPath, JSON.stringify(snapshotData, null, 2))
    .catch((e) => throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e));
};

await snapshot();
