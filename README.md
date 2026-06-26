# 🧩 Slot Swapper — Smart Event Scheduler

> 🚀 A modern web application for managing personal events, marking them as swappable, and exchanging slots between users in real-time.  
> Built using **React.js** (frontend) + **FastAPI** (backend) + **SQLAlchemy** (database).  

---

## 📖 Overview
**Slot Swapper** allows users to:
- Create and manage personal events.
- Mark events as **swappable** to make them visible in the marketplace.
- Request swaps with other users’ events.
- Accept or reject swap requests easily.

---

## 🏗️ Tech Stack
| Layer | Technology | Description |
|-------|-------------|-------------|
| **Frontend** | ⚛️ React.js | Interactive UI |
| **Backend** | ⚡ FastAPI | REST API |
| **Database** | 🐬 MySQL / SQLite | Event and User Data |
| **Auth** | 🔐 JWT | Secure Login |
| **Styling** | 🎨 CSS3 + Custom Theme | Modern Dark UI |
| **Notifications** | ✉️ Email / Real-time ready | Swap updates |

---

## 🌟 Features
✅ User Authentication  
✅ Event Management  
✅ Marketplace  
✅ Swap Requests  
✅ Real-Time Updates  
✅ Responsive UI  
✅ Email Notification Ready  

---

## ⚙️ Installation & Setup
### 🧰 Prerequisites
- Node.js v16+
- Python 3.9+
- MySQL or SQLite

### 🖥️ Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend ➜ http://127.0.0.1:8000

### 💻 Frontend Setup (React)
```bash
cd slot-swapper
npm install
npm start
```
Frontend ➜ http://localhost:3000

---

## 🧱 Project Structure
```
slot-swapper/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   ├── utils.py
│   └── requirements.txt
├── src/
│   ├── api.js
│   ├── App.js
│   ├── components/
│   │   ├── CalendarView.js
│   │   ├── Marketplace.js
│   │   ├── RequestsView.js
│   │   ├── Notifications.js
│   │   ├── *.css
│   └── index.js
├── public/
│   ├── slot-icon.png
│   ├── index.html
│   └── manifest.json
└── README.md
```

---

## 🔔 Future Enhancements
🚧 Planned:
- WebSocket real-time alerts
- Email notifications
- Calendar visualization
- Admin dashboard
- Google Calendar integration

---

## 🧑‍💻 Developer
**Name:** Abhishek Kurhade  
**Role:** Full Stack Developer  
**Email:** abhishekkurhade@gmail.com  
**Project:** Slot Swapper — Smart Event Scheduler

---

## 💖 Acknowledgments
Thanks to **FastAPI**, **React**, and **Tailwind-inspired CSS** for powering this project.

---


