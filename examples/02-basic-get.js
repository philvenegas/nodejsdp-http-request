// fetch() only rejects on network errors, not on
// 4xx/5xx — always check response.ok yourself.

try {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1",
  );
  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}`,
    );
  }
  const data = await response.json();
  console.log("Post title:", data.title);
} catch (error) {
  console.error(
    "Failed to fetch:",
    error.message,
  );
}
