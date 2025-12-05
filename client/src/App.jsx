import { Routes, Route } from 'react-router-dom';
import Navigation from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';       
import Register from './pages/Register';
import ShowDetails from './pages/ShowDetails'; 
import Watchlist from './pages/Watchlist';
import Search from './pages/Search';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Feed from './pages/Feed';
import ActorDetails from './pages/ActorDetails';
//import { Container } from 'react-bootstrap';

function App() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navigation />
      
      {/* Main Content Area */}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shows/:id" element={<ShowDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/shows/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:id" element={<PublicProfile />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/actors/:id" element={<ActorDetails />} />
          {/* Add more routes here later */}
        </Routes>
      </main>

      {/* Simple Footer */}
      <footer className="bg-light py-3 mt-auto text-center text-muted">
        <small>&copy; 2024 KDramaLog</small>
      </footer>
    </div>
  );
}

export default App;