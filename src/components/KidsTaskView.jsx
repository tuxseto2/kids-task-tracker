import { useState, useEffect } from 'react';
import { getTasks, getCompletions, completeTask, removeCompletion, calculatePoints, getRewards, updateWeeklyStats, resetDailyTasks, resetWeeklyStats, getLastResetDate, saveLastResetDate, getWeeklyStats, submitTaskForApproval, isTaskPending } from '../utils/storage';
import { shouldResetDaily, shouldResetWeekly, getWeekStartDate, getWeekRangeDisplay } from '../utils/timeUtils';
import RewardsCatalog from './RewardsCatalog';
import VerificationModal from './VerificationModal';

function KidsTaskView({ child, onBack }) {
    const [tasks, setTasks] = useState([]);
    const [completions, setCompletions] = useState({});
    const [points, setPoints] = useState(0);
    const [showRewards, setShowRewards] = useState(false);
    const [celebrateTaskId, setCelebrateTaskId] = useState(null);
    const [weeklyStats, setWeeklyStats] = useState({ tasks: 0, points: 0 });
    const [weekRange, setWeekRange] = useState('');
    const [verificationTask, setVerificationTask] = useState(null); // Task pending verification via modal

    useEffect(() => {
        checkResets();
        loadData();
        setWeekRange(getWeekRangeDisplay());

        const handleUpdate = () => {
            checkResets(); // Also check resets on update just in case
            loadData();
        };

        window.addEventListener('kidsTaskTracker_data_updated', handleUpdate);
        return () => window.removeEventListener('kidsTaskTracker_data_updated', handleUpdate);
    }, [child.id]);

    const checkResets = () => {
        const lastReset = getLastResetDate();
        let dataChanged = false;

        // Check daily reset (midnight PT)
        if (shouldResetDaily(lastReset)) {
            resetDailyTasks();
            saveLastResetDate(new Date().toISOString());
            dataChanged = true;
        }

        // Check weekly reset (Sunday midnight PT)
        const currentWeeklyStats = getWeeklyStats();
        if (shouldResetWeekly(currentWeeklyStats.weekStartDate)) {
            resetWeeklyStats(getWeekStartDate());
            dataChanged = true;
        }

        if (dataChanged) {
            // Force reload if we reset anything
            loadData();
        }
    };

    const loadData = () => {
        const allTasks = getTasks();
        const allCompletions = getCompletions();
        const allWeeklyStats = getWeeklyStats();

        setTasks(allTasks);
        setCompletions(allCompletions);
        setPoints(calculatePoints(child.id, allCompletions));

        // Load weekly stats for this child
        if (allWeeklyStats.children && allWeeklyStats.children[child.id]) {
            setWeeklyStats({
                tasks: allWeeklyStats.children[child.id].tasksCompleted,
                points: allWeeklyStats.children[child.id].pointsEarned
            });
        } else {
            setWeeklyStats({ tasks: 0, points: 0 });
        }
    };

    const handleCompleteTask = (taskId) => {
        const isCompleted = completions[child.id] && completions[child.id][taskId] > 0;
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        // Check if task is already pending approval
        if (isTaskPending(child.id, taskId)) {
            // Re-open modal to allow Parent PIN verification
            setVerificationTask(task);
            return;
        }

        if (isCompleted) {
            // Undo completion
            const newCompletions = removeCompletion(child.id, taskId);
            setCompletions(newCompletions);
            setPoints(calculatePoints(child.id, newCompletions));

            // Update weekly stats (Undo)
            const updatedStats = updateWeeklyStats(child.id, taskId, task.points, true);
            if (updatedStats.children[child.id]) {
                setWeeklyStats({
                    tasks: updatedStats.children[child.id].tasksCompleted,
                    points: updatedStats.children[child.id].pointsEarned
                });
            }
        } else {
            // Check if approval is required
            if (task.requiresApproval) {
                setVerificationTask(task);
                return;
            }

            // Complete task
            const newCompletions = completeTask(child.id, taskId);
            setCompletions(newCompletions);
            setPoints(calculatePoints(child.id, newCompletions));

            // Update weekly stats
            const updatedStats = updateWeeklyStats(child.id, taskId, task.points, false);
            if (updatedStats.children[child.id]) {
                setWeeklyStats({
                    tasks: updatedStats.children[child.id].tasksCompleted,
                    points: updatedStats.children[child.id].pointsEarned
                });
            }

            // Trigger celebration animation
            setCelebrateTaskId(taskId);
            setTimeout(() => setCelebrateTaskId(null), 1000);
        }
    };

    if (showRewards) {
        return (
            <RewardsCatalog
                child={child}
                points={points}
                onBack={() => {
                    setShowRewards(false);
                    loadData(); // Reload data after returning from rewards
                }}
                onRedemption={loadData}
            />
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${child.color}33, ${child.color}66)`,
            padding: '20px'
        }}>
            <div className="container-sm">
                {/* Header */}
                <div className="flex-between" style={{ marginBottom: '30px' }}>
                    <button onClick={onBack} className="btn btn-outline">
                        ← Back
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

                {/* Weekly Stats Card */}
                <div className="card" style={{
                    background: 'white',
                    marginBottom: '30px',
                    padding: '20px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ marginBottom: '15px', color: '#666', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                        <span>📅 This Week's Progress</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>{weekRange}</span>
                    </h3>
                    <div className="flex-between">
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: child.color }}>{weeklyStats.tasks}</div>
                            <div style={{ fontSize: '0.9rem', color: '#999' }}>Tasks Done</div>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: '#eee' }}></div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: child.color }}>{weeklyStats.points}</div>
                            <div style={{ fontSize: '0.9rem', color: '#999' }}>Stars Earned</div>
                        </div>
                    </div>
                </div>

                {/* Child Info */}
                <div className="text-center" style={{ marginBottom: '40px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                        {child.avatar}
                    </div>
                    <h1 style={{ color: child.color, marginBottom: '10px' }}>
                        {child.name}'s Tasks
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>
                        Complete tasks to earn stars! ✨
                    </p>
                </div>

                {/* Tasks Grid */}
                <div className="grid grid-2" style={{ marginBottom: '30px' }}>
                    {tasks.map((task) => {
                        const isCelebrating = celebrateTaskId === task.id;
                        const isCompleted = completions[child.id] && completions[child.id][task.id] > 0;
                        const isPending = isTaskPending(child.id, task.id);

                        return (
                            <div
                                key={task.id}
                                className={`card ${isCelebrating ? 'animate-wiggle' : ''}`}
                                onClick={() => handleCompleteTask(task.id)}
                                style={{
                                    background: isCompleted ? '#f9f9f9' : (isPending ? '#FFF9C4' : 'white'), // Yellow background if pending
                                    border: `4px solid ${isCompleted ? '#ddd' : (isPending ? '#FBC02D' : child.color)}`,
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    opacity: isCompleted ? 0.8 : 1,
                                    cursor: 'pointer',
                                    transform: isCompleted ? 'scale(0.98)' : 'scale(1)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isPending && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: '#FBC02D',
                                        borderRadius: '50px',
                                        padding: '5px 10px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        color: '#333',
                                        zIndex: 5,
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        ⏳ Waiting
                                    </div>
                                )}
                                {isCelebrating && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: `${child.color}33`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '4rem',
                                        zIndex: 10,
                                        animation: 'pulse 0.5s ease-in-out'
                                    }}>
                                        ⭐
                                    </div>
                                )}

                                {isCompleted && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: '#06FFA5',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 5,
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        ✅
                                    </div>
                                )}

                                <div style={{ fontSize: '60px', marginBottom: '15px', filter: isCompleted ? 'grayscale(0.5)' : 'none' }}>
                                    {task.emoji}
                                </div>
                                <h3 style={{ marginBottom: '10px', color: isCompleted ? '#999' : child.color }}>
                                    {task.name}
                                </h3>
                                <p style={{ color: '#999', marginBottom: '15px', fontSize: '1rem' }}>
                                    {task.description}
                                </p>
                                <div style={{
                                    background: isCompleted ? '#ddd' : child.color,
                                    color: isCompleted ? '#888' : 'white',
                                    padding: '10px 20px',
                                    borderRadius: '50px',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    display: 'inline-block'
                                }}>
                                    {isCompleted ? 'Done! ✅' : `+${task.points} ⭐`}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rewards Button */}
                <button
                    onClick={() => setShowRewards(true)}
                    className="btn btn-accent btn-large"
                    style={{
                        width: '100%',
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, #FFE66D, #FF9F1C)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                >
                    🎁 See Rewards & Redeem Stars! 🎁
                </button>
            </div>

            {/* Verification Modal */}
            < VerificationModal
                isOpen={!!verificationTask
                }
                onClose={() => setVerificationTask(null)}
                taskName={verificationTask?.name}
                onSendToParent={() => {
                    submitTaskForApproval(child.id, verificationTask.id);
                    setVerificationTask(null);
                    // No celebration, just set to pending state visually (reload data will handle it)
                    loadData();
                }}
                onInstantVerify={() => {
                    // Complete task immediately
                    const task = verificationTask;
                    const newCompletions = completeTask(child.id, task.id);
                    setCompletions(newCompletions);
                    setPoints(calculatePoints(child.id, newCompletions));

                    // Update weekly stats
                    const updatedStats = updateWeeklyStats(child.id, task.id, task.points, false);
                    if (updatedStats.children[child.id]) {
                        setWeeklyStats({
                            tasks: updatedStats.children[child.id].tasksCompleted,
                            points: updatedStats.children[child.id].pointsEarned
                        });
                    }

                    setVerificationTask(null);
                    setCelebrateTaskId(task.id);
                    setTimeout(() => setCelebrateTaskId(null), 1000);
                }}
            />
        </div >
    );
}

export default KidsTaskView;
