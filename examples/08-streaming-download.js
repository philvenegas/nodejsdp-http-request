// response.body is a ReadableStream — process
// chunks without buffering the whole response in
// memory.

const response = await fetch(
  "http://212.183.159.230/5MB.zip",
);

if (!response.ok) {
  throw new Error(
    `HTTP error! status: ${response.status}`,
  );
}

// response.body is a ReadableStream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, {
    stream: true,
  });
  process.stdout.write(chunk);
  console.log("--------------");
}
