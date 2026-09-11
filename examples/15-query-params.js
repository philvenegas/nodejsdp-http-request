// Build URLs with URL/URLSearchParams: string concatenation breaks on
// special characters and invites injection.

function buildUrl(baseUrl, params) {
	const url = new URL(baseUrl);

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	}

	return url.toString();
}

// Usage
const url = buildUrl("https://api.example.com/search", {
	query: "node.js",
	page: 1,
	limit: 20,
	sort: "date",
});

console.log(url);
// https://api.example.com/search?query=node.js&page=1&limit=20&sort=date

const _response = await fetch(url);
