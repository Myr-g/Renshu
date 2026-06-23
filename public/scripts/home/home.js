import { getStories, deleteStory, createStory } from "../utils/story_manager.js";

/*---- DOM Elements ----*/
const new_story_card = document.getElementById("new-story-card");
const story_cards = document.getElementById("story-cards");

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

    story_cards.innerHTML = "";

    for(const story of stories)
    {
        const story_card = document.createElement("div");
        story_card.classList.add("story-card");

        story_card.addEventListener("click", () => {
            localStorage.setItem("storyId", story.id);
            window.location.href = "/story_editor.html";
        });

        const story_header = document.createElement("div");
        story_header.classList.add("story-header");

        const story_title = document.createElement("h2");
        story_title.classList.add("story-title");
        story_title.textContent = story.title;

        const delete_container = document.createElement("div");
        delete_container.classList.add("delete-container");

        const delete_button = document.createElement("button");
        delete_button.classList.add("delete-button");
        delete_button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
	        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16l-1.58 14.22A2 2 0 0 1 16.432 22H7.568a2 2 0 0 1-1.988-1.78zm3.345-2.853A2 2 0 0 1 9.154 2h5.692a2 2 0 0 1 1.81 1.147L18 6H6zM2 6h20m-12 5v5m4-5v5" />
        </svg>`;

        delete_button.addEventListener("click", (event) => {
            event.stopPropagation();
            deleteStory(story.id);
            loadStories();
        });

        delete_container.appendChild(delete_button);
        story_header.appendChild(story_title);
        story_header.appendChild(delete_container);

        const story_info = document.createElement("p");
        story_info.classList.add("story-info");

        if(story.genre)
        {
            story_info.textContent = `${story.genre} · ${story.type === "solo" ? "Solo" : "Collaborative"}`;
        }

        else
        {
            story_info.textContent = story.type === "solo" ? "Solo" : "Collaborative";
        }

        const story_last_update = document.createElement("p");
        story_last_update.classList.add("story-last-update");
        story_last_update.textContent = generateLastUpdatedTimestamp(story.updatedAt || story.createdAt);


        const story_excerpt = document.createElement("p");
        story_excerpt.classList.add("story-excerpt");
        story_excerpt.textContent = generateExcerpt(story.content) || "Start writing...";

        story_card.appendChild(story_header);
        story_card.appendChild(story_info);
        story_card.appendChild(story_excerpt);
        story_card.appendChild(story_last_update);
        story_cards.appendChild(story_card);
    }
}

function generateExcerpt(content) 
{
    const excerpt = content.replace(/\s+/g, " ").trim();

    if(excerpt.length <= 180) 
    {
        return excerpt;
    }

    return excerpt.slice(0, 180).trim() + "…";
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
