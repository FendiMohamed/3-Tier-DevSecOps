import React, { useEffect, useState, useContext } from 'react';
import axios from '../axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function TodoDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ id: null, title: '', description: '', due_date: '' });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchTodos();
    }
  }, [user, navigate]);

  const fetchTodos = () => {
    setLoading(true);
  axios.get('/todos')
      .then(res => setTodos(res.data))
      .catch(err => {
        if (err.response?.status === 401) logout();
      })
      .finally(() => setLoading(false));
  };

  const resetForm = () => setForm({ id: null, title: '', description: '', due_date: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      due_date: form.due_date || undefined
    };
    if (form.id) {
  axios.put(`/todos/${form.id}`, payload).then(fetchTodos).then(resetForm);
    } else {
  axios.post('/todos', payload).then(fetchTodos).then(resetForm);
    }
  };

  const toggleStatus = (todo) => {
  axios.put(`/todos/${todo.id}`, { status: todo.status === 'done' ? 'pending' : 'done' })
      .then(fetchTodos);
  };

  const editTodo = (todo) => {
    setForm({ id: todo.id, title: todo.title, description: todo.description || '', due_date: todo.due_date ? todo.due_date.substring(0, 10) : '' });
  };

  const deleteTodo = (id) => {
  axios.delete(`/todos/${id}`).then(fetchTodos);
  };

  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'done' ? t.status === 'done' : t.status === 'pending');

  return (
    <div className="container fade-in">
      <div className="header">
        <h2>My Tasks</h2>
        <div>
          <b>{user?.name}</b> &nbsp;
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <div className="flex-row">
          <input className="form-field" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <input className="form-field" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
        </div>
        <textarea className="form-field" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
        <div className="button-group">
          <button type="submit">{form.id ? 'Update Task' : 'Add Task'}</button>
          {form.id && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="toolbar">
        <div className="filters">
          {['all','pending','done'].map(f => <button key={f} type="button" className={filter===f? 'active-filter': ''} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        <small>{filtered.length} / {todos.length} shown</small>
      </div>

      {loading ? <p>Loading...</p> : (
        <ul className="todo-list">
          {filtered.map(todo => (
            <li key={todo.id} className={todo.status === 'done' ? 'done' : ''}>
              <div className="todo-main" onClick={() => toggleStatus(todo)}>
                <input type="checkbox" readOnly checked={todo.status === 'done'} />
                <div className="todo-text">
                  <span className="todo-title">{todo.title}</span>
                  {todo.description && <span className="todo-desc">{todo.description}</span>}
                  {todo.due_date && <span className="todo-due">Due {new Date(todo.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="todo-actions">
                <button type="button" onClick={() => editTodo(todo)}>Edit</button>
                <button type="button" onClick={() => deleteTodo(todo.id)}>Delete</button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li className="empty">No tasks.</li>}
        </ul>
      )}
    </div>
  );
}

export default TodoDashboard;

