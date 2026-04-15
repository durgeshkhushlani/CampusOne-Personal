# 🎓 CampusOne — Unified Digital Campus Management Platform

A centralized university ERP platform built on the MERN stack (MongoDB, Express.js, React.js, Node.js) serving Students, Faculty, and Admin/Staff — each with separate interfaces after login.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React.js, Tailwind CSS v4, DaisyUI |
| Backend        | Node.js, Express.js                |
| Database       | MongoDB with Mongoose ODM          |
| Authentication | JWT + bcrypt                       |
| Dev Server     | Vite (frontend), Nodemon (backend) |

## Integrated Modules

| Module | Description |
|--------|-------------|
| **ERP** | Student records, attendance, fees, timetable, exams |
| **Classroom** | Google Classroom-style class management |
| **HireSphere** | Campus placement & hiring portal |
| **CodeStage** | Online coding judge & problem bank |

## Project Structure

```
CampusOne/
├── server/                 # Backend API (Deploy to Render)
│   ├── config/             # DB & email configuration
│   ├── controllers/        # Route handlers (auth, erp, classroom, hiresphere, codestage)
│   ├── middleware/          # Auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── services/           # Business logic services
│   ├── uploads/            # File uploads directory
│   ├── .env.example        # Environment variables template
│   └── index.js            # Entry point
├── client/                 # Frontend React app (Deploy to Vercel)
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, PrivateRoute)
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Page components (erp/, classroom/, hiresphere/, codestage/)
│   │   ├── utils/          # API utility (Axios instance)
│   │   └── App.jsx         # Root component with routing
│   ├── vercel.json         # Vercel SPA rewrite config
│   ├── index.html
│   └── vite.config.js
├── .env                    # Local environment variables (not committed)
├── .env.production.example # Production env template
├── .gitignore
├── render.yaml             # Render deployment blueprint
├── package.json            # Root scripts (dev, seed, install-all)
└── README.md
```

---

## 🖥️ Local Development

### Prerequisites

- **Node.js** v18+ installed
- **MongoDB** running locally on `mongodb://localhost:27017` (or provide a remote URI)

### 1. Clone & Setup Environment

```bash
cd server
cp .env.example .env
# Edit .env if needed (default values work for local development)
```

### 2. Install Dependencies

```bash
# From project root
npm run install-all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Seed the Database

```bash
npm run seed
```

This creates **61 users**: 50 students, 10 faculty, and 1 admin.

### 4. Run in Development

```bash
# From project root — starts both server & client
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

---

## 🚀 Production Deployment

### Backend → Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml`, or configure manually:
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && node index.js`
5. Set environment variables in Render dashboard:
   | Variable | Value |
   |----------|-------|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A strong random secret |
   | `CLIENT_URL` | Your Vercel frontend URL (e.g. `https://campusone.vercel.app`) |
   | `PORT` | `5000` |

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set the **Root Directory** to `client`
4. Framework Preset: **Vite**
5. Set environment variables in Vercel dashboard:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your Render backend URL + `/api` (e.g. `https://campusone-api.onrender.com/api`) |

6. Deploy! The `vercel.json` handles SPA routing automatically.

---

## Default Login Credentials

### Admin
| Email | Password |
|---|---|
| `admin@campusone.edu` | `Admin@123` |

### Faculty (sample)
| Email | Password |
|---|---|
| `rajeshsharma@campusone.edu` | `Faculty@123` |
| `sunitaverma@campusone.edu` | `Faculty@123` |

### Students (sample)
| Email | Password |
|---|---|
| `aaravsharma@campusone.edu` | `Student@123` |
| `vivaanverma@campusone.edu` | `Student@123` |

> All student emails follow the format `firstnamelastname@campusone.edu` with password `Student@123`
> All faculty emails follow the format `firstnamelastname@campusone.edu` with password `Faculty@123`

## API Endpoints

| Method | Endpoint          | Description                    | Auth Required |
|--------|-------------------|--------------------------------|---------------|
| GET    | `/api/health`     | Health check                   | No            |
| POST   | `/api/auth/login` | Login with email & password    | No            |
| GET    | `/api/auth/me`    | Get current user profile       | Yes (Bearer)  |
| GET    | `/api/erp/*`      | ERP module routes              | Yes           |
| GET    | `/api/classroom/*`| Classroom module routes        | Yes           |
| GET    | `/api/hiresphere/*`| HireSphere module routes      | Yes           |
| GET    | `/api/codestage/*`| CodeStage module routes        | Yes           |

---

© 2025 CampusOne. Built with the MERN Stack.
