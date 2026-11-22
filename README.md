# Eventora – Event Management & Booking Platform

Eventora is a full-stack event management and booking platform built using React, Node.js, Express.js and MongoDB.

The platform allows users to explore events, register and verify their accounts through OTP, book events and manage their bookings. Administrators can manage events and oversee the platform.

## Features

### User Features
- User registration and login
- Email OTP verification
- Browse available events
- View detailed event information
- Book events with OTP verification
- View personal bookings
- Cancel bookings
- View booking and payment status

### Admin Features
- Admin authentication
- Create new events
- Update existing events
- Delete events
- Manage event information

### Additional Features
- JWT-based authentication
- Password hashing using bcrypt
- Email notifications using Nodemailer
- MongoDB database integration
- Responsive React interface
- REST API architecture

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend |
| Vite | Frontend development and build |
| Tailwind CSS | Styling |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB Atlas | Database |
| Mongoose | Database modelling |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Nodemailer | Email notifications |
| Axios | API communication |

## Project Structure

```text
Eventora/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── package.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js (LTS version)
- npm
- MongoDB Atlas account or local MongoDB instance
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Eventora
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
JWT_SECRET=your_secure_jwt_secret
```

Replace the placeholder values with your own credentials.

### 4. Start the application

Run the following command from the root Eventora directory:

```bash
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:5000

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/verify-otp` | Verify OTP |
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create event (admin) |
| PUT | `/api/events/:id` | Update event (admin) |
| DELETE | `/api/events/:id` | Delete event (admin) |
| POST | `/api/bookings/send-otp` | Send booking OTP |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | Get user bookings |
| DELETE | `/api/bookings/:id` | Cancel booking |

## Security

- Passwords are hashed before storage.
- JWT tokens are used for protected routes.
- Environment variables are used for sensitive configuration.
- Never commit database credentials, email passwords or JWT secrets.

## Future Improvements

- Integrate a verified payment gateway.
- Add automated backend and frontend tests.
- Improve booking concurrency and seat availability handling.
- Add event search, sorting and filtering.
- Deploy the application with production environment configuration.

## Author

**Vansh**

Full-stack development project built to explore event management, authentication, REST APIs and database integration.
