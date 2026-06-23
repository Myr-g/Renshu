import { loadFilters } from "./filters/filter_tags.js";

/*---- DOM Elements ----*/
const post_story = document.getElementById("post-story-card");
const post_story_form = document.getElementById("post-story-form");
const post_story_title = document.getElementById("post-story-title");
const post_story_content = document.getElementById("post-story-content");
const post_story_tags = document.getElementById("post-story-tags");
const post_story_authors_note = document.getElementById("post-story-authors-note");
const post_story_cancel = document.getElementById("post-story-cancel");
const post_story_submit = document.getElementById("post-story-submit");

const filter_toggle = document.getElementById('filter-toggle');
const filter_panel = document.getElementById('filter-panel');
const filter_tag = document.getElementById("filter-tag");

/*---- Variables ----*/
let active_filters = [];

/*---- Generate Reviewer ID ----*/
generateReviewerId();

function generateReviewerId()
{
    if(localStorage.getItem("reviewerId"))
    {
        return;
    }

    localStorage.setItem("reviewerId", "reviewer_" + crypto.randomUUID());
}

/*---- Load Tags ----*/
function createTagRow(category, tags, buttonClass) 
{
    const row = document.createElement("div");
    row.classList.add("filter-row");

    const label = document.createElement("label");
    label.classList.add("filter-label");
    label.textContent = category;

    const tagContainer = document.createElement("div");
    tagContainer.classList.add("filter-tags");

    for(const tag of tags) 
    {
        const btn = document.createElement("button");
        btn.classList.add(buttonClass);
        btn.textContent = tag;
        tagContainer.appendChild(btn);
    }

    row.appendChild(label);
    row.appendChild(tagContainer);
    return row;
}

/*---- Post Story ----*/

/* Tags for posting a story */
await loadPostStoryTags();

async function loadPostStoryTags() 
{
    const filters = await loadFilters();
    post_story_tags.innerHTML = "";

    for(const [category, tags] of Object.entries(filters)) 
    {
        const row = createTagRow(category, tags, "post-story-tag");
        post_story_tags.appendChild(row);
    }
}

post_story.addEventListener("click", () => {
    post_story_form.classList.add("expanded");
});

post_story_cancel.addEventListener("click", (event) => {
    event.stopPropagation();
    post_story_form.classList.remove("expanded");
});

function getSelectedPostTags() {
    const TAG_CATEGORY_MAP = {
        "Genre": "genre",
        "Content Warning": "contentWarning",
        "Story Type": "storyType"
    };

    const rows = document.querySelectorAll(".post-story-tags .filter-row");
    const result = {
        genre: [],
        contentWarning: [],
        storyType: []
    };

    rows.forEach(row => {
        const label = row.querySelector("label").textContent.trim();
        const key = TAG_CATEGORY_MAP[label];

        const selected = row.querySelectorAll(".post-story-tag.selected");
        result[key] = Array.from(selected).map(btn => btn.textContent);
    });

    return result;
}

post_story_submit.addEventListener("click", async() => {
    const reviewerId = localStorage.getItem("reviewerId");
    const title = post_story_title.value.trim();
    const content = post_story_content.value.trim();
    const authorsNote = post_story_authors_note.value.trim();
    const tags = getSelectedPostTags();

    const res = await fetch("/community/writing-workshop/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({reviewerId, title, content, authorsNote, tags})
    });

    if(res.status === 400)
    {
        console.error("Invalid post story request: ", res.status);
        return;
    }

    post_story_title.value = "";
    post_story_content.value = "";
    post_story_authors_note.value = "";
    document.querySelectorAll(".post-story-tags .filter-row").forEach(row => {
        row.querySelectorAll(".post-story-tag.selected").forEach(btn => btn.classList.remove("selected"));
    });

    post_story_form.classList.remove("expanded");

    const data = await res.json();
    console.log(data);
});

/*---- Filters ----*/

/* Tags for filtering */
await loadFilterPanel();

async function loadFilterPanel() 
{
    const filters = await loadFilters();
    filter_panel.innerHTML = "";

    for(const [category, tags] of Object.entries(filters)) 
    {
        const row = createTagRow(category, tags, "filter-tag");
        filter_panel.appendChild(row);
    }
}

filter_toggle.addEventListener('click', () => {
  filter_panel.classList.toggle('expanded');
  filter_toggle.textContent = filter_panel.classList.contains('expanded') ? "Hide Filters" : "Show Filters";
});

document.addEventListener("click", async(event) => {
    if(event.target.classList.contains("post-story-tag"))
    {
        const row = event.target.closest(".filter-row");

        if(row.querySelector("label").textContent.trim() === "Story Type") 
        {
            row.querySelectorAll(".post-story-tag.selected").forEach(btn => btn.classList.remove("selected"));
        }

        event.target.classList.toggle("selected");
    }

    else if(event.target.classList.contains("filter-tag"))
    {
        event.target.classList.toggle("active");
        active_filters = [...document.querySelectorAll(".filter-tag.active")].map(tag => tag.textContent);
        await loadStories();
    }
});

/*---- Stories ----*/
await loadStories();

async function loadStories()
{
  try
  {
    const res = await fetch('/community/writing-workshop/stories');

    if(!res.ok)
    {
      console.error("Failed to fetch stories:", res.status);
      return;
    }

    const data = await res.json();

    const stories = document.getElementById("stories");
    stories.innerHTML = "";

    if(data.length === 0)
    {
      return;
    }

    data.forEach(story => {
        const story_tag_list = [];

        Object.values(story.tags).forEach(tagValue => {
            const tags = Array.isArray(tagValue) ? tagValue : [tagValue];
            story_tag_list.push(...tags);
        });

        const matches = (active_filters.length === 0 || active_filters.some(tag => story_tag_list.includes(tag)));

        if(matches)
        {
            const story_card = document.createElement("div");
            story_card.classList.add("story-card");
            story_card.dataset.id = story.id;

            const h2 = document.createElement("h2");
            h2.textContent = story.title;

            const story_tags = document.createElement("div");

            for(const tag of story_tag_list)
            {
                const story_tag = document.createElement("span");
                story_tag.classList.add("story-tag");
                story_tag.textContent = tag;
                story_tags.appendChild(story_tag);
            }

            const story_excerpt = document.createElement("p");
            story_excerpt.classList.add("story-excerpt");
            story_excerpt.textContent = story.content;

            const authors_note = document.createElement("p");
            authors_note.classList.add("authors-note");
            authors_note.textContent = story.authorsNote;

            const expiresAt = document.createElement("p");
            expiresAt.classList.add("story-expiration");
            expiresAt.textContent = getExpiryText(story.expiresAt);

            story_card.appendChild(h2);
            story_card.appendChild(story_tags);
            story_card.appendChild(story_excerpt);
            story_card.appendChild(authors_note);
            story_card.appendChild(expiresAt);
            stories.appendChild(story_card);

            story_card.addEventListener("click", () => {
                localStorage.setItem("workshopId", story.id);
                window.location.href = "/workshop_story.html";
            });
        }

        else
        {
            
        }
    });
  }

  catch(err)
  {
    console.error("Network error:", err);
  }
}

function getExpiryText(expiresAt) 
{
    const now = new Date();
    const expiry = new Date(expiresAt);

    const diffMs = expiry - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if(diffDays <= 0) 
    {
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

        if(diffHours <= 0)
        {
            return "Expired";
        }

        return `Expires in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
    }

    return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}
