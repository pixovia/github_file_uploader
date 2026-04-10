# GitHub File Uploader (Pixovia Storage Engine)

> Cloudflare Worker based file uploader that stores files directly in GitHub Releases.

🚀 **Used By:** Pixovia Library
📦 **Pixovia Full Source:** [https://github.com/pixovia/pixovia-main](https://github.com/pixovia/pixovia-main)
☁️ **Deployment:** Cloudflare Workers
🗂 **Storage Backend:** GitHub Releases

---

# 📢 Project Overview

GitHub File Uploader is the **storage engine** that powered the Pixovia ecosystem.

Instead of traditional storage providers, this system:

* Uploads files to GitHub Releases
* Automatically creates versions
* Handles large file uploads
* Provides permanent download links

This makes it:

* Free storage
* Highly reliable
* Version controlled
* CDN backed (GitHub CDN)

---

# 🏗 Architecture

```
User Upload
    ↓
Cloudflare Worker (worker.js)
    ↓
GitHub API
    ↓
GitHub Releases
    ↓
Permanent Download URL
```

---

# 📂 Repository Structure

```
/
├── worker.js        # Cloudflare Worker uploader
├── README.md        # Documentation
└── examples/        # Example usage (optional)
```

---

# ⚙️ Supported File Types & Limits

| Type     | Max Size | Version          |
| -------- | -------- | ---------------- |
| Image    | 50MB     | v1.0.0.0.0.0.0.1 |
| Video    | 1GB      | v1.0.0.0.0.0.0.2 |
| Audio    | 1GB      | v1.0.0.0.0.0.0.3 |
| RAR      | 2GB      | v1.0.0.0.0.0.0.4 |
| ZIP      | 2GB      | v1.0.0.0.0.0.0.5 |
| APK      | 1.2GB    | v1.0.0.0.0.0.0.6 |
| EXE      | 1.2GB    | v1.0.0.0.0.0.0.7 |
| PDF      | 500MB    | v1.0.0.0.0.0.0.8 |
| Document | 500MB    | v1.0.0.0.0.0.0.8 |
| Other    | 500MB    | v1.0.0.0.0.0.0.8 |

---

# 🚀 Features

* GitHub Release based storage
* Automatic release creation
* File type size limits
* CORS enabled
* Cloudflare Worker deployment
* Version-based storage
* Permanent download URLs

---

# 🛠 Deployment Guide

## 1. Create Cloudflare Worker

Go to:

[https://workers.cloudflare.com](https://workers.cloudflare.com)

Create new worker and paste:

```
worker.js
```

---

## 2. Set GitHub Repo

Update this line:

```
const GITHUB_REPO = 'username/repo-name';
```

Example:

```
const GITHUB_REPO = 'pixovia/github-storage';
```

---

## 3. Add GitHub Token

Create GitHub token:

GitHub → Settings → Developer Settings → Personal Access Token

Required permissions:

* repo
* releases

Then add to Cloudflare Worker:

Environment Variable:

```
GITHUB_TOKEN
```
🔐 Secrets Configuration

This project requires a GitHub token to upload files to GitHub Releases.

Add Secret in Cloudflare Worker

After deploying worker.js, add the following secret:

Steps
Go to Cloudflare Dashboard
Open Workers & Pages
Select your Worker
Go to Settings → Variables
Under Secrets, click Add Secret

Add:

Secret Name: GITHUB_TOKEN
Secret Type: Secret
Value: Your GitHub Personal Access Token

After adding, it will appear as:

GITHUB_TOKEN    Value encrypted
Required GitHub Token Permissions

Create a GitHub Personal Access Token with:

repo

This allows the worker to:

Create Releases
Upload Files
Manage Release Assets
How It Works

The worker automatically reads the secret:

env.GITHUB_TOKEN

This keeps the GitHub token secure and prevents exposure in frontend code.
---

# 📡 API Usage

POST Request:

```
POST /upload
```

Form Data:

```
file
fileType
fileName
```

Example Response:

```
{
  "success": true,
  "url": "https://github.com/...",
  "size": 12345,
  "type": "video"
}
```

---

# 💡 Example Frontend Upload

```javascript
const formData = new FormData();
formData.append("file", file);
formData.append("fileType", "video");
formData.append("fileName", file.name);

fetch("YOUR_WORKER_URL", {
  method: "POST",
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

---

# 🔐 Security Notes

* GitHub token stored in Cloudflare env
* No token exposed to frontend
* CORS enabled
* File size validation

---

# 📦 How Pixovia Used This

Pixovia Library Upload Flow:

```
User Upload
↓
Pixovia UI
↓
Cloudflare Worker
↓
GitHub Releases
↓
Supabase DB Store URL
```

Pixovia Full Source:

[https://github.com/pixovia/pixovia-main](https://github.com/pixovia/pixovia-main)

---

# 📈 Benefits Over Traditional Storage

* No storage cost
* GitHub CDN
* Version control
* Easy backup
* Public hosting

---

# ⚠️ Limitations

* GitHub rate limits
* Large file upload time
* Public repository visibility

---

# 🤝 Contributing

Feel free to:

* Improve uploader
* Add chunk upload
* Add retry system
* Add progress tracking

---

# 📜 License

MIT License

---

# 👤 Author

Pixovia Project

Pixovia Main Project:
[https://github.com/pixovia/pixovia-main](https://github.com/pixovia/pixovia-main)

---

# ⭐ Support

If this project helped you:

* Star repo
* Fork project
* Build improvements

---

# 📌 Final Note

This uploader powered the Pixovia ecosystem storage system.

Now open sourced for community usage and improvements.

---

**Pixovia — Open Infrastructure for Content Libraries**
