import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <h2>Welcome to the Management System</h2>
      <p>Select a section to manage:</p>
      
      <div className="navigation-cards">
        <Link to="/users" className="nav-card">
          <div className="card-icon">👥</div>
          <h3>Users</h3>
          <p>Manage users - Create, Read, Update, Delete</p>
        </Link>
        
        <Link to="/posts" className="nav-card">
          <div className="card-icon">📝</div>
          <h3>Posts</h3>
          <p>Manage posts - Create, Read, Update, Delete</p>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;