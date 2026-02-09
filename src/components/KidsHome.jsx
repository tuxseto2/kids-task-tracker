import { useState, useEffect } from 'react';
import { getChildren } from '../utils/storage';
import KidsTaskView from './KidsTaskView';

function KidsHome() {
    const [selectedChild, setSelectedChild] = useState(null);
    const [children, setChildren] = useState(getChildren());

    useEffect(() => {
        const loadData = () => setChildren(getChildren());
        window.addEventListener('kidsTaskTracker_data_updated', loadData);
        return () => window.removeEventListener('kidsTaskTracker_data_updated', loadData);
    }, []);

    if (selectedChild) {
        return (
            <KidsTaskView
                child={selectedChild}
                onBack={() => setSelectedChild(null)}
            />
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)',
            padding: '40px 20px'
        }}>
            <div className="container-sm">
                <h1 className="text-center animate-bounce" style={{
                    color: 'white',
                    textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    marginBottom: '50px',
                    fontSize: '3rem'
                }}>
                    🌟 Who's Ready to Earn Stars? 🌟
                </h1>

                <div className="grid grid-2" style={{ gap: '30px' }}>
                    {children.map((child) => (
                        <div
                            key={child.id}
                            onClick={() => setSelectedChild(child)}
                            className="card card-interactive"
                            style={{
                                background: `linear-gradient(135deg, ${child.color}22, ${child.color}44)`,
                                border: `4px solid ${child.color}`,
                                padding: '40px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            }}
                        >
                            <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                                {child.avatar}
                            </div>
                            <h2 style={{
                                color: child.color,
                                marginBottom: '10px',
                                fontSize: '2rem'
                            }}>
                                {child.name}
                            </h2>
                            <div style={{
                                background: child.color,
                                color: 'white',
                                padding: '15px 30px',
                                borderRadius: '50px',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                marginTop: '20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}>
                                Tap to Start! ✨
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default KidsHome;
