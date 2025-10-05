# MERN Stack MVC Application

A full-stack MERN (MongoDB, Express, React, Node.js) application following the Model-View-Controller (MVC) architecture pattern.

## Project Structure

```
mern-mvc-app/
├── client/                    # React frontend (View)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/           # Images, fonts, etc.
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.css
│   │   ├── pages/            # Page components
│   │   ├── App.js            # Main App component
│   │   ├── App.css
│   │   ├── index.js          # React entry point
│   │   └── index.css
│   └── package.json
│
├── server/                    # Node/Express backend
│   ├── config/               # Configuration files
│   │   └── db.js            # Database connection
│   ├── controllers/          # Controller layer (MVC)
│   │   └── user.controller.js
│   ├── middleware/           # Custom middleware
│   ├── models/               # Model layer (MVC)
│   │   └── User.model.js
│   ├── routes/               # Route definitions
│   │   └── user.routes.js
│   ├── utils/                # Utility functions
│   ├── .env.example          # Environment variables template
│   ├── server.js             # Server entry point
│   └── package.json
│
├── .gitignore
├── package.json              # Root package.json
└── README.md

```

## Features

- **MVC Architecture**: Clean separation of concerns
- **RESTful API**: Full CRUD operations
- **React Frontend**: Modern, responsive UI
- **MongoDB Database**: NoSQL data storage
- **Express Backend**: Robust API server
- **React Router**: Client-side routing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install all dependencies:
```bash
npm run install-all
```

3. Create environment file:
```bash
cd server
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string

## Running the Application

### Development Mode (Both client and server):
```bash
npm run dev
```

### Run client only:
```bash
npm run client
```

### Run server only:
```bash
npm run server
```

The client will run on `http://localhost:3000` and the server on `http://localhost:5000`.

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Technologies Used

### Frontend
- React 18
- React Router DOM
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS
- dotenv

## License

ISC

