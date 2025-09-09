import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import UserList from './components/UserList';
import PostList from './components/PostList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Frontend Assignment</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/posts" element={<PostList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;