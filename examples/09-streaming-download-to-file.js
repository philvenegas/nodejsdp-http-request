// Readable.fromWeb() converts the fetch stream
// into a Node.js stream so it can be piped
// straight to disk.

import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const response = await fetch(
  "http://212.183.159.230/5MB.zip",
);

if (!response.ok) {
  throw new Error(
    `HTTP error! status: ${response.status}`,
  );
}

const nodeStream = Readable.fromWeb(
  response.body,
);
await pipeline(
  nodeStream,
  createWriteStream("./download.zip"),
);
console.log("Download complete!");
