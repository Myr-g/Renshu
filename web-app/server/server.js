const express = require("express");
const { createSession, getSessions, getSessionById, addUserToSession, removeUserFromSession } = require("./sessions");
const path = require("path");
const { appendToJsonFile } = require("./utils/file_helper");
const { generatePromptSubmissionId } = require("./utils/ids");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get("/", (req, res) => {
    res.send("Collaborative Story Server API is running");
});

// Gets a list of sessions with simplified information about each
app.get('/sessions', (req, res) => {
    const sessions_list = getSessions();
    let summarized_sessions = [];

    for(let i = 0; i < sessions_list.length; i++)
    {
        summarized_sessions[i] = {
            id: sessions_list[i].id,
            title: sessions_list[i].title,
            genre: sessions_list[i].genre,
            prompt: sessions_list[i].prompt,
            users: sessions_list[i].users.size,
            createdAt: sessions_list[i].createdAt
        }
    }

    res.status(200).json({sessions: summarized_sessions});
});

// Gets info about a specifc session
app.get('/sessions/:id', (req, res) => {
    const {id} = req.params;
    const {userId} = req.query;

    const session = getSessionById(id);

    if(!session)
    {
        res.sendStatus(404);
        return;
    }

    if(!userId)
    {
        res.sendStatus(400);
        return;
    }

    if(!session.users.has(userId))
    {
        res.sendStatus(403);
        return;
    }

    const response = {
        sessionId: session.id,
        title: session.title,
        genre: session.genre,
        promptType: session.promptType,
        prompt: session.prompt,
        promptLocked: session.promptLocked,
        content: session.content,
        userCount: session.users.size,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
    };

    res.status(200).json(response);
});

// Creates a new session
app.post('/sessions', async(req, res) => {
    console.log(req.body);

    const {title, genre, promptType} = req.body;
    let chosen_genre = null;

    if(!title || !genre)
    {
        res.sendStatus(400);
        return;
    }

    const session = createSession(title, genre, promptType);

    if(!session)
    {
        // Duplicate Session Name
        res.sendStatus(409);
        return;
    }

    res.status(201).json({
        id: session.id,
        title: session.title,
        genre: session.genre,
        createdAt: session.createdAt
    });
});

// Lets a user join an existing session
app.post('/sessions/:id/join', (req, res) => {
    const {id} = req.params;
    const {username} = req.body;

    if(!getSessionById(id))
    {
        res.sendStatus(404);
        return;
    }

    if(!username)
    {
        res.sendStatus(400);
        return;
    }

    const joined = addUserToSession(id, username);

    if(!joined)
    {
        res.sendStatus(404);
        return;
    }

    res.status(200).json({
        sessionId: joined.session.id,
        userId: joined.user.id,
        username: joined.user.name
    });
});

// Lets user leave a session
app.post('/sessions/:id/leave', (req, res) => {
    const {id} = req.params;
    const {userId} = req.body;

    if(!getSessionById(id))
    {
        res.sendStatus(404);
        return;
    }

    if(!userId)
    {
        res.sendStatus(400);
        return;
    }

    if(!removeUserFromSession(id, userId))
    {
        res.sendStatus(404);
        return;
    }

    res.status(200).json({
        userId: userId,
    });
});

// Allows user to replace or add text to a sessions' story
app.post('/sessions/:id/write', (req, res) => {
    const {id} = req.params;
    const{userId, title, prompt, text, mode} = req.body;

    const session = getSessionById(id);

    if(!session)
    {
        res.sendStatus(404);
        return;
    }
    
    const oldStory = session.content;

    if(!userId || typeof text != "string" || !title)
    {
        res.sendStatus(400);
        return;
    }

    if(!session.users.has(userId))
    {
        res.sendStatus(404);
        return;
    }

    if(session.title !== title)
    {
        session.title = title;
    }

    if(session.prompt !== prompt)
    {
        session.prompt = prompt;
    }

    if(mode === "replace")
    {
        session.content = text;
    }

    else if(mode === "append")
    {
        session.content += text;
    }

    else
    {
        res.sendStatus(400);
        return;
    }

    if(session.promptLocked === false)
    {
        const new_story = session.content;

        if(oldStory.trim().length === 0 && new_story.trim().length > 0)
        {
            session.promptLocked = true;
        }
    }

    session.updatedAt = new Date().toISOString();
    res.status(200).json({
        promptLocked: session.promptLocked
    });
});

app.post('/community/simple-prompts', (req, res) => {
    const {submission} = req.body;

    if(!submission || submission.trim() === "")
    {
        res.sendStatus(400);
        return;
    }

    const filePath = path.join(__dirname, "./data/simple_prompts.json");
    const id = generatePromptSubmissionId("simple_prompt");
    const sp_submission = {
        submissionId: id,
        submission: submission,
        submittedAt: new Date().toISOString()
    };

    appendToJsonFile(filePath, sp_submission);

    res.status(200).json({
        success: true, 
        message: "Simple Prompt submission successful."
    });
});

app.post('/community/generator-contributions', (req, res) => {
    const {contribution_type, submission, notes} = req.body;

    if(!contribution_type)
    {
        res.sendStatus(400);
        return;
    }

    if(!submission || submission.trim() === "")
    {
        res.sendStatus(400);
        return;
    }

    const filePath = path.join(__dirname, "./data/generator_contributions.json");
    const id = generatePromptSubmissionId("generator_contribution");
    const gc_submission = {
        submissionId: id,
        contribution_type: contribution_type,
        submission: submission,
        additionalNotes: notes,
        submittedAt: new Date().toISOString()
    };

    appendToJsonFile(filePath, gc_submission);

    res.status(200).json({
        success: true, 
        message: "Generator Contribution submission successful."
    });
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});