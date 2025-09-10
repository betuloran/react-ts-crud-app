import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Post, User } from '../types';
import { postAPI, userAPI } from '../services/api';
import './PostList.css';
import { FaEdit, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { LiaTimesSolid } from 'react-icons/lia';

const PostList = () => {
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Post>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userIdParam ? parseInt(userIdParam) : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    setSelectedUserId(userIdParam ? parseInt(userIdParam) : null);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsData, usersData] = await Promise.all([
        selectedUserId ? postAPI.getByUserId(selectedUserId) : postAPI.getAll(),
        userAPI.getAll()
      ]);
      setPosts(postsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postAPI.delete(id);
        setPosts(posts.filter(post => post.id !== id));
        alert('Post deleted successfully!');
      } catch (err) {
        alert('Failed to delete post');
        console.error(err);
      }
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post.id);
    setFormData({
      title: post.title,
      body: post.body,
      userId: post.userId,
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      await postAPI.update(id, formData);
      setPosts(posts.map(post => post.id === id ? { ...post, ...formData } : post));
      setEditingPost(null);
      setFormData({});
      alert('Post updated successfully!');
    } catch (err) {
      alert('Failed to update post');
      console.error(err);
    }
  };

  const handleAdd = async () => {
    try {
      if (!formData.title || !formData.userId) {
        alert('Please fill all required fields');
        return;
      }
      const newPost = await postAPI.create(formData);
      const uniquePost = { ...newPost, id: Math.max(...posts.map(p => p.id)) + 1 };
      const updatedPosts = [...posts, uniquePost];  // Önce sona ekler.
      setPosts(updatedPosts.sort((a, b) => a.id - b.id));  // Sonra ID'ye göre sıralar.      setShowAddForm(false);
      setFormData({});
      alert('Post added successfully!');
    } catch (err) {
      alert('Failed to add post');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setShowAddForm(false);
    setFormData({});
  };

  const handleUserFilter = (userId: number | null) => {
    setSelectedUserId(userId);
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="post-list-container">
      <div className="header">
        <h2>Posts Management</h2>
        <div className="header-actions">
          <button onClick={() => setShowAddForm(true)} className="btn-add">
            <FaPlus /> Add New Post
          </button>
          <Link to="/" className="btn-back">
            <IoArrowBack /> Back to Home</Link>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-section">
          <label>Filter by User: </label>
          <select
            value={selectedUserId || ''}
            onChange={(e) => handleUserFilter(e.target.value ? parseInt(e.target.value) : null)}
            className="user-filter"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search posts by title..."
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
              Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
              {filteredPosts.length === 0 && ' - Try different keywords'}
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Add New Post</h3>
          <select
            value={formData.userId || ''}
            onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Post Title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            placeholder="Post Body (Optional)"
            value={formData.body || ''}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={3}
          />
          <div className="form-actions">
            <button onClick={handleAdd} className="btn-save">Save</button>
            <button onClick={handleCancel} className="btn-cancel">Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="post-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-results">
                  {searchTerm || selectedUserId
                    ? 'No posts found matching your filters'
                    : 'No posts available'}
                </td>
              </tr>
            ) : (
              filteredPosts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>
                    {editingPost === post.id ? (
                      <select
                        value={formData.userId || ''}
                        onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                      >
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Link to={`/posts?userId=${post.userId}`} className="user-link">
                        {getUserName(post.userId)}
                      </Link>
                    )}
                  </td>
                  <td className="title-cell">
                    {editingPost === post.id ? (
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      post.title
                    )}
                  </td>
                  <td className="actions">
                    {editingPost === post.id ? (
                      <>
                        <button onClick={() => handleUpdate(post.id)} className="btn-save">
                          💾 Save
                        </button>
                        <button onClick={handleCancel} className="btn-cancel">
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(post)} className="btn-edit">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="btn-delete">
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
      </div>
    </div>
  );
};

export default PostList;