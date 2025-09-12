import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import { userAPI, postAPI } from '../services/api';
import './UserList.css';
import { FaEdit, FaPlus, FaTrash, FaSearch, FaSave, FaTimes } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { LiaTimesSolid } from 'react-icons/lia';
import Modal from './Modal';
import Toast from './Toast';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [userPosts, setUserPosts] = useState<{ [key: number]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: number | null }>({
    isOpen: false,
    userId: null
  });

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

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, userId: id });
  };

  const confirmDelete = async () => {
    if (deleteModal.userId) {
      try {
        await userAPI.delete(deleteModal.userId);
        setUsers(users.filter(user => user.id !== deleteModal.userId));
        setToast({ show: true, message: 'User deleted successfully!', type: 'success' });
      } catch (err) {
        setToast({ show: true, message: 'Failed to delete user', type: 'error' });
        console.error(err);
      }
    }
    setDeleteModal({ isOpen: false, userId: null });
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
      const user = users.find(u => u.id === id);

      if (user?.isLocal) {
        setUsers(users.map(u => u.id === id ? { ...u, ...formData } : u));
      } else {
        await userAPI.update(id, formData);
        setUsers(users.map(u => u.id === id ? { ...u, ...formData } : u));
      }

      setEditingUser(null);
      setFormData({});
      setToast({ show: true, message: 'User updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to update user', type: 'error' });
      console.error(err);
    }
  };
  const handleAdd = async () => {
    try {
      if (!formData.name || !formData.username || !formData.email) {
        setToast({ show: true, message: 'Please fill all required fields', type: 'error' });
        return;
      }
      const newUser = await userAPI.create(formData);
      const uniqueUser = {
        ...newUser,
        id: Math.max(...users.map(u => u.id)) + 1,
        isLocal: true
      };
      const updatedUsers = [...users, uniqueUser];
      setUsers(updatedUsers.sort((a, b) => a.id - b.id));
      setShowAddForm(false);
      setFormData({});
      setToast({ show: true, message: 'User added successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to add user', type: 'error' });
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
            <FaPlus style={{ marginRight: '0.5rem' }} /> Add New User
          </button>
          <Link to="/" className="btn-back">
            <IoArrowBack style={{ marginRight: '0.4rem' }} /> Back to Home</Link>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search"
              aria-label="Clear search"
            >
              <LiaTimesSolid />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            {filteredUsers.length === 0 && ' - Try different keywords'}
          </div>
        )}
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-results">
                  {searchTerm ? 'No users found matching your search' : 'No users available'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
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
                          <FaSave /> Save
                        </button>
                        <button onClick={handleCancel} className="btn-cancel">
                          <FaTimes /> Cancel
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
              ))
            )}
          </tbody>
        </table>
        <Modal
          isOpen={deleteModal.isOpen}
          title="Delete User"
          message={`Are you sure you want to delete ${users.find(u => u.id === deleteModal.userId)?.name}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, userId: null })}
          confirmText="Delete"
          cancelText="Cancel"
        />
        {toast?.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UserList;