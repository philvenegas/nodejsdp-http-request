// The https response is already a Node.js stream — pipe it to a file.

import { createWriteStream } from "node:fs";
import https from "node:https";
import { pipeline } from "node:stream/promises";

async function downloadFile(url, destPath) {
	return new Promise((resolve, reject) => {
		https
			.get(url, async (response) => {
				if (response.statusCode !== 200) {
					reject(new Error(`Failed to download: ${response.statusCode}`));
					response.resume();
					return;
				}

				const fileStream = createWriteStream(destPath);

				try {
					await pipeline(response, fileStream);
					console.log(`Downloaded to ${destPath}`);
					resolve();
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});
}

// Usage
await downloadFile(
	"https://nodejs.org/dist/v22.0.0/node-v22.0.0.tar.gz",
	"./node-source.tar.gz",
);
