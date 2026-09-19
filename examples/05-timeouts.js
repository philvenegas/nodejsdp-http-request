// AbortSignal.timeout() stops a request from
// hanging forever.
// A timeout surfaces as error.name ===
// "TimeoutError".

try {
  const response = await fetch(
    "https://api.example.com/data",
    {
      // Abort after 5 seconds
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}`,
    );
  }
  const data = await response.json();
  console.log(data);
} catch (error) {
  if (error.name === "TimeoutError") {
    console.error("Request timed out");
  } else {
    console.error(
      "Request failed:",
      error.message,
    );
  }
}
