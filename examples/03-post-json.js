// JSON POST: set Content-Type and
// JSON.stringify() the body.

try {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "My New Post",
        body: "This is the content of my post.",
        userId: 1,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}`,
    );
  }
  const data = await response.json();
  console.log("Created post:", data);
} catch (error) {
  console.error(
    "Failed to create post:",
    error.message,
  );
}
