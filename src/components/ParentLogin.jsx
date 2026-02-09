import { useState } from 'react';
import { getParentPassword, saveParentPassword } from '../utils/storage';

function ParentLogin({ onLogin, onBack }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSettingPassword, setIsSettingPassword] = useState(!getParentPassword());
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isSettingPassword) {
            // Setting up password for the first time
            if (password.length < 4) {
                setError('Password must be at least 4 characters');
                return;
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            saveParentPassword(password);
            onLogin(true);
        } else {
            // Logging in with existing password
            const savedPassword = getParentPassword();

            if (password === savedPassword) {
                onLogin(true);
            } else {
                setError('Incorrect password');
                setPassword('');
            }
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
                <button
                    onClick={onBack}
                    className="btn btn-outline"
                    style={{ marginBottom: '20px' }}
                >
                    ← Back to Kids Mode
                </button>

                <h2 className="text-center" style={{ marginBottom: '30px' }}>
                    {isSettingPassword ? '🔐 Set Parent Password' : '🔐 Parent Login'}
                </h2>

                {error && (
                    <div style={{
                        background: '#fee',
                        color: '#c33',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col gap-md">
                    <div>
                        <label htmlFor="password">
                            {isSettingPassword ? 'Create Password' : 'Password'}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder={isSettingPassword ? 'Enter a password' : 'Enter your password'}
                            autoFocus
                        />
                    </div>

                    {isSettingPassword && (
                        <div>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Confirm your password"
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large">
                        {isSettingPassword ? '✨ Set Password' : '🔓 Login'}
                    </button>
                </form>

                {isSettingPassword && (
                    <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                        💡 Remember this password! You'll need it to access parent settings.
                    </p>
                )}
            </div>
        </div>
    );
}

export default ParentLogin;
