# KDramaLog: A K-Drama Tracker & Social Hub

A full-stack web application for K-Drama enthusiasts to track, rate, and discuss their favorite shows while connecting with a community of fellow fans.

![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

## 🎯 Project Overview

KDramaLog is a specialized tracking platform designed specifically for K-Drama fans. Unlike general media trackers, it focuses on the unique needs of the K-Drama community with features for tracking watch progress, rating shows, and social interaction with other enthusiasts.

**Live Demo:** [Coming Soon](#)

## ✨ Features

### Core Features
- **User Authentication** - Secure JWT-based registration and login system
- **Drama Database** - Comprehensive collection of K-Dramas with details
- **Watchlist Management** - Track shows with statuses (watching, completed, dropped)
- **Rating & Reviews** - Rate dramas (1-10) and leave detailed reviews
- **Social Features** - Follow other users and view their activity
- **Search Functionality** - Find dramas by title, actor, or genre
- **Responsive Design** - Optimized for both desktop and mobile devices

### Stretch Goals
- Comment threads under reviews
- Episode-level tracking
- Personalized recommendations
- OAuth integration (Google/Kakao)
- Dark mode toggle
- Achievement badges

## 🛠️ Tech Stack

### Frontend
- **React** - Component-based UI library
- **React Router** - Navigation and routing
- **Bootstrap** - Responsive styling framework
- **CSS** - Custom styling and animations
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Database
- **PostgreSQL** - Relational database management system
- **Custom API** - Built specifically for K-Drama data

### Deployment
- **Frontend Hosting** - Netlify/Vercel
- **Backend Hosting** - Heroku/Railway
- **Database Hosting** - Supabase/Heroku Postgres
- **Media Storage** - Supabase Storage/Cloudinary (if needed)

## 📊 Database Schema

```sql
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

dramas (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  synopsis TEXT,
  release_year INTEGER,
  genre VARCHAR(100),
  poster_url TEXT,
  total_episodes INTEGER
);

actors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  photo_url TEXT
);

drama_actors (
  drama_id INTEGER REFERENCES dramas(id),
  actor_id INTEGER REFERENCES actors(id),
  PRIMARY KEY (drama_id, actor_id)
);

watchlists (
  user_id INTEGER REFERENCES users(id),
  drama_id INTEGER REFERENCES dramas(id),
  status VARCHAR(20) CHECK (status IN ('watching', 'completed', 'dropped', 'plan_to_watch')),
  current_episode INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, drama_id)
);

reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  drama_id INTEGER REFERENCES dramas(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  comment TEXT,
  date_posted TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, drama_id)
);

follows (
  follower_id INTEGER REFERENCES users(id),
  followed_id INTEGER REFERENCES users(id),
  PRIMARY KEY (follower_id, followed_id)
);

likes (
  user_id INTEGER REFERENCES users(id),
  drama_id INTEGER REFERENCES dramas(id),
  PRIMARY KEY (user_id, drama_id)
);
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup
1. Clone the repository
```bash
git clone <repository-url>
cd kdramalog-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. Set up database
```bash
# Create database
createdb kdramalog

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

5. Start the development server
```bash
npm run dev
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd kdramalog-frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your API endpoint
```

4. Start the development server
```bash
npm start
```

## 📱 User Flow

1. **Unauthenticated Users:**
   - Browse dramas and view basic information
   - Search for specific dramas or actors
   - View public reviews and ratings
   - Register or login to access full features

2. **Authenticated Users:**
   - Create and manage personal watchlist
   - Rate and review dramas
   - Follow other users and view their activity
   - Update profile with avatar and preferences
   - Receive personalized recommendations

## 🎨 UI/UX Approach

The interface prioritizes:
- Visual appeal with K-Drama themed design elements
- Mobile-first responsive design
- Intuitive navigation and user flows
- Social media-inspired interaction patterns
- Clean presentation of drama information with rich visuals

## 🔮 Future Enhancements

- Integration with MyDramaList API for expanded content
- Real-time notifications for new episodes
- Group watch parties with synchronized viewing
- Advanced filtering and sorting options
- Drama recommendation engine
- Multi-language support

## 👥 Target Audience

- Primarily women ages 18-40 who enjoy K-Dramas
- Based in North America, Latin America, and Southeast Asia
- Users looking to track, rate, and share opinions on K-Dramas
- Casual fans as well as heavy binge-watchers and community participants

## 🧠 Challenges

- Implementing secure authentication with JWT
- Designing efficient database queries for social features
- Ensuring responsive design across devices
- Managing state across complex component hierarchies
- Potential integration with third-party APIs

## 📝 License

This project is created for educational purposes as part of a capstone project.

## 👩‍💻 Developer

**Thalia Cantero**  
Full-Stack Developer specializing in React and Node.js applications.

---

*This project was created as part of a coding bootcamp capstone project.*