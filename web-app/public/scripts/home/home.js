import { getStories, deleteStory, createStory } from "../utils/story_manager.js";

/*---- DOM Elements ----*/
const new_story_card = document.getElementById("new_story_card");
const story_cards = document.getElementById("story_cards");

generateWriterId();

function generateWriterId()
{
    if(localStorage.getItem("writerId"))
    {
        return;
    }

    localStorage.setItem("writerId", "writer_" + crypto.randomUUID());
}

new_story_card.addEventListener("click", () => {
    const story = createStory(localStorage.getItem("writerId"));
    localStorage.setItem("storyId", story.id);
    window.location.href = "/story_editor.html";
});

loadStories();

function loadStories()
{
    const stories = getStories();
    stories.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    for(const story of stories)
    {
        const story_card = document.createElement("div");
        story_card.classList.add("story_card");

        story_card.addEventListener("click", () => {
            localStorage.setItem("storyId", story.id);
            window.location.href = "/story_editor.html";
        });

        const story_title = document.createElement("h2");
        story_title.classList.add("story_title");
        story_title.textContent = story.title;

        const story_info = document.createElement("p");
        story_info.classList.add("story_info");

        if(story.genre)
        {
            story_info.textContent = `${story.genre} · ${story.type === "solo" ? "Solo" : "Collaborative"}`;
        }

        else
        {
            story_info.textContent = story.type === "solo" ? "Solo" : "Collaborative";
        }

        const story_last_update = document.createElement("p");
        story_last_update.classList.add("story_last_update");
        story_last_update.textContent = generateLastUpdatedTimestamp(story.updatedAt || story.createdAt);


        const story_excerpt = document.createElement("p");
        story_excerpt.classList.add("story_excerpt");
        story_excerpt.textContent = generateExcerpt(story.content) || "Start writing...";

        story_card.appendChild(story_title);
        story_card.appendChild(story_info);
        story_card.appendChild(story_excerpt);
        story_card.appendChild(story_last_update);
        story_cards.appendChild(story_card);
    }
}

function generateExcerpt(content)
{
    return content.replace(/\s+/g, " ").trim().slice(0, 180);
}

function generateLastUpdatedTimestamp(updatedAt) 
{
    const timestamp = new Date(updatedAt).getTime();
    const now = Date.now();

    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if(diffMin < 1)
    {
        return "Last edited just now";
    }

    else if(diffMin < 60) 
    {
        return `Last edited ${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    }

    else if(diffHr < 24)
    {
        return `Last edited ${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
    }

    else if(diffDay < 7)
    {
        return `Last edited ${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
    }

    const datetime = new Date(timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(",", " ·");

    return `Last edited ${datetime}`;
}
