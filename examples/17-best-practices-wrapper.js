// All the practices in one place: error checks,
// timeout, env-var config.

// Example: Wrapper with best practices
export async function apiRequest(
  endpoint,
  options = {},
) {
  // [Practice #4] Load sensitive values from
  // environment variables
  const baseUrl = process.env.API_BASE_URL;
  const token = process.env.API_TOKEN;

  // [Practice #1] Wrap in try/catch to handle
  // errors
  try {
    const response = await fetch(
      `${baseUrl}${endpoint}`,
      {
        ...options,
        // [Practice #2] Set 10s timeout
        signal: AbortSignal.timeout(10000),
        headers: {
          // [Practice #4] Use env var for token
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
    );

    // [Practice #1] Check response status and
    // handle errors
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API error ${response.status}: ${errorBody}`,
      );
    }

    // [Practice #3] Parse response (caller
    // should validate structure)
    return await response.json();
  } catch (error) {
    // [Practice #2] Handle timeout specifically
    if (error.name === "TimeoutError") {
      throw new Error(
        `Request to ${endpoint} timed out`,
      );
    }

    throw error;
  }
}
