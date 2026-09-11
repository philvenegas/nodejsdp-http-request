// One body-parsing method per response: json / text / blob / arrayBuffer.
// Headers are read via response.headers.

const url = "https://jsonplaceholder.typicode.com/posts/1";

// JSON response
const _jsonData = await fetch(url).then((res) => res.json());

// Text response (HTML, plain text)
const _textData = await fetch(url).then((res) => res.text());

// Binary data (images, files)
const _blobData = await fetch(url).then((res) => res.blob());
const _arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());

// Get response headers
const response = await fetch(url);
console.log("Content-Type:", response.headers.get("Content-Type"));
console.log("All headers:", Object.fromEntries(response.headers));
