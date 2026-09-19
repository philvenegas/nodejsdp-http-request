// multipart/form-data upload. readFile() loads
// the whole file into memory — use the streaming
// version for large files.

import { readFile } from "node:fs/promises";

export async function uploadFile(url, filePath) {
  const fileContent = await readFile(filePath);

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([fileContent]),
    "upload.txt",
  );
  formData.append(
    "description",
    "My uploaded file",
  );

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Note: Don't set Content-Type header -
    // fetch will set it automatically with the
    // correct boundary for multipart/form-data
  });

  if (!response.ok) {
    throw new Error(
      `Upload failed: ${response.status}`,
    );
  }
  return await response.json();
}
