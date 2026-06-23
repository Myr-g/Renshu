const path = require("path");
const { loadMapFromJsonFile, saveMapToJsonFile } = require("./utils/file_helper")
const { generateWorkshopId } = require("./utils/ids");

const workshop_submissions = new Map(); // Key is the ID, Value is the review object
const workshop_rate_limits = new Map();
const review_rate_limits = new Map();

const filePath = path.join(__dirname, "./data/workshops.json");
loadMapFromJsonFile(filePath, workshop_submissions);

function createWorkshopSubmission(reviewerId, title, content, authorsNote, tags)
{
    const workshop_id = generateWorkshopId();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const submission = {
        id: workshop_id,
        reviewerId: reviewerId,
        title: title,
        content: content,
        authorsNote: authorsNote,
        tags: {
            genre: tags.genre,
            contentWarning: tags.contentWarning,
            storyType: tags.storyType 
        },
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        reviews: []
    };

    workshop_submissions.set(workshop_id, submission);
    saveMapToJsonFile(filePath, workshop_submissions);

    return submission;
}

function getWorkshopSubmission(id)
{
    if(workshop_submissions.has(id))
    {
        return workshop_submissions.get(id);
    }

    else
    {
        return null;
    }
}

function getWorkshopSubmissions()
{
    return Array.from(workshop_submissions.values());
}

function getWorkshopRateLimits()
{
    return workshop_rate_limits;
}

function removeExpiredSubmissions() 
{
    const now = Date.now();

    for(const[id, submission] of workshop_submissions.entries()) 
    {
        if(new Date(submission.expiresAt).getTime() <= now) 
        {
            workshop_submissions.delete(id);
        }
    }

    saveMapToJsonFile(filePath, workshop_submissions);
}

function addReview(workshopId, reviewerId, text)
{
    const submission = getWorkshopSubmission(workshopId);

    if(!submission)
    {
        return null;
    }
    
    const new_review = {
        reviewerId: reviewerId,
        text: text,
        createdAt: new Date().toISOString()
    };

    submission.reviews.push(new_review);
    saveMapToJsonFile(filePath, workshop_submissions);

    return new_review;
}

function getReviewRateLimits()
{
    return review_rate_limits;
}


module.exports = { createWorkshopSubmission, getWorkshopSubmission, getWorkshopSubmissions, getWorkshopRateLimits, removeExpiredSubmissions, addReview, getReviewRateLimits };