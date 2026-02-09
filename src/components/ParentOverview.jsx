import { useState, useEffect } from 'react';
import { getChildren, getWeeklyStats, calculatePoints, getCompletions, getTasks, removeCompletion, updateWeeklyStats, getLastResetDate, getWeeklyHistory, getPendingApprovals, approveTask, rejectTask } from '../utils/storage';
import { getWeekRangeDisplay, getTodayDateString } from '../utils/timeUtils';
import WeeklyChart from './WeeklyChart';

function ParentOverview() {
    const [children, setChildren] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState({ weekStartDate: null, children: {} });
    const [weeklyHistory, setWeeklyHistory] = useState([]);
    const [completions, setCompletions] = useState({});
    const [tasks, setTasks] = useState([]);
    const [weekRange, setWeekRange] = useState('');
    const [pendingApprovals, setPendingApprovals] = useState({});

    useEffect(() => {
        loadData();
        setWeekRange(getWeekRangeDisplay());

        window.addEventListener('kidsTaskTracker_data_updated', loadData);
        return () => window.removeEventListener('kidsTaskTracker_data_updated', loadData);
    }, []);

    const loadData = () => {
        const loadedChildren = getChildren();
        const loadedStats = getWeeklyStats();
        const loadedHistory = getWeeklyHistory();
        const loadedCompletions = getCompletions();
        const loadedTasks = getTasks();
        const loadedPending = getPendingApprovals();

        setCompletions(loadedCompletions);
        setTasks(loadedTasks);

        // Calculate current total points for each child
        const childrenWithPoints = loadedChildren.map(child => ({
            ...child,
            totalPoints: calculatePoints(child.id, loadedCompletions)
        }));

        setChildren(childrenWithPoints);
        setWeeklyStats(loadedStats);
        setWeeklyHistory(loadedHistory);
        setPendingApprovals(loadedPending);
    };

    const handleApproveTask = (childId, taskId) => {
        approveTask(childId, taskId);
        loadData();
    };

    const handleRejectTask = (childId, taskId) => {
        rejectTask(childId, taskId);
        loadData();
    };

    // State to track which task is being confirmed for removal: { childId-taskId: boolean }
    const [confirmingRemoval, setConfirmingRemoval] = useState({});

    const handleRemoveClick = (childId, taskId) => {
        setConfirmingRemoval(prev => ({ ...prev, [`${childId}-${taskId}`]: true }));
        // Auto-cancel after 3 seconds if not confirmed
        setTimeout(() => {
            setConfirmingRemoval(prev => {
                const newState = { ...prev };
                delete newState[`${childId}-${taskId}`];
                return newState;
            });
        }, 3000);
    };

    const handleConfirmRemove = (childId, taskId) => {
        const task = tasks.find(t => t.id === taskId);

        // Remove completion
        removeCompletion(childId, taskId);

        // Update weekly stats (Undo)
        if (task) {
            updateWeeklyStats(childId, taskId, task.points, true);
        }

        // Clear confirmation state
        setConfirmingRemoval(prev => {
            const newState = { ...prev };
            delete newState[`${childId}-${taskId}`];
            return newState;
        });

        // Reload data to reflect changes
        loadData();
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '30px' }}>
                <div>
                    <h2 style={{ marginBottom: '5px' }}>📊 Weekly Overview</h2>
                    <p style={{ color: '#666' }}>{weekRange}</p>
                </div>
            </div>

            <div className="grid grid-2">
                {children.map(child => {
                    const childStats = weeklyStats.children && weeklyStats.children[child.id]
                        ? weeklyStats.children[child.id]
                        : { tasksCompleted: 0, pointsEarned: 0 };

                    return (
                        <div key={child.id} className="card" style={{ borderTop: `6px solid ${child.color}` }}>
                            <div className="flex-between" style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '40px' }}>{child.avatar}</div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{child.name}</h3>
                                        <div style={{ color: child.color, fontWeight: 'bold' }}>
                                            {child.totalPoints} Stars Total
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Approvals Section */}
                            {pendingApprovals[child.id] && pendingApprovals[child.id].length > 0 && (
                                <div style={{
                                    marginBottom: '20px',
                                    background: '#FFF9C4',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    border: '2px solid #FBC02D'
                                }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#F57F17', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>⏳ NEEDS APPROVAL</span>
                                    </h4>
                                    <div className="flex-col gap-sm">
                                        {pendingApprovals[child.id].map(taskId => {
                                            const task = tasks.find(t => t.id === taskId);
                                            if (!task) return null;

                                            return (
                                                <div key={taskId} className="flex-between" style={{
                                                    background: 'white',
                                                    padding: '10px 15px',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '1.2rem' }}>{task.emoji}</span>
                                                        <span style={{ fontWeight: '500' }}>{task.name}</span>
                                                        <span style={{
                                                            fontSize: '0.8rem',
                                                            background: '#eee',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px'
                                                        }}>
                                                            +{task.points} ⭐
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-sm">
                                                        <button
                                                            onClick={() => handleApproveTask(child.id, taskId)}
                                                            className="btn"
                                                            style={{
                                                                background: '#4CAF50',
                                                                color: 'white',
                                                                padding: '5px 10px',
                                                                fontSize: '0.9rem',
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Approve ✅
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectTask(child.id, taskId)}
                                                            className="btn"
                                                            style={{
                                                                background: '#ff4444',
                                                                color: 'white',
                                                                padding: '5px 10px',
                                                                fontSize: '0.9rem',
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Reject ❌
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div style={{
                                background: '#f9f9f9',
                                padding: '15px',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                                    THIS WEEK
                                </h4>
                                <div className="flex-between">
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
                                            {childStats.tasksCompleted}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>Tasks</div>
                                    </div>
                                    <div style={{ width: '1px', height: '40px', background: '#e0e0e0' }}></div>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
                                            {childStats.pointsEarned}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>Points</div>
                                    </div>
                                </div>
                            </div>

                            {/* Today's Activity (Admin) */}
                            {completions[child.id] && Object.keys(completions[child.id]).length > 0 &&
                                !Object.keys(completions[child.id]).every(k => k === 'redemption') && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h5 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                            Today's Completed Tasks
                                        </h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {Object.keys(completions[child.id]).map(taskId => {
                                                // Skip redemption entries
                                                if (taskId === 'redemption') return null;

                                                // Skip tasks that might have been deleted but still have completion records
                                                const task = tasks.find(t => t.id === taskId);
                                                if (!task) return null;

                                                // Skip if count is 0 (shouldn't happen with clean data but good safety)
                                                if (completions[child.id][taskId] <= 0) return null;

                                                const isConfirming = confirmingRemoval[`${child.id}-${taskId}`];

                                                return (
                                                    <div key={taskId} className="flex-between" style={{
                                                        background: 'white',
                                                        border: '1px solid #eee',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span>{task.emoji}</span>
                                                            <span style={{ fontSize: '0.9rem' }}>{task.name}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{ fontSize: '0.8rem', color: child.color, fontWeight: 'bold' }}>+{task.points}</span>

                                                            {isConfirming ? (
                                                                <button
                                                                    onClick={() => handleConfirmRemove(child.id, taskId)}
                                                                    style={{
                                                                        background: '#ff4444',
                                                                        border: 'none',
                                                                        color: 'white',
                                                                        borderRadius: '4px',
                                                                        padding: '2px 6px',
                                                                        fontSize: '0.7rem',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Confirm?
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRemoveClick(child.id, taskId)}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: '1px solid #ffcccc',
                                                                        color: '#ff4444',
                                                                        borderRadius: '4px',
                                                                        padding: '2px 6px',
                                                                        fontSize: '0.7rem',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            {/* Weekly Progress Visual */}
                            <div>
                                <div className="flex-between" style={{ fontSize: '0.8rem', color: '#999', marginBottom: '5px' }}>
                                    <span>Weekly Activity</span>
                                    <span>{childStats.tasksCompleted > 0 ? 'Keep it up!' : 'No tasks yet'}</span>
                                </div>
                                <div style={{
                                    height: '10px',
                                    background: '#eee',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(childStats.tasksCompleted * 5, 100)}%`, // Roughly 20 tasks = 100%
                                        background: child.color,
                                        borderRadius: '10px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                            </div>

                            {/* Weekly History Chart */}
                            <WeeklyChart
                                data={(() => {
                                    // Prepare 6-week history data
                                    const historyData = [];

                                    // 1. Add past weeks from history (reverse order to get oldest first? storage is newest first)
                                    // Storage: index 0 is previous week, index 1 is week before that...
                                    // Chart needs chronological: [Week -5, Week -4, ..., Current]

                                    // Take up to 5 past weeks
                                    const pastWeeks = weeklyHistory.slice(0, 5).reverse();

                                    pastWeeks.forEach(week => {
                                        // Label: "Jan 12"
                                        const date = new Date(week.weekStartDate);
                                        const label = `${date.getMonth() + 1}/${date.getDate()}`;

                                        const points = week.children && week.children[child.id]
                                            ? week.children[child.id].pointsEarned
                                            : 0;

                                        historyData.push({
                                            label,
                                            points,
                                            isCurrent: false
                                        });
                                    });

                                    // Fill missing weeks if less than 5 past weeks?
                                    // User said "rolling week for 6 weeks".
                                    // If we don't have enough history, showing just available is fine?
                                    // Or should we pad with empty "Past"? 
                                    // Let's pad to ensure 6 bars for consistent look if possible, or just show what we have.
                                    // Showing what we have is cleaner data-wise.
                                    // BUT, to look like a "rolling window", user might expect 6 slots.
                                    // Let's pad with empty stats if history < 5.

                                    const weeksNeeded = 5 - pastWeeks.length;
                                    for (let i = 0; i < weeksNeeded; i++) {
                                        historyData.unshift({
                                            label: '...',
                                            points: 0,
                                            isCurrent: false
                                        });
                                    }

                                    // 2. Add current week
                                    const currentWeekStart = weeklyStats.weekStartDate ? new Date(weeklyStats.weekStartDate) : new Date();
                                    // If no start date set yet (fresh app), use today

                                    historyData.push({
                                        label: 'This Week',
                                        points: childStats.pointsEarned,
                                        isCurrent: true
                                    });

                                    return historyData;
                                })()}
                                color={child.color}
                            />

                        </div>
                    );
                })}
            </div>

            {children.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👶</div>
                    <p>No children profiles yet. Go to the "Children" tab to add them!</p>
                </div>
            )}
        </div>
    );
}

export default ParentOverview;
