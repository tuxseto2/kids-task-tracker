import { useState, useEffect } from 'react';
import { getRewards, saveRewards } from '../utils/storage';

function RewardManager() {
    const [rewards, setRewards] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        cost: 30,
        emoji: '🎁',
        description: ''
    });

    const loadRewards = () => {
        setRewards(getRewards());
    };

    useEffect(() => {
        loadRewards();
        window.addEventListener('kidsTaskTracker_data_updated', loadRewards);
        return () => window.removeEventListener('kidsTaskTracker_data_updated', loadRewards);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Update existing reward
            const updatedRewards = rewards.map(reward =>
                reward.id === isEditing ? { ...reward, ...formData } : reward
            );
            setRewards(updatedRewards);
            saveRewards(updatedRewards);
        } else {
            // Add new reward
            const newReward = {
                id: Date.now().toString(),
                ...formData
            };
            const updatedRewards = [...rewards, newReward];
            setRewards(updatedRewards);
            saveRewards(updatedRewards);
        }

        resetForm();
    };

    const handleEdit = (reward) => {
        setIsEditing(reward.id);
        setFormData({
            name: reward.name,
            cost: reward.cost,
            emoji: reward.emoji,
            description: reward.description
        });
    };

    const handleDelete = (rewardId) => {
        if (confirm('Are you sure you want to delete this reward?')) {
            const updatedRewards = rewards.filter(reward => reward.id !== rewardId);
            setRewards(updatedRewards);
            saveRewards(updatedRewards);
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setFormData({
            name: '',
            cost: 30,
            emoji: '🎁',
            description: ''
        });
    };

    const emojiOptions = [
        '🎁', '🍰', '📱', '⚽', '🎉', '🎮', '🍕', '🎨', '🎬', '🏖️', '🎪', '🦄',
        '🍦', '🍩', '🎂', '🍪', '🌮', '🍔', '🍿', '🎈', '🏆', '🥇', '🎯', '🎸',
        '🚴', '🏊', '⛷️', '🎢', '🎠', '🎡', '🧸', '🎭', '📚', '🖍️', '🎹', '🥳'
    ];

    return (
        <div>
            <h2 style={{ marginBottom: '30px' }}>🎁 Manage Rewards</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ marginBottom: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '20px' }}>
                <h3>{isEditing ? 'Edit Reward' : 'Add New Reward'}</h3>

                <div className="grid grid-2">
                    <div>
                        <label>Reward Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Dessert"
                            required
                        />
                    </div>

                    <div>
                        <label>Point Cost</label>
                        <input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
                            min="1"
                            max="500"
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
                        placeholder="e.g., Yummy dessert after dinner!"
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
                                    border: formData.emoji === emoji ? '3px solid #4ECDC4' : '2px solid #ddd',
                                    borderRadius: '12px',
                                    background: formData.emoji === emoji ? '#E6F9F7' : 'white',
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

                <div className="flex gap-md">
                    <button type="submit" className="btn btn-secondary">
                        {isEditing ? '💾 Update Reward' : '➕ Add Reward'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="btn btn-outline">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Rewards List */}
            <div className="grid grid-2">
                {rewards.map(reward => (
                    <div key={reward.id} className="card" style={{ border: '2px solid #eee' }}>
                        <div className="flex-between" style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '3rem' }}>{reward.emoji}</div>
                            <div style={{
                                background: '#4ECDC4',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '50px',
                                fontWeight: 'bold'
                            }}>
                                {reward.cost} ⭐
                            </div>
                        </div>
                        <h3 style={{ marginBottom: '10px' }}>{reward.name}</h3>
                        <p style={{ color: '#666', marginBottom: '15px' }}>{reward.description}</p>
                        <div className="flex gap-sm">
                            <button
                                onClick={() => handleEdit(reward)}
                                className="btn btn-secondary"
                                style={{ flex: 1, minHeight: '50px' }}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => handleDelete(reward.id)}
                                className="btn btn-outline"
                                style={{ flex: 1, minHeight: '50px', borderColor: '#f44', color: '#f44' }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {rewards.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    No rewards yet. Add your first reward above! 👆
                </p>
            )}
        </div>
    );
}

export default RewardManager;
