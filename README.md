# Ebay GPT Vision

This server allows for the uploading of images and serves static files using Bun, a fast all-in-one JavaScript runtime. It is intended to be used for OpenAI GPT Vision's image upload feature, but it can be used for any other purpose as well. It deletes images older than 5 minutes to ensure that the server does not run out of disk space, whenever a new upload request comes in. It also rejects files that are larger than 20MB, as that is the maximum file size that OpenAI GPT Vision supports. 

Supported filetypes are matching OpenAI GPT Vision's supported filetypes: PNG, JPEG, and GIF.

## Features
* Upload images with a simple POST request.
* Supports PNG, JPEG, and GIF image formats.
* Uses UUIDs to uniquely name and save uploaded files.
* Files larger than 20MB are rejected.
* Files older than 5 minutes are automatically deleted.
* Protected by an API key to ensure only authorized uploads.

## Getting Started

### Prerequisites

Ensure you have Bun installed on your system. You can install Bun by following the instructions on the [official Bun installation page](https://bun.sh/).

### Installation
Clone the repository to your local machine:

Set an `API_KEY` environment variable to a random string. This will be used to authenticate uploads.

`.env file`
```bash
API_KEY=YOUR_API_KEY
```

### Usage
There are no dependencies to install!

Start the server by running:

```bash
bun index.js

# Logging will look like this:
# Deleting file older that 5 minutes: d5b39b6c-f549-431b-a174-c1311d701cad.png
# Deleting file older that 5 minutes: b1e63f14-280d-41bf-954e-b6dcc5a4b9ee.png
# Deleting file older that 5 minutes: 9b172467-5805-427b-aa88-80b57a492b97.png
# File uploaded successfully: a53dda26-1b8f-47e8-8389-022e4b505adb.png
# Deleting file older that 5 minutes: 58087c44-32c3-4565-b13a-828f09cc4303.png
# Deleting file older that 5 minutes: 2ead19f7-b76d-4c18-9c70-c79f48de810f.png
```

It will run on port 3000 by default. You can change this by setting a `PORT` environment variable.

To upload an image, use the following curl command:

```bash
# Request
curl -X POST -H "Authorization: Bearer your-api-key" -F "image=@screenshot_screen_0.png" http://localhost:3000/upload

# Response
{"url":"http://localhost:3000/uploads/a53dda26-1b8f-47e8-8389-022e4b505adb.png"}
```

