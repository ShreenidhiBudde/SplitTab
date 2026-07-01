# 💸 SplitTab

> A Splitwise-inspired full-stack expense sharing platform built with **React, FastAPI, and PostgreSQL** that simplifies group expense management through real-time balance tracking and optimized settlement suggestions.

## ✨ Overview

SplitTab is a full-stack web application that enables users to manage shared expenses within groups. Users can create groups, add members, split expenses equally, monitor real-time balances, record settlements, and receive optimized settlement suggestions using a greedy debt-minimization algorithm.

The project follows a modern client-server architecture with a React frontend, FastAPI backend, and PostgreSQL database.

---

## 🚀 Features

### 👤 Authentication
- Secure user registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes

### 👥 Group Management
- Create expense groups
- Add members to groups
- View all joined groups

### 💰 Expense Management
- Add shared expenses
- Equal expense splitting
- Expense history for every group

### 📊 Balance Tracking
- Real-time balance calculation
- Shows who owes money and who should receive money
- Automatic balance updates after expenses and settlements

### 🤝 Settlement System
- Greedy debt-minimization algorithm for settlement suggestions
- Record settlements between members
- Settlement history
- Automatically updates outstanding balances

### 📈 Dashboard
- Total groups
- Total expenses
- Total amount spent
- Amount owed
- Amount to receive
- Net balance
- Recent activity feed

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- Axios
- React Router

## Backend
- Python
- FastAPI
- JWT Authentication
- bcrypt
- psycopg2

## Database
- PostgreSQL

---

# 🏗 System Architecture

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

# 📂 Project Structure

```text
SplitTab/
│
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models/
│   ├── routers/
│   ├── schema.sql
│   ├── seed.sql
│   └── requirements.txt
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
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd SplitTab
```

---

## 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv
```

Activate virtual environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run the backend

```bash
uvicorn main:app --reload
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 4️⃣ Database Setup

Create a PostgreSQL database.

Execute the provided SQL schema.

```sql
schema.sql
```

(Optional)

```sql
seed.sql
```

Configure your database credentials inside:

```
backend/.env
```

---

## 5️⃣ Environment Variables

Backend `.env`

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

# 🔗 API Overview

The backend exposes RESTful APIs for:

### Authentication
- Register User
- Login User

### Groups
- Create Group
- View Groups
- Add Members

### Expenses
- Add Expense
- Get Expenses

### Balances
- Get Group Balances

### Settlements
- Settlement Suggestions
- Record Settlement
- Settlement History

### Dashboard
- Dashboard Summary
- Recent Activity

---

# 🧠 Technical Highlights

- RESTful API architecture
- JWT authentication
- Password hashing using bcrypt
- PostgreSQL normalized relational schema
- UUID-based primary keys
- NUMERIC data type for accurate monetary calculations
- psycopg2 connection pooling
- Dynamic balance computation
- Greedy debt-minimization algorithm for settlement suggestions

---

# 📸 Screenshots

## Dashboard

![Dashboard Screenshot](images/dashboard.png)

---

## Groups

![Groups Screenshot](images/groups.png)

---

## Expenses

![Expenses Screenshot](images/expenses.png)

---

## Balances

![Balances Screenshot](images/balances.png)

---

## Settlement Suggestions

![Settlement Screenshot](images/settlements.png)

---

# 🚀 Future Improvements

- Google OAuth authentication
- Email verification
- Custom expense splitting
- Expense categories
- Group cover images
- Receipt image upload
- Receipt OCR
- Expense analytics
- Notifications
- Deployment with Docker

---

# 📚 Learning Outcomes

This project helped me gain practical experience with:

- Full-stack web development
- React application architecture
- FastAPI backend development
- REST API design
- JWT authentication
- Password hashing
- PostgreSQL database design
- SQL query optimization
- Connection pooling
- State management
- Real-world balance computation
- Greedy algorithms for debt minimization

---

# 🤝 Contributing

Contributions, issues, and feature suggestions are welcome.

Feel free to fork the repository and submit a pull request.

---

# 📄 License

This project is intended for educational and portfolio purposes.

---

## 👨‍💻 Author

**Nidhi B**

If you found this project helpful, consider giving it a ⭐ on GitHub.
