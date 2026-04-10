# Backend API Contract (Use Axios)

เอกสารนี้สรุป endpoint ที่ frontend จะเรียกใช้งาน โดยให้ backend implement ตามเส้นด้านล่างตรงๆ

## Base URL
- HTTP: `http://localhost:8080`
- WS: `ws://localhost:8080`

---

## Required Endpoints
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `GET /api/health`
- `GET /api/admin/content?locale=en|th`
- `PUT /api/admin/content?locale=en|th`
- `POST /api/admin/content/publish?locale=en|th`
- `GET /api/admin/content/history?locale=en|th`
- `POST /api/admin/upload`
- `GET /api/content?locale=en|th`
- `GET ws://localhost:8080/api/chat/ws`

---

## Suggested Request/Response

### `POST /api/admin/login`
Request:
```json
{
  "username": "admin",
  "password": "******"
}
```
Response 200:
```json
{
  "ok": true,
  "user": {
    "id": "u_001",
    "username": "admin",
    "role": "admin"
  }
}
```

### `POST /api/admin/logout`
Response 200:
```json
{ "ok": true }
```

### `GET /api/admin/me`
Response 200:
```json
{
  "authenticated": true,
  "user": {
    "id": "u_001",
    "username": "admin",
    "role": "admin"
  }
}
```

### `GET /api/health`
Response 200:
```json
{
  "ok": true,
  "service": "portfolio-backend",
  "time": "2026-04-09T15:00:00Z"
}
```

### `GET /api/admin/content?locale=en|th`
Response 200:
```json
{
  "locale": "en",
  "version": 12,
  "updated_at": "2026-04-09T15:00:00Z",
  "content": {
    "technical": [
      {
        "id": "tech_1",
        "title": "Angular",
        "description": "Enterprise-grade reactive frontend architecture."
      }
    ],
    "projects": [
      {
        "id": "proj_1",
        "tag": "AI PLATFORM",
        "title": "Nexus AI Dashboard",
        "description": "...",
        "images": [
          "https://cdn.example.com/portfolio/projects/cover.jpg",
          "https://cdn.example.com/portfolio/projects/detail-1.jpg"
        ]
      }
    ],
    "portfolioInfo": {
      "ownerName": "Peerapat",
      "title": "Peerapat",
      "subtitle": "Fullstack Developer with AI Integration",
      "about": "...",
      "contactEmail": "",
      "contactPhone": "",
      "location": ""
    }
  }
}
```

### `PUT /api/admin/content?locale=en|th`
Request:
```json
{
  "version": 12,
  "content": {
    "technical": [],
    "projects": [],
    "portfolioInfo": {
      "ownerName": "",
      "title": "",
      "subtitle": "",
      "about": "",
      "contactEmail": "",
      "contactPhone": "",
      "location": ""
    }
  }
}
```
Response 200:
```json
{
  "ok": true,
  "version": 13,
  "updated_at": "2026-04-09T15:10:00Z"
}
```

### `POST /api/admin/content/publish?locale=en|th`
Response 200:
```json
{
  "ok": true,
  "published_version": 13,
  "published_at": "2026-04-09T15:15:00Z"
}
```

### `GET /api/admin/content/history?locale=en|th`
Response 200:
```json
{
  "items": [
    {
      "version": 13,
      "updated_at": "2026-04-09T15:10:00Z",
      "updated_by": "admin"
    },
    {
      "version": 12,
      "updated_at": "2026-04-09T14:00:00Z",
      "updated_by": "admin"
    }
  ]
}
```

### `POST /api/admin/upload`
Request: `multipart/form-data` with field `file`

Response 200:
```json
{
  "ok": true,
  "objectKey": "portfolio/projects/2026/04/cover-abc123.jpg",
  "url": "https://cdn.example.com/portfolio/projects/2026/04/cover-abc123.jpg"
}
```

### `GET /api/content?locale=en|th`
Response 200:
```json
{
  "locale": "en",
  "content": {
    "technical": [],
    "projects": [],
    "portfolioInfo": {}
  }
}
```

### `GET ws://localhost:8080/api/chat/ws`
WebSocket event format:
- `status`
- `token`
- `done`
- `error`

---

## Axios Client Example

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const adminApi = {
  login: (payload: { username: string; password: string }) =>
    api.post("/api/admin/login", payload),

  logout: () => api.post("/api/admin/logout"),

  me: () => api.get("/api/admin/me"),

  health: () => api.get("/api/health"),

  getContent: (locale: "en" | "th") =>
    api.get("/api/admin/content", { params: { locale } }),

  saveContent: (locale: "en" | "th", payload: unknown) =>
    api.put("/api/admin/content", payload, { params: { locale } }),

  publishContent: (locale: "en" | "th") =>
    api.post("/api/admin/content/publish", null, { params: { locale } }),

  getHistory: (locale: "en" | "th") =>
    api.get("/api/admin/content/history", { params: { locale } }),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getPublicContent: (locale: "en" | "th") =>
    api.get("/api/content", { params: { locale } }),
};
```

---

## Note
- รูป project จะเก็บใน MinIO ฝั่ง backend และคืน URL กลับมาให้ frontend เก็บใน `projects[].image`
- รูป project จะเก็บใน MinIO ฝั่ง backend และคืน URL กลับมาให้ frontend เก็บใน `projects[].images[]`
- หากใช้ cookie session ให้ตั้ง `httpOnly + secure + sameSite=lax`
