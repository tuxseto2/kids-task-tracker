import { useState, useEffect } from 'react';
import { getTasks, saveTasks } from '../utils/storage';

function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        points: 10,
        emoji: '⭐',
        description: '',
        requiresApproval: false
    });

    useEffect(() => {
        const loadData = () => setTasks(getTasks());
        loadData();

        window.addEventListener('kidsTaskTracker_data_updated', loadData);
        return () => window.removeEventListener('kidsTaskTracker_data_updated', loadData);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Update existing task
            const updatedTasks = tasks.map(task =>
                task.id === isEditing ? { ...task, ...formData } : task
            );
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
        } else {
            // Add new task
            const newTask = {
                id: Date.now().toString(),
                ...formData
            };
            const updatedTasks = [...tasks, newTask];
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
        }

        resetForm();
    };

    const handleEdit = (task) => {
        setIsEditing(task.id);
        setFormData({
            name: task.name,
            points: task.points,
            emoji: task.emoji,
            description: task.description,
            requiresApproval: task.requiresApproval || false
        });
    };

    const handleDelete = (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setFormData({
            name: '',
            points: 10,
            emoji: '⭐',
            description: '',
            requiresApproval: false
        });
    };

    const emojiOptions = [
        '⭐', '🛏️', '🪥', '🧹', '🎻', '📚', '🎨', '⚽', '🍎', '💪', '🧠', '🎯',
        '🧺', '🧽', '🚿', '🍽️', '🌱', '🐕', '🐈', '🎵', '✍️', '🧮', '🔬', '🌍',
        '🏃', '🧘', '🥗', '💧', '🌞', '🌙', '⏰', '🎓', '🏅', '✨', '🌟', '💫'
    ];

    return (
        <div>
            <h2 style={{ marginBottom: '30px' }}>📝 Manage Tasks</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ marginBottom: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '20px' }}>
                <h3>{isEditing ? 'Edit Task' : 'Add New Task'}</h3>

                <div className="grid grid-2">
                    <div>
                        <label>Task Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Make the Bed"
                            required
                        />
                    </div>

                    <div>
                        <label>Points</label>
                        <input
                            type="number"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                            min="1"
                            max="100"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label>Description</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g., Make your bed nice and neat!"
                        required
                    />
                </div>

                <div>
                    <label>Emoji</label>
                    <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                        {emojiOptions.map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setFormData({ ...formData, emoji })}
                                style={{
                                    fontSize: '2rem',
                                    padding: '10px',
                                    border: formData.emoji === emoji ? '3px solid #FF6B9D' : '2px solid #ddd',
                                    borderRadius: '12px',
                                    background: formData.emoji === emoji ? '#FFE6F0' : 'white',
                                    cursor: 'pointer',
                                    minWidth: '60px',
                                    minHeight: '60px'
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ margin: '15px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.requiresApproval}
                            onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                            style={{ width: '20px', height: '20px', accentColor: '#FF6B9D' }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#555' }}>
                            🛡️ Requires Parent Approval
                        </span>
                    </label>
                    <p style={{ fontSize: '0.85rem', color: '#999', marginLeft: '30px', marginTop: '5px' }}>
                        If checked, points won't be awarded until you verify the task.
                    </p>
                </div>

                <div className="flex gap-md">
                    <button type="submit" className="btn btn-primary">
                        {isEditing ? '💾 Update Task' : '➕ Add Task'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="btn btn-outline">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Tasks List */}
            <div className="grid grid-2">
                {tasks.map(task => (
                    <div key={task.id} className="card" style={{ border: '2px solid #eee' }}>
                        <div className="flex-between" style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '3rem' }}>{task.emoji}</div>
                            <div style={{
                                background: '#FF6B9D',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '50px',
                                fontWeight: 'bold'
                            }}>
                                {task.points} ⭐
                            </div>
                        </div>
                        <h3 style={{ marginBottom: '10px' }}>
                            {task.name}
                            {task.requiresApproval && <span title="Requires Approval">🛡️</span>}
                        </h3>
                        <p style={{ color: '#666', marginBottom: '15px' }}>{task.description}</p>
                        <div className="flex gap-sm">
                            <button
                                onClick={() => handleEdit(task)}
                                className="btn btn-secondary"
                                style={{ flex: 1, minHeight: '50px' }}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="btn btn-outline"
                                style={{ flex: 1, minHeight: '50px', borderColor: '#f44', color: '#f44' }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {tasks.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    No tasks yet. Add your first task above! 👆
                </p>
            )}
        </div>
    );
}

export default TaskManager;
