// Bearer auth (RFC 6750). Accept tells the server which format you want.
// Keep credentials in env vars, never hardcoded.

const token = process.env.API_TOKEN;

try {
	const response = await fetch("https://api.example.com/protected", {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
			"X-Custom-Header": "custom-value",
		},
	});

	if (response.status === 401) {
		throw new Error("Unauthorized: Check your API token");
	}
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	console.log(data);
} catch (error) {
	console.error("Request failed:", error.message);
}
