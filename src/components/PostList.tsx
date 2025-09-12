import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Post, User } from '../types';
import { postAPI, userAPI } from '../services/api';
import './PostList.css';
import { FaEdit, FaPlus, FaTrash, FaSearch, FaSave, FaTimes } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { LiaTimesSolid } from 'react-icons/lia';
import Modal from './Modal';
import Toast from './Toast';

const PostList = () => {
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Post>>({});
  const [addFormData, setAddFormData] = useState<Partial<Post>>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userIdParam ? parseInt(userIdParam) : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; postId: number | null }>({
    isOpen: false,
    postId: null
  });

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

  const handleDelete = (id: number) => {
    setDeleteModal({ isOpen: true, postId: id });
  };

  const confirmDelete = async () => {
    if (deleteModal.postId) {
      try {
        const post = posts.find(p => p.id === deleteModal.postId);
        if (!post?.isLocal) {
          await postAPI.delete(deleteModal.postId);
        }
        setPosts(posts.filter(post => post.id !== deleteModal.postId));
        setToast({ show: true, message: 'Post deleted successfully!', type: 'success' });
      } catch (err) {
        setToast({ show: true, message: 'Failed to delete post', type: 'error' });
        console.error(err);
      }
    }
    setDeleteModal({ isOpen: false, postId: null });
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post.id);
    setEditFormData({
      title: post.title,
      body: post.body,
      userId: post.userId,
    });
    setShowAddForm(false);
  };

  const handleUpdate = async (id: number) => {
    try {
      const post = posts.find(p => p.id === id);
      if (post?.isLocal) {
        setPosts(posts.map(p => p.id === id ? { ...p, ...editFormData } : p));
      } else {
        await postAPI.update(id, editFormData);
        setPosts(posts.map(p => p.id === id ? { ...p, ...editFormData } : p));
      }
      setEditingPost(null);
      setEditFormData({});
      setToast({ show: true, message: 'Post updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to update post', type: 'error' });
      console.error(err);
    }
  };

  const handleAdd = async () => {
    try {
      if (!addFormData.title || !addFormData.userId) {
        setToast({ show: true, message: 'Please fill all required fields', type: 'error' });
        return;
      }
      const newPost = await postAPI.create(addFormData);
      const uniquePost = {
        ...newPost,
        id: Math.max(...posts.map(p => p.id)) + 1,
        isLocal: true
      };
      const updatedPosts = [...posts, uniquePost];
      setPosts(updatedPosts.sort((a, b) => a.id - b.id));
      setShowAddForm(false);
      setAddFormData({});
      setToast({ show: true, message: 'Post added successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to add post', type: 'error' });
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setShowAddForm(false);
    setAddFormData({});
    setEditFormData({});
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
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingPost(null); 
            }}
            className="btn-add"
          >
            <FaPlus style={{ marginRight: '0.5rem' }} /> Add New Post
          </button>
          <Link to="/" className="btn-back">
            <IoArrowBack style={{ marginRight: '0.4rem' }} /> Back to Home
          </Link>
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
            value={addFormData.userId || ''}
            onChange={(e) => setAddFormData({ ...addFormData, userId: parseInt(e.target.value) })}
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
            value={addFormData.title || ''}
            onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
          />
          <textarea
            placeholder="Post Body"
            value={addFormData.body || ''}
            onChange={(e) => setAddFormData({ ...addFormData, body: e.target.value })}
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
                        value={editFormData.userId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, userId: parseInt(e.target.value) })}
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
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
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
                          <FaSave /> Save
                        </button>
                        <button onClick={handleCancel} className="btn-cancel">
                          <FaTimes /> Cancel
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

        <Modal
          isOpen={deleteModal.isOpen}
          title="Delete Post"
          message={`Are you sure you want to delete this post? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, postId: null })}
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

export default PostList;