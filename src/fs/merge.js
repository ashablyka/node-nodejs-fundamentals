import path from "node:path";
import fs from "node:fs/promises";

import { ROOT_DIR, throwError } from "../utils.js";
import { ERROR_MESSAGE } from "../constants.js";

const getFilesArg = () => {
  const args = process.argv.slice(2);
  const index = args.indexOf("--files");

  if (index === -1 || !args[index + 1]) return null;

  return args[index + 1].split(",");
};

const getFilesToMerge = async (partsPath, filesArg) => {
  const dirStat = await fs
    .stat(partsPath)
    .catch((e) => throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e));

  if (!dirStat.isDirectory()) {
    throwError(ERROR_MESSAGE.FS_OPERATION_FAILED);
  }

  if (filesArg !== null) {
    await Promise.all(
      filesArg.map((filename) =>
        fs
          .stat(path.join(partsPath, filename))
          .catch((e) =>
            throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e),
          ),
      ),
    );

    return filesArg.map((filename) => path.join(partsPath, filename));
  }

  const entries = await fs.readdir(partsPath, { withFileTypes: true });

  const txtFiles = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name) === ".txt")
    .map((entry) => entry.name)
    .toSorted();

  if (txtFiles.length === 0) {
    throwError(ERROR_MESSAGE.FS_OPERATION_FAILED);
  }

  return txtFiles.map((filename) => path.join(partsPath, filename));
};

const merge = async () => {
  const partsPath = path.join(ROOT_DIR, "workspace", "parts");
  const outputPath = path.join(ROOT_DIR, "workspace", "merged.txt");

  const filePaths = await getFilesToMerge(partsPath, getFilesArg());

  const contents = await Promise.all(
    filePaths.map((filePath) => fs.readFile(filePath, "utf-8")),
  );

  await fs.writeFile(outputPath, contents.join("\n"));
};

await merge();
