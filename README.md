# Ebay GPT Vision

Proof of concept application that uses GPT-4 Vision to take an image of an object and return the price that item has sold recently for on eBay.

## Features
* React (Vite) frontend
* Bun backend
* GPT-4 Vision Preview
* eBay Marketplace Insight (Buy) API integration

### Prerequisites

Ensure you have Bun installed on your system. You can install Bun by following the instructions on the [official Bun installation page](https://bun.sh/).

## Getting Started

For development:
```bash
bun install

bun run dev
```

Ths will run the React frontend and Bun backend [concurrently](https://www.npmjs.com/package/concurrently). 

* Use the [http://localhost:5173](http://localhost:5173) to access the hot-reloading frontend (vite dev mode).
* Use the [http://localhost:3000](http://localhost:3000) to access the backend (bun hot reloading mode). 


For production:
Use the `Dockerfile` to build a Docker image and run it. It will run the frontend and backend in production mode.