import React, { useState } from 'react';
import { getParentPassword } from '../utils/storage';

export default function VerificationModal({ isOpen, onClose, onSendToParent, onInstantVerify, taskName }) {
    const [mode, setMode] = useState('selection'); // 'selection' | 'pin'
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handlePinSubmit = (e) => {
        e.preventDefault();
        const storedPassword = getParentPassword(); // "1234" usually

        // If no password set, treat any input as valid or maybe default "0000"
        if (!storedPassword || pin === storedPassword) {
            onInstantVerify();
        } else {
            setError('Incorrect PIN. Try again!');
            setPin('');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '30px',
                width: '90%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }} onClick={e => e.stopPropagation()}>

                {mode === 'selection' ? (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🛡️</div>
                        <h2 style={{ marginBottom: '10px', color: '#333' }}>Mission Verified?</h2>
                        <p style={{ color: '#666', marginBottom: '25px' }}>
                            Ask a parent to check "<strong>{taskName}</strong>"!
                        </p>

                        <div className="flex-col gap-sm">
                            <button
                                onClick={() => setMode('pin')}
                                className="btn btn-primary"
                                style={{
                                    padding: '15px',
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(135deg, #4ECDC4, #2CB5E8)'
                                }}
                            >
                                🧑‍🧑‍🧒 Parent is here! (Enter PIN)
                            </button>

                            <button
                                onClick={onSendToParent}
                                className="btn btn-secondary"
                                style={{ padding: '15px', fontSize: '1.1rem' }}
                            >
                                📲 Send to Parent Dashboard
                            </button>

                            <button
                                onClick={onClose}
                                className="btn btn-outline"
                                style={{ marginTop: '10px', border: 'none', color: '#999' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 style={{ marginBottom: '20px', color: '#333' }}>Enter Parent PIN</h2>
                        <form onSubmit={handlePinSubmit}>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter PIN"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    fontSize: '1.5rem',
                                    textAlign: 'center',
                                    border: '2px solid #ddd',
                                    borderRadius: '12px',
                                    marginBottom: '10px',
                                    outline: 'none'
                                }}
                                autoFocus
                                inputMode="numeric"
                            />
                            {error && <p style={{ color: '#ff4444', marginBottom: '15px' }}>{error}</p>}

                            <div className="flex gap-sm">
                                <button
                                    type="button"
                                    onClick={() => setMode('selection')}
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    Verify
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
