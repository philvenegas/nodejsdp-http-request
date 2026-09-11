// Streaming upload: duplex: "half" is required when the body is a stream.
// Content-Length is set from the file size so the server can track progress.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";

async function uploadLargeFile(url, filePath) {
	const fileStats = await stat(filePath);
	const fileStream = createReadStream(filePath);

	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Length": fileStats.size.toString(),
		},
		body: fileStream,
		duplex: "half", // Required for streaming request bodies
	});

	if (!response.ok) {
		throw new Error(`Upload failed: ${response.status}`);
	}
	return response.json();
}

// Usage
await uploadLargeFile("https://api.example.com/upload", "./large-video.mp4");
