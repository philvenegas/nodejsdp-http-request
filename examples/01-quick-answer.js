// fetch() is built into Node.js 18+ — no
// dependency needed.

const response = await fetch(
  "https://api.example.com/data",
);
const data = await response.json();
console.log(data);
