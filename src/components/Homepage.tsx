import { Link } from 'react-router-dom';
import { FaUsers, FaFileAlt, FaUser, FaChartBar, FaFile, FaLink } from 'react-icons/fa';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <h2>Welcome to the Management System</h2>
      <p>Select a section to manage:</p>

      <div className="navigation-cards">
        <Link to="/users" className="nav-card">
          <div className="card-icon">
            <FaUsers />
          </div>
          <h3>Users</h3>
          <p>Manage users - Create, Read, Update, Delete</p>
          <div className="card-stats">
            <span className="stat-item">
              <FaUser className="stat-icon" />
              User Management
            </span>
            <span className="stat-item">
              <FaChartBar className="stat-icon" />
              Analytics
            </span>
          </div>
        </Link>

        <Link to="/posts" className="nav-card">
          <div className="card-icon">
            <FaFileAlt />
          </div>
          <h3>Posts</h3>
          <p>Manage posts - Create, Read, Update, Delete</p>
          <div className="card-stats">
            <span className="stat-item">
              <FaFile className="stat-icon" />
              Content Management
            </span>
            <span className="stat-item">
              <FaLink className="stat-icon" />
              Relations
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;