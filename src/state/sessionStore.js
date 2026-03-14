const sessions = new Map();

function setSession(userId, data) {
    sessions.set(userId, {
        ...data,
        updatedAt: Date.now()
    });
}

function getSession(userId) {
    return sessions.get(userId);
}

function clearSession(userId) {
    sessions.delete(userId);
}

module.exports = {
    setSession,
    getSession,
    clearSession
};