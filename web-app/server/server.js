const express = require("express");
const path = require("path");
const { createSession, getSessions, getSessionById, addUserToSession, removeUserFromSession } = require("./sessions");
const { createWorkshopSubmission, getWorkshopSubmission, getWorkshopSubmissions, getWorkshopRateLimits, removeExpiredSubmissions, addReview, getReviewRateLimits } = require("./workshop");
const { generatePromptSubmissionId } = require("./utils/ids");
const { appendToJsonFile } = require("./utils/file_helper");

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

/*--- Community ----*/

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