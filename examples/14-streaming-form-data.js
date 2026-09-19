// A file-like object with a stream() method
// keeps the file out of memory.
// Node.js-specific — this does not work in
// browsers.

import { createReadStream } from "node:fs";
import { basename } from "node:path";

async function uploadLargeFileWithFormData(
  url,
  filePath,
  metadata,
) {
  const fileName = basename(filePath);

  const formData = new FormData();

  // Add metadata fields alongside the file
  formData.append(
    "description",
    metadata.description,
  );
  formData.append("category", metadata.category);

  // Add the file as a stream (not loaded into
  // memory)
  formData.append("file", {
    [Symbol.toStringTag]: "File",
    name: fileName,
    stream: () => createReadStream(filePath),
  });

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Upload failed: ${response.status}`,
    );
  }
  return response.json();
}

// Usage
await uploadLargeFileWithFormData(
  "https://api.example.com/videos",
  "./large-video.mp4",
  {
    description: "My vacation video",
    category: "travel",
  },
);
