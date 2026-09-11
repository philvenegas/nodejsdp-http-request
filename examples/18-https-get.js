// node:https — for pre-18 Node, legacy code, or raw throughput.
// Redirects are not followed automatically; handle the location header yourself.

import https from "node:https";

function httpsGet(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (response) => {
				// Handle redirects
				if (
					response.statusCode >= 300 &&
					response.statusCode < 400 &&
					response.headers.location
				) {
					return resolve(httpsGet(response.headers.location));
				}

				if (response.statusCode !== 200) {
					reject(new Error(`HTTP error! status: ${response.statusCode}`));
					response.resume(); // Consume response to free up memory
					return;
				}

				const chunks = [];

				response.on("data", (chunk) => chunks.push(chunk));

				response.on("end", () => {
					const body = Buffer.concat(chunks).toString();
					resolve(JSON.parse(body));
				});

				response.on("error", reject);
			})
			.on("error", reject);
	});
}

// Usage
const data = await httpsGet("https://jsonplaceholder.typicode.com/posts/1");
console.log("Post title:", data.title);
