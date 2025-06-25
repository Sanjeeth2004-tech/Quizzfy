# Quiz Application (MERN Stack)

A **"Quiz Application"** built using the **MERN stack** (MongoDB, Express.js, React, Node.js). Users can create, share, and take quizzes — with features like quiz history,achievements,attempting tests and custom quiz creations.

---

## Features

- 🔐 JWT-based authentication (optional)
- 📚 Take default and user-created quizzes
- ✍️ Create your own quizzes with custom questions and options
- 🕒 Timer with auto-submit on timeout
- 📊 Leaderboards with top scores
- 🧾 Save quiz attempt history (even without login)
- 📤 Share quizzes via unique codes
- 📱 Mobile responsive design

---

## 🛠 Tech Stack

### Frontend
- React.js
- Axios
- React Router DOM
- CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (optional for login)
- CORS, Body-parser

---

## 📁 Project Structure

quiz-app/
│
├── client/ # React Frontend
| ├──public/
│ ├── src/
│ │ ├── components/
│ │ ├── css/
│ │ ├── services/ # Axios configs & API calls
│ │ └── App.js
│
├── server/ # Express Backend
│ ├── models/ # Mongoose Schemas (User, Course, Question, History)
│ ├── routes/
│ ├── controllers/
│ ├── middleware/
│ └── server.js

