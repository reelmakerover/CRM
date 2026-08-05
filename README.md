# 🎓 D's Education — Full-Stack ERP & Exam Management System

**Led by Vikram Rathore Sir | Built with MERN Stack**

---

## 📁 Project Structure

```
ds-education/
├── server/                  # Node.js + Express Backend
│   ├── index.js             # Entry point
│   ├── .env.example         # Environment template
│   ├── models/
│   │   ├── User.js          # Auth (admin + student)
│   │   ├── Student.js       # Student records + fees
│   │   ├── Course.js        # Courses
│   │   ├── Subject.js       # Subjects per course
│   │   ├── Batch.js         # Batch scheduling
│   │   ├── Question.js      # Question bank
│   │   ├── Exam.js          # Exam config
│   │   ├── Result.js        # Exam results
│   │   ├── Topper.js        # Hall of fame
│   │   └── Settings.js      # SMTP + site config
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── middleware/          # JWT auth middleware
│   └── utils/
│       └── mailer.js        # SMTP email utility
│
└── client/                  # React.js Frontend
    ├── src/
    │   ├── App.js            # Routes
    │   ├── context/
    │   │   └── AuthContext.js # JWT auth state
    │   ├── utils/api.js      # Axios client
    │   ├── pages/
    │   │   ├── HomePage.js   # Landing page
    │   │   ├── CoursesPage.js
    │   │   ├── BatchesPage.js
    │   │   ├── ResultsPage.js
    │   │   ├── ContactPage.js
    │   │   ├── LoginPage.js
    │   │   ├── admin/        # Admin panel pages
    │   │   └── student/      # Student portal pages
    │   └── components/
    │       ├── common/       # Navbar, Footer
    │       ├── admin/        # AdminLayout
    │       └── student/      # StudentLayout
    └── tailwind.config.js
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Server
cd ds-education/server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and SMTP credentials

# Client
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ds-education
JWT_SECRET=your_very_secret_key_change_this
CLIENT_URL=http://localhost:3000

# SMTP (Gmail recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password_not_regular_password
```

### 3. Seed Admin Account

```bash
cd server
# Start server, then run:
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Vikram Rathore","email":"admin@dseducation.in","password":"Admin@123"}'
```

### 4. Run Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

Open: `http://localhost:3000`

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dseducation.in | Admin@123 |
| Student | (created by admin) | DSE@XXXX (last 4 digits of phone) |

> ⚠️ Change these in production!

---

## 📋 Admin Panel Features

### 👨‍🎓 Student Management
- Add students with auto-generated enrollment numbers (DSE2024XXXX)
- Auto-creates student login account
- Track fees: total / paid / pending / installments
- Filter by course, batch, name/email

### 📚 Course & Subject Management
- Full CRUD for courses
- Subjects linked to courses
- Category tags: School, Commerce, Professional

### 📢 Batch Management
- Create batches with seats, timing, mode (offline/online/hybrid)
- Track enrollments vs. capacity
- Status: upcoming → active → completed

### 📝 Exam Management
- Create exams: configure questions count, duration, passing marks
- Negative marking toggle
- Status control: draft → active → completed

### ❓ Question Bank
- Add questions manually (one by one)
- **Bulk import via Excel** — download the template:

| Question | Option A | Option B | Option C | Option D | Correct Answer | Course | Subject |
|----------|----------|----------|----------|----------|----------------|--------|---------|
| What is... | Answer1 | Answer2 | Answer3 | Answer4 | A | CA Foundation | Accounts |

### 📊 Results
- View all results with grade color coding
- Switch between list view and leaderboard
- Filter by exam

### 🏆 Toppers
- Manage hall of fame entries
- Shown on public homepage and results page

### 📩 Notifications
- Send announcements to all parents or specific emails
- Automated: exam result emails sent after every submission

### ⚙️ Settings
- Configure SMTP from the admin panel UI
- Test email before saving

---

## 🎓 Student Portal Features

- **Dashboard**: Profile, course info, fee status, recent results
- **Exams**: List of active exams for their course
- **Exam Room**:
  - 50 random questions from 150+ bank
  - Options shuffled per student
  - Timer with auto-submit on expiry
  - Tab switch detection (3 warnings → auto-submit)
  - Fullscreen enforcement
- **Results**: Full result history with score breakdown
- **Profile**: View personal and course information

---

## 🧠 Smart Exam Engine

```
Question Bank: 150+ questions per subject
      ↓
Random Selection: Picks 50 unique questions per student
      ↓
Order Shuffle: Questions appear in different order
      ↓
Option Shuffle: A/B/C/D shuffled → no two students see same arrangement
      ↓
Submit → Auto Evaluate → Calculate Rank → Send Parent Email
```

---

## 📧 SMTP Email Setup (Gmail)

1. Go to: [Google Account → Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Select app: **Mail**, device: **Other** → Generate
5. Copy the 16-char password
6. Paste into Admin Panel → Settings → SMTP Password

---

## 🏗️ Production Deployment

### Backend (Railway / Render)
```bash
cd server
# Set environment variables in dashboard
npm start
```

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Deploy build/ folder
# Set REACT_APP_API_URL to your backend URL
```

### MongoDB Atlas
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add connection string to `MONGO_URI`

---

## 🔒 Security Features

- JWT authentication with 30-day expiry
- Bcrypt password hashing (12 rounds)
- Role-based access control (admin/student)
- Exam anti-cheating: question randomization, option shuffle, tab detection
- Admin-only student account creation (no self-registration)

---

## 📱 Responsive Design

- Mobile-first Tailwind CSS
- Premium glassmorphism design language
- Playfair Display + DM Sans typography
- Smooth animations and hover states
- Works on all devices from 320px+

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#2563eb` | Buttons, accents |
| Dark Blue | `#1e3a8a` | Hero, sidebar |
| Gold | `#f59e0b` | CTAs, highlights |
| Emerald | `#10b981` | Success states |
| Rose | `#f43f5e` | Errors, alerts |

---

Built with ❤️ for **D's Education** — Vikram Rathore Sir's Result-Driven Commerce Institute.
