// Local storage utility functions for the Kids Task Tracker app

const STORAGE_KEYS = {
    CHILDREN: 'kidsTaskTracker_children',
    TASKS: 'kidsTaskTracker_tasks',
    REWARDS: 'kidsTaskTracker_rewards',
    COMPLETIONS: 'kidsTaskTracker_completions',
    REDEMPTIONS: 'kidsTaskTracker_redemptions',
    LAST_RESET: 'kidsTaskTracker_lastReset',
    PARENT_PASSWORD: 'kidsTaskTracker_parentPassword',
    WEEKLY_STATS: 'kidsTaskTracker_weeklyStats',
    WEEKLY_HISTORY: 'kidsTaskTracker_weeklyHistory',
    LAST_RESET_DATE: 'kidsTaskTracker_lastResetDate',
    PENDING_APPROVALS: 'kidsTaskTracker_pendingApprovals',
};

// Default data
export const DEFAULT_TASKS = [
    { id: '1', name: 'Make the Bed', points: 10, emoji: '🛏️', description: 'Make your bed nice and neat!' },
    { id: '2', name: 'Brush Teeth', points: 5, emoji: '🪥', description: 'Brush your teeth morning and night!' },
    { id: '3', name: 'Clean Up Room', points: 15, emoji: '🧹', description: 'Put away toys and keep room tidy!' },
    { id: '4', name: 'Play Violin', points: 20, emoji: '🎻', description: 'Practice violin for 15 minutes!' },
];

export const DEFAULT_REWARDS = [
    { id: '1', name: 'Dessert', cost: 30, emoji: '🍰', description: 'Yummy dessert after dinner!' },
    { id: '2', name: 'Screen Time', cost: 50, emoji: '📱', description: '30 minutes of screen time!' },
    { id: '3', name: 'Outdoor Play', cost: 40, emoji: '⚽', description: 'Extra outdoor playtime!' },
    { id: '4', name: 'Party with Friends', cost: 100, emoji: '🎉', description: 'Have friends over for a party!' },
];

export const DEFAULT_CHILDREN = [
    { id: '1', name: 'Child 1', color: '#FF6B9D', avatar: '🦄' },
    { id: '2', name: 'Child 2', color: '#4ECDC4', avatar: '🚀' },
];

// Get data from localStorage
export const getChildren = () => {
    const data = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    return data ? JSON.parse(data) : DEFAULT_CHILDREN;
};

export const getTasks = () => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : DEFAULT_TASKS;
};

export const getRewards = () => {
    const data = localStorage.getItem(STORAGE_KEYS.REWARDS);
    return data ? JSON.parse(data) : DEFAULT_REWARDS;
};

export const getCompletions = () => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    return data ? JSON.parse(data) : {};
};

export const getRedemptions = () => {
    const data = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
    return data ? JSON.parse(data) : [];
};

export const getLastReset = () => {
    return localStorage.getItem(STORAGE_KEYS.LAST_RESET) || new Date().toISOString();
};

export const getParentPassword = () => {
    return localStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD) || null;
};

// --- Sync Logic ---

const API_URL = '/api/data';
let isSyncing = false;

// Push specific data to server
const pushDataToServer = async (key, value) => {
    try {
        const payload = { [key]: value };
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        console.log(`Synced ${key} to server`);
    } catch (error) {
        console.error(`Failed to sync ${key}:`, error);
        // Silent fail - app continues offline
    }
};

// Initial bulk load from server
export const initialLoad = async () => {
    if (isSyncing) return;
    isSyncing = true;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');

        const serverData = await response.json();
        const keys = [
            STORAGE_KEYS.CHILDREN, STORAGE_KEYS.TASKS, STORAGE_KEYS.REWARDS,
            STORAGE_KEYS.COMPLETIONS, STORAGE_KEYS.REDEMPTIONS, STORAGE_KEYS.LAST_RESET,
            STORAGE_KEYS.PARENT_PASSWORD, STORAGE_KEYS.WEEKLY_STATS,
            STORAGE_KEYS.WEEKLY_HISTORY, STORAGE_KEYS.PENDING_APPROVALS
        ];

        keys.forEach(key => {
            if (serverData[key]) {
                // Server has data -> Update Local
                const currentLocal = localStorage.getItem(key);
                if (currentLocal !== serverData[key]) {
                    localStorage.setItem(key, serverData[key]);
                    // Dispatch event for UI updates (if app is running)
                    window.dispatchEvent(new CustomEvent('kidsTaskTracker_data_updated'));
                }
            } else {
                // Server missing data -> Push Local to Server (Migration)
                const localData = localStorage.getItem(key);
                if (localData) {
                    console.log(`Migrating local ${key} to server...`);
                    pushDataToServer(key, localData);
                }
            }
        });

        console.log('Data sync complete');
    } catch (error) {
        console.warn('Could not fetch from server (offline mode?):', error);
    } finally {
        isSyncing = false;
    }
};

export const startPolling = (intervalMs = 5000) => {
    setInterval(initialLoad, intervalMs);
};

// Save data to localStorage AND Server
export const saveChildren = (children) => {
    const data = JSON.stringify(children);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, data);
    pushDataToServer(STORAGE_KEYS.CHILDREN, data);
};

export const saveTasks = (tasks) => {
    const data = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEYS.TASKS, data);
    pushDataToServer(STORAGE_KEYS.TASKS, data);
};

export const saveRewards = (rewards) => {
    const data = JSON.stringify(rewards);
    localStorage.setItem(STORAGE_KEYS.REWARDS, data);
    pushDataToServer(STORAGE_KEYS.REWARDS, data);
};

export const saveCompletions = (completions) => {
    const data = JSON.stringify(completions);
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, data);
    pushDataToServer(STORAGE_KEYS.COMPLETIONS, data);
};

export const saveRedemptions = (redemptions) => {
    const data = JSON.stringify(redemptions);
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, data);
    pushDataToServer(STORAGE_KEYS.REDEMPTIONS, data);
};

export const saveLastReset = (date) => {
    localStorage.setItem(STORAGE_KEYS.LAST_RESET, date);
    pushDataToServer(STORAGE_KEYS.LAST_RESET, date);
};

export const saveParentPassword = (password) => {
    localStorage.setItem(STORAGE_KEYS.PARENT_PASSWORD, password);
    pushDataToServer(STORAGE_KEYS.PARENT_PASSWORD, password);
};

// Calculate points for a child
export const calculatePoints = (childId, completions) => {
    const tasks = getTasks();
    let totalPoints = 0;

    if (completions[childId]) {
        Object.entries(completions[childId]).forEach(([taskId, count]) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                totalPoints += task.points * count;
            }
        });
    }

    return totalPoints;
};

// Complete a task
export const completeTask = (childId, taskId) => {
    const completions = getCompletions();

    if (!completions[childId]) {
        completions[childId] = {};
    }

    if (!completions[childId][taskId]) {
        completions[childId][taskId] = 0;
    }

    completions[childId][taskId]++;
    saveCompletions(completions);

    return completions;
};

// Redeem a reward
export const redeemReward = (childId, rewardId) => {
    const rewards = getRewards();
    const reward = rewards.find(r => r.id === rewardId);

    if (!reward) return null;

    const currentPoints = calculatePoints(childId, getCompletions());

    if (currentPoints < reward.cost) {
        return null; // Not enough points
    }

    // Deduct points by adding a negative completion
    const completions = getCompletions();
    const pointsToDeduct = reward.cost;

    // Create a special "redemption" task to track point deductions
    if (!completions[childId]) {
        completions[childId] = {};
    }

    if (!completions[childId]['redemption']) {
        completions[childId]['redemption'] = 0;
    }

    completions[childId]['redemption'] -= pointsToDeduct;
    saveCompletions(completions);

    // Save redemption history
    const redemptions = getRedemptions();
    redemptions.push({
        id: Date.now().toString(),
        childId,
        rewardId,
        rewardName: reward.name,
        cost: reward.cost,
        date: new Date().toISOString(),
    });
    saveRedemptions(redemptions);

    return redemptions;
};

// Check if weekly reset is needed
export const checkWeeklyReset = () => {
    const lastReset = new Date(getLastReset());
    const now = new Date();

    // Check if it's Sunday and more than 6 days have passed
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));

    if (daysSinceReset >= 7 || (now.getDay() === 0 && lastReset.getDay() !== 0)) {
        // Reset completions
        saveCompletions({});
        saveLastReset(now.toISOString());
        return true;
    }

    return false;
};

// Export all data (for backup)
export const exportData = () => {
    return {
        children: getChildren(),
        tasks: getTasks(),
        rewards: getRewards(),
        completions: getCompletions(),
        redemptions: getRedemptions(),
        lastReset: getLastReset(),
    };
};

// Import data (for restore)
export const importData = (data) => {
    if (data.children) saveChildren(data.children);
    if (data.tasks) saveTasks(data.tasks);
    if (data.rewards) saveRewards(data.rewards);
    if (data.completions) saveCompletions(data.completions);
    if (data.redemptions) saveRedemptions(data.redemptions);
    if (data.lastReset) saveLastReset(data.lastReset);
};

// Weekly stats functions
export const getWeeklyStats = () => {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_STATS);
    return data ? JSON.parse(data) : { weekStartDate: null, children: {} };
};

export const saveWeeklyStats = (stats) => {
    const data = JSON.stringify(stats);
    localStorage.setItem(STORAGE_KEYS.WEEKLY_STATS, data);
    pushDataToServer(STORAGE_KEYS.WEEKLY_STATS, data);
};

export const getLastResetDate = () => {
    return localStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE) || null;
};

export const saveLastResetDate = (date) => {
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, date);
    pushDataToServer(STORAGE_KEYS.LAST_RESET_DATE, date);
};

// Update weekly stats when a task is completed (or undone with negative values)
export const updateWeeklyStats = (childId, taskId, points, isUndo = false) => {
    const stats = getWeeklyStats();
    const today = new Date().toISOString().split('T')[0];

    // Initialize child stats if needed
    if (!stats.children[childId]) {
        stats.children[childId] = {
            tasksCompleted: 0,
            pointsEarned: 0,
            dailyHistory: {}
        };
    }

    // Update totals
    if (isUndo) {
        stats.children[childId].tasksCompleted = Math.max(0, stats.children[childId].tasksCompleted - 1);
        stats.children[childId].pointsEarned = Math.max(0, stats.children[childId].pointsEarned - points);
    } else {
        stats.children[childId].tasksCompleted++;
        stats.children[childId].pointsEarned += points;
    }

    // Update daily history
    if (!stats.children[childId].dailyHistory[today]) {
        stats.children[childId].dailyHistory[today] = { tasks: 0, points: 0 };
    }

    if (isUndo) {
        stats.children[childId].dailyHistory[today].tasks = Math.max(0, stats.children[childId].dailyHistory[today].tasks - 1);
        stats.children[childId].dailyHistory[today].points = Math.max(0, stats.children[childId].dailyHistory[today].points - points);
    } else {
        stats.children[childId].dailyHistory[today].tasks++;
        stats.children[childId].dailyHistory[today].points += points;
    }

    saveWeeklyStats(stats);
    return stats;
};

// Remove a task completion (Undo)
export const removeCompletion = (childId, taskId) => {
    const completions = getCompletions();

    if (completions[childId] && completions[childId][taskId] > 0) {
        completions[childId][taskId]--;
        if (completions[childId][taskId] <= 0) {
            delete completions[childId][taskId];
        }
        saveCompletions(completions);
    }

    return completions;
};

// Reset daily task completions while preserving weekly stats
export const resetDailyTasks = () => {
    // Clear task completions but keep redemption points
    const completions = getCompletions();
    const newCompletions = {};

    // Preserve redemption deductions
    Object.keys(completions).forEach(childId => {
        if (completions[childId]['redemption']) {
            newCompletions[childId] = {
                redemption: completions[childId]['redemption']
            };
        }
    });

    saveCompletions(newCompletions);
};

// Get weekly history (last 6 weeks)
export const getWeeklyHistory = () => {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_HISTORY);
    return data ? JSON.parse(data) : [];
};

export const saveWeeklyHistory = (history) => {
    const data = JSON.stringify(history);
    localStorage.setItem(STORAGE_KEYS.WEEKLY_HISTORY, data);
    pushDataToServer(STORAGE_KEYS.WEEKLY_HISTORY, data);
};

// Reset weekly stats (called on Sunday night)
export const resetWeeklyStats = (newWeekStartDate) => {
    // 1. Get current stats to archive
    const currentStats = getWeeklyStats();

    // 2. Add to history if there is data
    if (currentStats.weekStartDate) {
        const history = getWeeklyHistory();

        // Add current week to beginning of history
        history.unshift({
            weekStartDate: currentStats.weekStartDate,
            children: currentStats.children
        });

        // Keep only last 6 weeks (current week + 5 past weeks)
        // Since we just added one, we might have 6 in history + current live one = better to keep history clean
        // Let's store past weeks in history. UI joins history + current.
        if (history.length > 5) { // Keep last 5 past weeks
            history.pop();
        }

        saveWeeklyHistory(history);
    }

    // 3. Reset current stats
    saveWeeklyStats({
        weekStartDate: newWeekStartDate,
        children: {}
    });
    saveWeeklyStats({
        weekStartDate: newWeekStartDate,
        children: {}
    });
};

// --- Parent Approval Logic ---

export const getPendingApprovals = () => {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_APPROVALS);
    return data ? JSON.parse(data) : {}; // { childId: [taskId1, taskId2, ...] }
};

export const savePendingApprovals = (pending) => {
    const data = JSON.stringify(pending);
    localStorage.setItem(STORAGE_KEYS.PENDING_APPROVALS, data);
    pushDataToServer(STORAGE_KEYS.PENDING_APPROVALS, data);
};

// Submit a task for approval (Child action)
export const submitTaskForApproval = (childId, taskId) => {
    const pending = getPendingApprovals();

    if (!pending[childId]) {
        pending[childId] = [];
    }

    // Avoid duplicates
    if (!pending[childId].includes(taskId)) {
        pending[childId].push(taskId);
        savePendingApprovals(pending);
    }

    return pending;
};

// Approve a task (Parent action)
export const approveTask = (childId, taskId) => {
    // 1. Remove from pending
    const pending = getPendingApprovals();
    if (pending[childId]) {
        pending[childId] = pending[childId].filter(id => id !== taskId);
        savePendingApprovals(pending);
    }

    // 2. Update Weekly Stats (Must happen before or with completion to ensure points are tracked)
    // We need to fetch the task to get the points
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        updateWeeklyStats(childId, taskId, task.points, false);
    }

    // 3. Complete the task normally (updates completion counts)
    return completeTask(childId, taskId);
};

// Reject a task (Parent action)
export const rejectTask = (childId, taskId) => {
    // Just remove from pending
    const pending = getPendingApprovals();
    if (pending[childId]) {
        pending[childId] = pending[childId].filter(id => id !== taskId);
        savePendingApprovals(pending);
    }
    return pending;
};

// Check if a task is pending
export const isTaskPending = (childId, taskId) => {
    const pending = getPendingApprovals();
    return pending[childId] && pending[childId].includes(taskId);
};
