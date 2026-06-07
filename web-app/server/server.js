const express = require("express");
const path = require("path");
const { createStory, getStory, updateStory } = require("./collaborative_stories");
const { createWorkshopSubmission, getWorkshopSubmission, getWorkshopSubmissions, getWorkshopRateLimits, removeExpiredSubmissions, addReview, getReviewRateLimits } = require("./workshop");
const { generatePromptSubmissionId } = require("./utils/ids");
const { appendToJsonFile } = require("./utils/file_helper");

const http = require('http');
const WebSocket = require("ws");
const { createSession, getSession, joinSession, leaveSession } = require("./sessions");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get("/", (req, res) => {
    res.send("Collaborative Story Server API is running");
});

/*---- Collaborative Stories ----*/

// Creates a new collaborative story
app.post('/collaborative-stories/create', (req, res) => {
    const {story} = req.body;

    if(!story)
    {
        res.sendStatus(400);
        return;
    }

    const collaborative_story = createStory(story);
    const join_url = `${req.protocol}://${req.get('host')}/collaborative/${collaborative_story.id}`;

    res.status(201).json({collaborative_story, join_url});
});

// Gets info about a specific collaborative story
app.get('/collaborative-stories/:id', (req, res) => {
    const {id} = req.params;

    const collaborative_story = getStory(id);

    if(!collaborative_story)
    {
        res.sendStatus(404);
        return;
    }

    res.status(200).json(collaborative_story);
});

// Updates the collaborative story with the given id
app.put('/collaborative-stories/:id/update', (req, res) => {
    const {id} = req.params;
    const {story} = req.body;

    if(!story)
    {
        res.sendStatus(400);
        return;
    }

    if(id !== story.id)
    {
        res.sendStatus(400);
        return;
    }

    const updated_story = updateStory(story);

    if(!updated_story)
    {
        res.sendStatus(404);
        return;
    }

    res.status(200).json(updated_story);
});

// Join a collaborative story via the collab link
app.get('/collaborative/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'story_editor.html'));
});

/*---- Community ----*/

/* Writing Workshop */
removeExpiredSubmissions(); // Run once on startup
setInterval(removeExpiredSubmissions, 60 * 60 * 1000); // Run every hour

// Gets a list of all stories put up for review
app.get('/community/writing-workshop/stories', (req, res) => {
    res.status(200).json(getWorkshopSubmissions());
});

// Gets info about a specific story put up for review
app.get('/community/writing-workshop/:id', (req, res) => {
    const {id} = req.params;
    
    const workshop_submission = getWorkshopSubmission(id);

    if(!workshop_submission)
    {
        res.sendStatus(404);
        return;
    }

    res.status(200).json(workshop_submission);
});

// Creates a new story to be put up for review
app.post('/community/writing-workshop/post', async(req, res) => {
    const {reviewerId, title, content, authorsNote, tags} = req.body;

    if(!reviewerId || !title.trim() || !content.trim() || !tags)
    {
        res.sendStatus(400);
        return;
    }

    if(content.trim().length < 150) 
    {
        return res.status(400).json({ message: "Stories must be at least 150 characters long." });
    }

    if(!tags.genre || (!tags.storyType || tags.storyType.length !== 1))
    {
        res.sendStatus(400);
        return;
    }

    const workshop_rate_limits = getWorkshopRateLimits();
    const now = Date.now();
    const THIRTY_MINS = 30 * 60 * 1000;
    const last_post_time = workshop_rate_limits.get(reviewerId);

    if(last_post_time && (now - last_post_time < THIRTY_MINS))
    {
        const remaining_time = THIRTY_MINS - (now - last_post_time);
        const minutes = Math.ceil(remaining_time / 60000);
        const message = `You can only post one story every 30 minutes. You can post again in ${minutes} minute(s).`;
        return res.status(429).json({ message: message });
    }

    workshop_rate_limits.set(reviewerId, now);

    const workshop_submission = createWorkshopSubmission(reviewerId, title, content, authorsNote, tags);

    res.status(201).json(workshop_submission);
});

// Adds a review comment to the current story being viewed
app.post('/community/writing-workshop/:id/review', (req, res) => {
    const {id} = req.params;
    const {reviewerId, text} = req.body;
    
    const workshop_submission = getWorkshopSubmission(id);

    if(!workshop_submission)
    {
        res.sendStatus(404);
        return;
    }

    if(!reviewerId || !text.trim())
    {
        res.sendStatus(400);
        return;
    }

    if(text.trim().length < 20) 
    {
        return res.status(400).json({ message: "Comments must be at least 20 characters long." });
    }

    const review_rate_limits = getReviewRateLimits();
    const now = Date.now();
    const THIRTY_SECS = 30 * 1000;
    const last_post_time = review_rate_limits.get(reviewerId);

    if(last_post_time && (now - last_post_time < THIRTY_SECS))
    {
        const remaining_time = THIRTY_SECS - (now - last_post_time);
        const seconds = Math.ceil(remaining_time / 1000);
        const message = `You can only post one comment every 30 seconds. You can post again in ${seconds} second(s).`;
        return res.status(429).json({ message: message });
    }

    review_rate_limits.set(reviewerId, now);

    const new_review = addReview(id, reviewerId, text.trim());

    res.status(201).json(new_review);
});


/* Prompt Submissions */

// Submits a simple prompt to be reviewed
app.post('/community/prompt-submissions/simple-prompt-submission', (req, res) => {
    const {submission} = req.body;

    if(!submission || submission.trim() === "")
    {
        res.sendStatus(400);
        return;
    }

    const filePath = path.join(__dirname, "./data/simple_prompt_submissions.json");
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

// Submits a generator contribution to be reviewed
app.post('/community/prompt-submissions/generator-contribution-submission', (req, res) => {
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

    const filePath = path.join(__dirname, "./data/generator_contribution_submissions.json");
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

/*---- Web Sockets ----*/
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const ws_connections = new Map();

wss.on("connection", (ws, req) => {
    console.log("WebSocket connected");

    ws.on("message", (msg) => {
        let data;

        try 
        {
            data = JSON.parse(msg.toString());
        } 
        
        catch (err) 
        {
            console.error("Invalid JSON from client:", msg.toString());
            return;
        }

        if (data.type === "join") 
        {
            if(!data.storyId || !data.userId) 
            {
                console.warn("Join request missing storyId or userId");
                return;
            }

            joinSession(data.storyId, data.userId);

            ws_connections.set(ws, { storyId: data.storyId, userId: data.userId });
        }

        if(data.type === "update") 
        {
            const info = ws_connections.get(ws);

            if(!info)
            {
                return;
            }

            const { storyId, userId } = info;

            broadcastToSession(storyId, userId, { type: "update", storyId, content: data.content });
        }
    });

    ws.on("close", () => {
        const info = ws_connections.get(ws);

        if(info) 
        {
            leaveSession(info.storyId, info.userId);
            ws_connections.delete(ws);
        }

        console.log("WebSocket disconnected");
    });
});


function broadcastToSession(storyId, senderId, payload) 
{
    const session = getSession(storyId);

    if(!session)
    {
        return;
    }

    for(const userId of session.users) 
    {
        if(userId === senderId)
        {
            continue;
        }

        for(const [ws, info] of ws_connections.entries()) 
        {
            if (info.userId === userId && ws.readyState === WebSocket.OPEN)
            {
                ws.send(JSON.stringify(payload));
            }
        }
    }
}

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
