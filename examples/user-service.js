// The module under test in 16-mocking.test.js.

export async function getUser(id) {
  const response = await fetch(
    `https://api.example.com/users/${id}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch user: ${response.status}`,
    );
  }

  return response.json();
}
