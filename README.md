# nodejsdp-http-request

Runnable examples from [How to make an HTTP request in Node.js](https://nodejsdesignpatterns.com/blog/nodejs-http-request/) (Node.js Design Patterns).

Requires Node.js 18+ for the built-in `fetch()`; this repo pins the latest LTS in `.nvmrc`.

```bash
nvm use
npm install
node examples/02-basic-get.js
npm test
```

## Examples

### fetch()

| File | What it shows |
| --- | --- |
| [01-quick-answer.js](examples/01-quick-answer.js) | The one-liner: `fetch()` is built in |
| [02-basic-get.js](examples/02-basic-get.js) | GET + why you must check `response.ok` |
| [03-post-json.js](examples/03-post-json.js) | POST with a JSON body |
| [04-headers-auth.js](examples/04-headers-auth.js) | Custom headers and Bearer auth |
| [05-timeouts.js](examples/05-timeouts.js) | `AbortSignal.timeout()` |
| [06-response-types.js](examples/06-response-types.js) | `json` / `text` / `blob` / `arrayBuffer`, response headers |
| [15-query-params.js](examples/15-query-params.js) | Building URLs with `URL` / `URLSearchParams` |
| [17-best-practices-wrapper.js](examples/17-best-practices-wrapper.js) | All the practices in one wrapper |

### Streaming

| File | What it shows |
| --- | --- |
| [07-streaming-upload.js](examples/07-streaming-upload.js) | Streaming request body (`duplex: 'half'`) |
| [08-streaming-download.js](examples/08-streaming-download.js) | Reading `response.body` chunk by chunk |
| [09-streaming-download-to-file.js](examples/09-streaming-download-to-file.js) | `Readable.fromWeb()` piped to disk |

### Concurrency and resilience

| File | What it shows |
| --- | --- |
| [10-concurrent-requests.js](examples/10-concurrent-requests.js) | `Promise.all()` |
| [11-concurrent-with-fallback.js](examples/11-concurrent-with-fallback.js) | `Promise.allSettled()` |
| [12-retry.js](examples/12-retry.js) | Retry with exponential backoff |

### Uploads

| File | What it shows |
| --- | --- |
| [13-form-data-upload.js](examples/13-form-data-upload.js) | `FormData` file upload |
| [14-streaming-form-data.js](examples/14-streaming-form-data.js) | Streaming a large file through `FormData` |

### Testing

| File | What it shows |
| --- | --- |
| [16-mocking.test.js](examples/16-mocking.test.js) | Mocking HTTP with undici's `MockAgent` |
| [user-service.js](examples/user-service.js) | The module under test |

### node:http / node:https

| File | What it shows |
| --- | --- |
| [18-https-get.js](examples/18-https-get.js) | GET with `https.get()`, manual redirects |
| [19-https-post.js](examples/19-https-post.js) | POST with `https.request()` |
| [20-https-streaming-download.js](examples/20-https-streaming-download.js) | Piping a response to a file |

## Which ones actually run

These hit real endpoints and work as-is: `02`, `03`, `10`, `18`, `19`, and `npm test`.

The rest use placeholder URLs from the article (`api.example.com`, `example.com/large-file`,
`./large-video.mp4`) and are there to read, not to run — point them at a real endpoint first.

## License

[ISC](LICENSE) for this repo. The example code is from the Node.js Design Patterns blog and stays under its authors' copyright; see [NOTICE](NOTICE).
