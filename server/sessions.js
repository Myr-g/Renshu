const sessions = new Map();

function createSession(storyId)
{
    const session = {
        storyId: storyId,
        users: new Set()
    };

    sessions.set(storyId, session);

    return session;
}

function getSession(storyId)
{
    if(sessions.has(storyId))
    {
        return sessions.get(storyId);
    }

    else
    {
        return null;
    }
}

function joinSession(storyId, userId)
{
    let session = getSession(storyId);

    if(!session)
    {
        session = createSession(storyId);
    }

    session.users.add(userId);
    return session;
}

function leaveSession(storyId, userId)
{
    const session = getSession(storyId);

    if(!session)
    {
        return null;
    }

    session.users.delete(userId);

    removeEmptySession(storyId);

    return session;
}

function removeEmptySession(storyId)
{
    const session = getSession(storyId);

    if(!session)
    {
        return null;
    }
    
    if(session.users.size === 0)
    {
        sessions.delete(storyId);
    }
}

module.exports = { createSession, getSession, joinSession, leaveSession };