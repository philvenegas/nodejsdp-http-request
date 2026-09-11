const res = await fetch("https://example.com");
console.log(res.status, (await res.text()).length);
