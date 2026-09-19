// https.request() POST: Content-Length must be
// set manually, and the body is written with
// req.write() / req.end().

import https from "node:https";

function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length":
          Buffer.byteLength(postData),
      },
    };

    const req = https.request(
      options,
      (response) => {
        const chunks = [];

        response.on("data", (chunk) =>
          chunks.push(chunk),
        );

        response.on("end", () => {
          const body =
            Buffer.concat(chunks).toString();

          if (
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            resolve(JSON.parse(body));
          } else {
            reject(
              new Error(
                `HTTP ${response.statusCode}: ${body}`,
              ),
            );
          }
        });
      },
    );

    req.on("error", reject);

    // Set timeout
    req.setTimeout(10000, () => {
      req.destroy(
        new Error("Request timed out"),
      );
    });

    // Write data and end request
    req.write(postData);
    req.end();
  });
}

// Usage
const newPost = await httpsPost(
  "https://jsonplaceholder.typicode.com/posts",
  {
    title: "My Post",
    body: "Content here",
    userId: 1,
  },
);
console.log("Created:", newPost);
