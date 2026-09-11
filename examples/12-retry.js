// Retry with exponential backoff (200ms, 400ms, 800ms...).
// Only retry idempotent requests — and never a stream body, it can be read once.

export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
	let lastError;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			lastError = error;
			console.log(`Attempt ${attempt} failed: ${error.message}`);

			if (attempt < maxRetries) {
				// Exponential backoff: wait longer between retries
				const delay = 2 ** attempt * 100;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}
