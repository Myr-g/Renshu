const path = require("path");
const { loadMapFromJsonFile, saveMapToJsonFile } = require("./utils/file_helper");

const stories = new Map();

const filePath = path.join(__dirname, "./data/collaborative_stories.json");
loadMapFromJsonFile(filePath, stories); 

function saveStories()
{
    const filePath = path.join(__dirname, "./data/collaborative_stories.json");
    saveMapToJsonFile(filePath, stories);
}

function createStory(story)
{
    const collaborative_story = { ...story };
    collaborative_story.type = "collaborative";
    collaborative_story.updatedAt = new Date().toISOString();

    stories.set(collaborative_story.id, collaborative_story);
    saveStories();

    return collaborative_story;
}

function getStory(id)
{
    if(stories.has(id))
    {
        return stories.get(id);
    }

    else
    {
        return null;
    }
}

function updateStory(story)
{
    if(!stories.has(story.id))
    {
        return null;
    }

    story.updatedAt = new Date().toISOString();
    stories.set(story.id, story);
    saveStories();
    return story;
}

module.exports = { createStory, getStory, updateStory };