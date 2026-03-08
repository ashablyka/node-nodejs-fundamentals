import path from "node:path";
import fs from "node:fs/promises";

import { ROOT_DIR, throwError } from "../utils.js";
import { ERROR_MESSAGE } from "../constants.js";

const getExtension = () => {
  const args = process.argv.slice(2);
  const index = args.indexOf("--ext");

  return args[index + 1] ?? "txt";
};

const ensureDirectoryExists = async (dirPath) => {
  const stat = await fs
    .stat(dirPath)
    .catch((e) => throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e));

  if (!stat.isDirectory()) {
    throwError(ERROR_MESSAGE.FS_OPERATION_FAILED);
  }
};

const findFilesByExt = async (currentPath, workspacePath, ext) => {
  const dirEntries = await fs.readdir(currentPath, { withFileTypes: true });

  const nestedResults = await Promise.all(
    dirEntries.map(async (dirEntry) => {
      const fullPath = path.join(currentPath, dirEntry.name);

      if (dirEntry.isDirectory()) {
        return findFilesByExt(fullPath, workspacePath, ext);
      }

      if (dirEntry.isFile() && path.extname(dirEntry.name).slice(1) === ext) {
        return [
          path.relative(workspacePath, fullPath).split(path.sep).join("/"),
        ];
      }

      return [];
    }),
  );

  return nestedResults.flat();
};

const findByExt = async () => {
  const workspacePath = path.join(ROOT_DIR, "workspace");
  const ext = getExtension();

  await ensureDirectoryExists(workspacePath);

  const files = await findFilesByExt(workspacePath, workspacePath, ext).catch(
    (e) => throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e),
  );

  files.toSorted().forEach((filePath) => {
    console.log(filePath);
  });
};

await findByExt();
