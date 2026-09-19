// Promise.allSettled() when partial failure is
// acceptable:
// every URL reports either data or an error.

export async function fetchMultipleWithFallback(
  urls,
) {
  const requests = urls.map((url) =>
    fetch(url).then((res) => res.json()),
  );

  const results =
    await Promise.allSettled(requests);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return {
        url: urls[index],
        data: result.value,
        error: null,
      };
    } else {
      return {
        url: urls[index],
        data: null,
        error: result.reason.message,
      };
    }
  });
}
