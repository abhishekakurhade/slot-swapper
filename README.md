🧩 Slot Swapper — Smart Event Scheduler

🚀 A modern web application for managing personal events, marking them as swappable, and exchanging slots between users in real-time.
Built using React.js (frontend) + FastAPI (backend) + SQLAlchemy (database).

📖 Overview

Slot Swapper is a platform that allows users to:

Create and manage personal events (like meetings, shifts, or tasks).

Mark events as swappable to make them visible in the public marketplace.

Request swaps with other users’ events in real-time.

Accept or reject swap requests easily.

This system simplifies coordination between users by offering an intuitive interface and a real-time backend workflow.

🏗️ Tech Stack
Layer	Technology	Description
Frontend	⚛️ React.js	Interactive UI with dynamic event handling
Backend	⚡ FastAPI	High-performance REST API service
Database	🐬 MySQL / SQLite	User, Event, and Swap storage
Authentication	🔐 JWT Tokens	Secure user login & signup
Styling	🎨 CSS3 + Tailwind-inspired custom theme	Dark mode modern UI
Notifications	✉️ Email / Real-time alert ready	For swap updates and status changes
🌟 Features

✅ User Authentication — Signup and login securely.
✅ Event Management — Create, view, and toggle events between Busy and Swappable.
✅ Marketplace — Explore available swappable slots from other users.
✅ Swap Requests — Send, accept, or reject swap requests in one click.
✅ Real-Time Updates — Reflect event changes dynamically.
✅ Responsive UI — Fully optimized for desktop and mobile.
✅ Email Notification Ready — Designed to integrate email alerts for swap activity.

🖼️ UI Preview
🎨 Calendar Page

Displays all your events with clear status indicators.

Easily toggle event availability.

🛒 Marketplace

Shows other users’ swappable slots.

Lets you request swaps by selecting your event.

🔁 Requests

Displays pending, accepted, and rejected swap requests.

Shows the sender and receiver names dynamically.

⚙️ Installation & Setup
🧰 Prerequisites

Ensure you have the following installed:

Node.js
 v16+

Python
 3.9+

MySQL
 or SQLite

🖥️ Backend Setup (FastAPI)

Navigate to the backend folder:

cd backend


Create a virtual environment:

python -m venv venv
source venv/bin/activate  # On Windows use venv\Scripts\activate


Install dependencies:

pip install -r requirements.txt


Run the backend server:

uvicorn app.main:app --reload


Backend will start on ➜ http://127.0.0.1:8000

💻 Frontend Setup (React)

Navigate to frontend folder:

cd slot-swapper


Install dependencies:

npm install


Start React app:

npm start


Frontend runs on ➜ http://localhost:3000

🧱 Project Structure
slot-swapper/
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI routes & models
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── schemas.py         # Pydantic models
│   │   ├── utils.py           # Authentication helpers
│   │   └── __init__.py
│   └── requirements.txt
│
├── src/
│   ├── api.js                 # Frontend API service
│   ├── App.js                 # Main React entry
│   ├── components/
│   │   ├── CalendarView.js
│   │   ├── Marketplace.js
│   │   ├── RequestsView.js
│   │   ├── Notifications.js
│   │   ├── *.css              # Component styling
│   └── index.js
│
├── public/
│   ├── slot-icon.png          # Project logo
│   ├── index.html             # App HTML template
│   └── manifest.json
│
└── README.md

🔔 Future Enhancements

🚧 Planned improvements:

Real-time socket notifications (WebSockets)

Email alerts for swap request activity

Calendar visualization using FullCalendar.js

Admin dashboard for managing users and events

Google / Microsoft calendar integration

🧑‍💻 Developer

👨‍💻 Developer: [Abhishek Kurhade]
📧 Contact: abhishekkurhade@gmail.com

💼 Role: Full Stack Developer (React + FastAPI)
🏢 Project Title: Slot Swapper — Smart Event Scheduler

💖 Acknowledgments

Special thanks to:

FastAPI for the super-fast backend framework

React for a modern, declarative UI

Tailwind-inspired design for a sleek modern theme