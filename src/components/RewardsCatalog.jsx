import { useState } from 'react';
import { getRewards, redeemReward, getRedemptions } from '../utils/storage';

function RewardsCatalog({ child, points, onBack, onRedemption }) {
    const [rewards] = useState(getRewards());
    const [showConfetti, setShowConfetti] = useState(false);
    const [redeemedReward, setRedeemedReward] = useState(null);

    const handleRedeem = (reward) => {
        if (points < reward.cost) {
            alert(`Not enough stars! You need ${reward.cost - points} more stars.`);
            return;
        }

        const result = redeemReward(child.id, reward.id);

        if (result) {
            setRedeemedReward(reward);
            setShowConfetti(true);

            setTimeout(() => {
                setShowConfetti(false);
                setRedeemedReward(null);
                onRedemption();
            }, 3000);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${child.color}33, ${child.color}66)`,
            padding: '20px',
            position: 'relative'
        }}>
            {showConfetti && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                left: `${Math.random() * 100}%`,
                                fontSize: '2rem',
                                animation: 'confetti 3s ease-out forwards',
                                animationDelay: `${Math.random() * 0.5}s`
                            }}
                        >
                            {['🎉', '⭐', '🌟', '✨', '🎊'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            {redeemedReward && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    padding: '20px'
                }}>
                    <div className="card" style={{
                        textAlign: 'center',
                        maxWidth: '400px',
                        animation: 'pulse 1s ease-in-out infinite'
                    }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                            {redeemedReward.emoji}
                        </div>
                        <h2 style={{ color: child.color, marginBottom: '20px' }}>
                            🎉 Congratulations! 🎉
                        </h2>
                        <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                            You redeemed:
                        </p>
                        <h3 style={{ fontSize: '2rem', color: child.color }}>
                            {redeemedReward.name}
                        </h3>
                    </div>
                </div>
            )}

            <div className="container-sm">
                {/* Header */}
                <div className="flex-between" style={{ marginBottom: '30px' }}>
                    <button onClick={onBack} className="btn btn-outline">
                        ← Back to Tasks
                    </button>
                    <div style={{
                        background: 'white',
                        padding: '15px 30px',
                        borderRadius: '50px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: child.color
                    }}>
                        ⭐ {points} Stars
                    </div>
                </div>

                <h1 className="text-center" style={{
                    color: child.color,
                    marginBottom: '40px',
                    fontSize: '2.5rem'
                }}>
                    🎁 Rewards Catalog 🎁
                </h1>

                {/* Rewards Grid */}
                <div className="grid grid-2">
                    {rewards.map((reward) => {
                        const canAfford = points >= reward.cost;

                        return (
                            <div
                                key={reward.id}
                                className={`card ${canAfford ? 'card-interactive' : ''}`}
                                onClick={() => canAfford && handleRedeem(reward)}
                                style={{
                                    background: canAfford ? 'white' : '#f5f5f5',
                                    border: `4px solid ${canAfford ? child.color : '#ddd'}`,
                                    textAlign: 'center',
                                    opacity: canAfford ? 1 : 0.6,
                                    cursor: canAfford ? 'pointer' : 'not-allowed',
                                    position: 'relative'
                                }}
                            >
                                {!canAfford && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        fontSize: '2rem'
                                    }}>
                                        🔒
                                    </div>
                                )}

                                <div style={{ fontSize: '60px', marginBottom: '15px' }}>
                                    {reward.emoji}
                                </div>
                                <h3 style={{
                                    marginBottom: '10px',
                                    color: canAfford ? child.color : '#999'
                                }}>
                                    {reward.name}
                                </h3>
                                <p style={{
                                    color: canAfford ? '#666' : '#999',
                                    marginBottom: '15px',
                                    fontSize: '1rem'
                                }}>
                                    {reward.description}
                                </p>
                                <div style={{
                                    background: canAfford ? child.color : '#ccc',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '50px',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    display: 'inline-block'
                                }}>
                                    {reward.cost} ⭐
                                </div>

                                {canAfford && (
                                    <div style={{
                                        marginTop: '15px',
                                        fontSize: '1rem',
                                        color: child.color,
                                        fontWeight: 'bold'
                                    }}>
                                        Tap to Redeem! ✨
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default RewardsCatalog;
