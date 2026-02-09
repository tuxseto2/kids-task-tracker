import { useState, useEffect } from 'react';
import { getChildren, saveChildren, getCompletions, calculatePoints } from '../utils/storage';

function ChildProfileManager() {
    const [children, setChildren] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#FF6B9D',
        avatar: '🦄'
    });

    const loadChildren = () => {
        setChildren(getChildren());
    };

    useEffect(() => {
        loadChildren();
        window.addEventListener('kidsTaskTracker_data_updated', loadChildren);
        return () => window.removeEventListener('kidsTaskTracker_data_updated', loadChildren);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Update existing child
            const updatedChildren = children.map(child =>
                child.id === isEditing ? { ...child, ...formData } : child
            );
            setChildren(updatedChildren);
            saveChildren(updatedChildren);
        } else {
            // Add new child
            const newChild = {
                id: Date.now().toString(),
                ...formData
            };
            const updatedChildren = [...children, newChild];
            setChildren(updatedChildren);
            saveChildren(updatedChildren);
        }

        resetForm();
    };

    const handleEdit = (child) => {
        setIsEditing(child.id);
        setFormData({
            name: child.name,
            color: child.color,
            avatar: child.avatar
        });
    };

    const handleDelete = (childId) => {
        setDeleteConfirmId(childId);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            const updatedChildren = children.filter(child => child.id !== deleteConfirmId);
            setChildren(updatedChildren);
            saveChildren(updatedChildren);
            setDeleteConfirmId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const resetForm = () => {
        setIsEditing(null);
        setFormData({
            name: '',
            color: '#FF6B9D',
            avatar: '🦄'
        });
    };

    const avatarOptions = [
        '🦄', '🚀', '🌈', '⭐', '🎨', '🎮', '🦖', '🐱', '🐶', '🦊', '🐼', '🦁',
        '🐯', '🐻', '🐰', '🐸', '🐵', '🦉', '🦅', '🐧', '🦋', '🐝', '🐙', '🦀',
        '🍕', '🍦', '🍩', '🎂', '🍪', '🌮', '🍔', '🎈', '🎁', '⚽', '🏀', '🎸'
    ];
    const colorOptions = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#C77DFF', '#FF9F1C', '#4CC9F0', '#06FFA5', '#F72585'];

    const completions = getCompletions();

    return (
        <div>
            <h2 style={{ marginBottom: '30px' }}>👶 Manage Children</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ marginBottom: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '20px' }}>
                <h3>{isEditing ? 'Edit Child Profile' : 'Add New Child'}</h3>

                <div>
                    <label>Child Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Emma"
                        required
                    />
                </div>

                <div>
                    <label>Avatar</label>
                    <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                        {avatarOptions.map(avatar => (
                            <button
                                key={avatar}
                                type="button"
                                onClick={() => setFormData({ ...formData, avatar })}
                                style={{
                                    fontSize: '2rem',
                                    padding: '10px',
                                    border: formData.avatar === avatar ? '3px solid #FF6B9D' : '2px solid #ddd',
                                    borderRadius: '12px',
                                    background: formData.avatar === avatar ? '#FFE6F0' : 'white',
                                    cursor: 'pointer',
                                    minWidth: '60px',
                                    minHeight: '60px'
                                }}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label>Theme Color</label>
                    <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                        {colorOptions.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    padding: '0',
                                    border: formData.color === color ? '4px solid #333' : '2px solid #ddd',
                                    borderRadius: '12px',
                                    background: color,
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex gap-md">
                    <button type="submit" className="btn btn-primary">
                        {isEditing ? '💾 Update Child' : '➕ Add Child'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="btn btn-outline">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Children List */}
            <div className="grid grid-2">
                {children.map(child => {
                    const points = calculatePoints(child.id, completions);

                    return (
                        <div key={child.id} className="card" style={{ border: `3px solid ${child.color}` }}>
                            <div className="flex-between" style={{ marginBottom: '15px' }}>
                                <div style={{ fontSize: '3rem' }}>{child.avatar}</div>
                                <div style={{
                                    background: child.color,
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '50px',
                                    fontWeight: 'bold'
                                }}>
                                    {points} ⭐
                                </div>
                            </div>
                            <h3 style={{ marginBottom: '10px', color: child.color }}>{child.name}</h3>
                            <p style={{ color: '#666', marginBottom: '15px' }}>
                                Current points this week: <strong>{points}</strong>
                            </p>
                            <div className="flex gap-sm">
                                <button
                                    onClick={() => handleEdit(child)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, minHeight: '50px' }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(child.id)}
                                    className="btn btn-outline"
                                    style={{ flex: 1, minHeight: '50px', borderColor: '#f44', color: '#f44' }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {children.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    No children profiles yet. Add your first child above! 👆
                </p>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{
                        maxWidth: '500px',
                        margin: '20px',
                        padding: '30px',
                        background: 'white',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#f44' }}>⚠️ Delete Child Profile?</h3>
                        <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
                            Are you sure you want to delete <strong>{children.find(c => c.id === deleteConfirmId)?.name}</strong>?
                            This will also delete their task completion history.
                        </p>
                        <div className="flex gap-md">
                            <button
                                onClick={cancelDelete}
                                className="btn btn-outline"
                                style={{ flex: 1, minHeight: '50px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn"
                                style={{
                                    flex: 1,
                                    minHeight: '50px',
                                    background: '#f44',
                                    color: 'white'
                                }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChildProfileManager;
