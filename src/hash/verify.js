import path from "node:path";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";

import { ROOT_DIR, throwError } from "../utils.js";
import { ERROR_MESSAGE } from "../constants.js";

const getFileHash = async (filePath) => {
  const hash = createHash("sha256");

  try {
    for await (const chunk of createReadStream(filePath)) {
      hash.update(chunk);
    }
  } catch (e) {
    throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e);
  }

  return hash.digest("hex");
};

const verify = async () => {
  const checksums = JSON.parse(
    await fs
      .readFile(path.join(ROOT_DIR, "checksums.json"), "utf8")
      .catch((e) => throwError(ERROR_MESSAGE.FS_OPERATION_FAILED, e)),
  );

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const actualHash = await getFileHash(path.join(ROOT_DIR, filename));

    console.log(`${filename} — ${actualHash === expectedHash ? "OK" : "FAIL"}`);
  }
};

await verify();
