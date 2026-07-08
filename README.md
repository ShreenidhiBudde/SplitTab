# SplitTab

A Splitwise-inspired full-stack expense sharing platform built with **React**, **FastAPI**, and **PostgreSQL**. SplitTab enables users to manage shared expenses through group management, equal expense splitting, real-time balance tracking, and optimized settlement suggestions.

---

## Overview

SplitTab is a full-stack web application that simplifies shared expense management. Users can create groups, add members, record expenses, track balances, and settle debts efficiently. The application uses a greedy debt-minimization algorithm to generate optimized settlement suggestions.

---

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes

### Group Management
- Create groups
- Add members
- View joined groups

### Expense Management
- Add shared expenses
- Equal expense splitting
- Expense history

### Balance Tracking
- Real-time balance calculation
- Shows who owes money and who should receive money
- Automatic balance updates after expenses and settlements

### Settlements
- Settlement suggestions using a greedy debt-minimization algorithm
- Record settlements
- Settlement history

### Dashboard
- Total groups
- Total expenses
- Total amount spent
- Amount owed
- Amount to receive
- Net balance
- Recent activity

---

## Tech Stack

### Frontend
- React
- Vite
- Axios
- React Router

### Backend
- Python
- FastAPI
- JWT Authentication
- bcrypt
- psycopg2

### Database
- PostgreSQL

---

## System Architecture

```text
                User
                  │
                  ▼
         React + Vite Frontend
                  │
          REST API (Axios)
                  │
                  ▼
          FastAPI Backend
                  │
      psycopg2 Connection Pool
                  │
                  ▼
          PostgreSQL Database
```

---

## Project Structure

```text
SplitTab/
│
├── backend/
│   ├── models/
│   ├── routers/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── queries.sql
│
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/ShreenidhiBudde/SplitTab.git
cd SplitTab
```

Replace `<your-username>` with your GitHub username.

---

### Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the backend.

```bash
uvicorn main:app --reload
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

### Database Setup

Create a PostgreSQL database.

Execute:

```sql
database/schema.sql
```

(Optional)

```sql
database/seed.sql
```

Create a `.env` file inside `backend/`.

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
```

---

## API Overview

The backend exposes REST APIs for:

- Authentication
- Group Management
- Expense Management
- Balance Calculation
- Settlement Suggestions
- Settlement Recording
- Dashboard Summary

---

## Technical Highlights

- RESTful API architecture
- JWT-based authentication
- Password hashing using bcrypt
- PostgreSQL normalized relational schema
- UUID primary keys
- NUMERIC datatype for monetary values
- psycopg2 connection pooling
- Dynamic balance computation
- Greedy debt-minimization algorithm for settlement suggestions

---

## Screenshots

### Login

![Login](images/login.png)

---

### Dashboard

![Dashboard](images/dashboard.png)

---

### Groups

![Groups](images/groups.png)

---

### Group Details

![Group Details](images/group-details.png)

---

### Balances

![Balances](images/balances.png)

---

### Settlements

![Settlements](images/settlements.png)

---

## Future Improvements

- Google OAuth
- Email verification
- Custom expense splitting
- Receipt upload
- Expense analytics
- Notifications
- Docker deployment

---

## License

This project is intended for educational and portfolio purposes.
