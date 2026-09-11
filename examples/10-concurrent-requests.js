// Promise.all() runs the requests concurrently and fails fast.
// For hundreds of URLs, limit concurrency instead.

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchMultipleUsers(userIds) {
  const requests = userIds.map((id) =>
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then((res) =>
      res.json(),
    ),
  );
  // const delays = [100, 100, 100].map((ms) => delay(ms));
  // console.log(delays);

  // Wait for all requests to complete
  const users = await Promise.all(requests);
  return users;
}

// Usage
const users = await fetchMultipleUsers([1, 2, 3, 4, 5]);
console.log(`Fetched ${users.length} users`);
users.forEach((user) => {
  console.log(`- ${user.name}`);
});
