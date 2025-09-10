import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import { userAPI, postAPI } from '../services/api';
import './UserList.css';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [userPosts, setUserPosts] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchUsers();
    fetchPostCounts();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostCounts = async () => {
    try {
      const posts = await postAPI.getAll();
      const counts: { [key: number]: number } = {};
      posts.forEach(post => {
        counts[post.userId] = (counts[post.userId] || 0) + 1;
      });
      setUserPosts(counts);
    } catch (err) {
      console.error('Failed to fetch post counts:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        setUsers(users.filter(user => user.id !== id));
        alert('User deleted successfully!');
      } catch (err) {
        alert('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      await userAPI.update(id, formData);
      setUsers(users.map(user => user.id === id ? { ...user, ...formData } : user));
      setEditingUser(null);
      setFormData({});
      alert('User updated successfully! (Note: JSONPlaceholder simulates update)');
    } catch (err) {
      alert('Failed to update user');
      console.error(err);
    }
  };

  const handleAdd = async () => {
    try {
      if (!formData.name || !formData.username || !formData.email) {
        alert('Please fill all required fields');
        return;
      }
      const newUser = await userAPI.create(formData);
      // JSONPlaceholder always returns id: 11 for new users, so we create a unique ID
      const uniqueUser = { ...newUser, id: Math.max(...users.map(u => u.id)) + 1 };
      setUsers([...users, uniqueUser]);
      setShowAddForm(false);
      setFormData({});
      alert('User added successfully!');
    } catch (err) {
      alert('Failed to add user');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setShowAddForm(false);
    setFormData({});
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-list-container">
      <div className="header">
        <h2>Users Management</h2>
        <div className="header-actions">
          <button onClick={() => setShowAddForm(true)} className="btn-add">
            <FaPlus /> Add New User
          </button>
          <Link to="/" className="btn-back">
            <IoArrowBack /> Back to Home</Link>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Add New User</h3>
          <input
            type="text"
            placeholder="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="form-actions">
            <button onClick={handleAdd} className="btn-save">Save</button>
            <button onClick={handleCancel} className="btn-cancel">Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Posts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  <Link to={`/posts?userId=${user.id}`} className="posts-link">
                    {userPosts[user.id] || 0} posts
                  </Link>
                </td>
                <td className="actions">
                  {editingUser === user.id ? (
                    <>
                      <button onClick={() => handleUpdate(user.id)} className="btn-save">
                        💾 Save
                      </button>
                      <button onClick={handleCancel} className="btn-cancel">
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(user)} className="btn-edit">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="btn-delete">
                        <FaTrash /> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;