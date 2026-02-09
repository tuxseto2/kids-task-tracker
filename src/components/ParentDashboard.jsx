import { useState } from 'react';
import TaskManager from './TaskManager';
import RewardManager from './RewardManager';
import ChildProfileManager from './ChildProfileManager';
import ParentOverview from './ParentOverview';

function ParentDashboard({ onBack }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div className="container">
                {/* Header */}
                <div className="flex-between" style={{ marginBottom: '30px' }}>
                    <h1 style={{ color: 'white', margin: 0 }}>
                        👨‍👩‍👧‍👦 Parent Dashboard
                    </h1>
                    <button onClick={onBack} className="btn btn-outline" style={{ background: 'white' }}>
                        ← Back to Kids Mode
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-md" style={{ marginBottom: '30px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
                        style={activeTab !== 'overview' ? { background: 'white' } : {}}
                    >
                        📊 Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-outline'}`}
                        style={activeTab !== 'tasks' ? { background: 'white' } : {}}
                    >
                        📝 Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-outline'}`}
                        style={activeTab !== 'rewards' ? { background: 'white' } : {}}
                    >
                        🎁 Rewards
                    </button>
                    <button
                        onClick={() => setActiveTab('children')}
                        className={`btn ${activeTab === 'children' ? 'btn-primary' : 'btn-outline'}`}
                        style={activeTab !== 'children' ? { background: 'white' } : {}}
                    >
                        👶 Children
                    </button>
                </div>

                {/* Content */}
                <div className="card" style={{ background: 'white' }}>
                    {activeTab === 'overview' && <ParentOverview />}
                    {activeTab === 'tasks' && <TaskManager />}
                    {activeTab === 'rewards' && <RewardManager />}
                    {activeTab === 'children' && <ChildProfileManager />}
                </div>
            </div>
        </div>
    );
}

export default ParentDashboard;
