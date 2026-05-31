/*----DOM Elements ----*/
const title = document.getElementById("title");
const back_button = document.getElementById("back_button");

const story_title = document.getElementById("story_title");
const story_tags = document.getElementById("story_tags");
const authors_note = document.getElementById("authors_note");
const story_content = document.getElementById("story_content");

const download_feedback = document.getElementById("download_feedback");
const review_comments = document.getElementById("review_comments");
const review_form = document.getElementById("review_form");
const review_input = document.getElementById("review_input");
const review_submit = document.getElementById("review_submit");

const blocked_reviewers = JSON.parse(localStorage.getItem("blockedReviewers")) || [];

async function getStoryReviewData()
{
    const workshop_id = localStorage.getItem("workshopId");

    const res = await fetch(`/community/writing-workshop/${workshop_id}`);

    if(!res.ok)
    {
        localStorage.removeItem("workshopId");
        window.location.href = "/writing_workshop.html";
        return;
    }

    const data = await res.json();
    return data;
}

back_button.addEventListener("click", () => {
    localStorage.removeItem("workshopId");
    window.location.href = "/writing_workshop.html";
});

function anonymizeReviewer(reviewerId)
{
  const id = reviewerId.split("_")[1];
  return `Reviewer#${id.slice(0, 4)}`;
}

function removeContextMenu()
{
    const existing = document.querySelector(".review_context_menu");

    if(existing)
    {
        existing.remove();
    }
}

function blockReviewer(reviewerId)
{
    if(!blocked_reviewers.includes(reviewerId))
    {
        blocked_reviewers.push(reviewerId);
        localStorage.setItem("blockedReviewers",JSON.stringify(blocked_reviewers));
    }
}

async function loadReviewComments(data)
{
    review_comments.innerHTML = "";

    for(const item of data.reviews)
    {
        if(blocked_reviewers.includes(item.reviewerId))
        {
            return;
        }

        const review = document.createElement("div");
        review.classList.add("review_comment");

        const reviewer = document.createElement("p");
        reviewer.classList.add("review_name")
        reviewer.textContent = anonymizeReviewer(item.reviewerId);

        reviewer.addEventListener("click", (event) => {
            removeContextMenu();

            const review_context_menu = document.createElement("div");
            review_context_menu.classList.add("review_context_menu");

            const reviewer_label = document.createElement("p");
            reviewer_label.textContent = anonymizeReviewer(item.reviewerId);

            const block_button = document.createElement("button");
            block_button.textContent = "Hide feedback from this reviewer";

            block_button.addEventListener("click", () => {
                blockReviewer(item.reviewerId);
                review.remove();
                removeContextMenu();
            });

            review_context_menu.appendChild(reviewer_label);
            review_context_menu.appendChild(block_button);

            document.body.appendChild(review_context_menu);

            review_context_menu.style.left = `${event.pageX}px`;
            review_context_menu.style.top = `${event.pageY}px`;
        });

        const review_text = document.createElement("p");
        review_text.classList.add("review_text");
        review_text.textContent = item.text;

        const review_date = document.createElement("p");
        review_date.classList.add("review_date");
        review_date.textContent = new Date(item.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(",", " ·");

        review.appendChild(reviewer);
        review.appendChild(review_text);
        review.appendChild(review_date);
        review_comments.appendChild(review);
    }
}

function downloadAllFeedback(data) 
{
    const { title, authorsNote, tags, createdAt, reviews } = data;

    // Header
    let output = `Story Feedback — ${title}\n`;
    output += `Posted: ${new Date(createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(",", " ·")}\n\n`;
    output += `Tags:\n`;
    output += `- Genre: ${tags.genre.join(", ")}\n`;
    output += `- Content Warning: ${tags.contentWarning.join(", ")}\n`;
    output += `- Story Type: ${tags.storyType}\n\n`;
    output += `Author’s Note:\n`;
    output += `${authorsNote || "None provided."}\n\n`;
    output += `----------------------------------------\n\n`;

    // Reviews
    if (reviews.length === 0) 
    {
        output += "No feedback yet.\n\n";
    } 
    
    else 
    {
        reviews.forEach(r => {
            if(!blocked_reviewers.includes(r.reviewerId))
            {
                output += `${anonymizeReviewer(r.reviewerId)} — ${new Date(r.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(",", " ·")}\n`;
                output += `${r.text}\n\n`;
            }
        });
    }

    // Footer
    output += `----------------------------------------\n\n`;
    output += `End of feedback`;

    // Create file
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_Feedback.txt`;
    a.click();

    URL.revokeObjectURL(url);
}

document.addEventListener("click", (event) => {
    if(!event.target.closest(".review_context_menu") && !event.target.classList.contains("review_name"))
    {
        removeContextMenu();
    }
});


review_submit.addEventListener("click", async() => {
    const workshopId = localStorage.getItem("workshopId");
    const reviewerId = localStorage.getItem("reviewerId");
    const text = review_input.value.trim();

    const res = await fetch(`/community/writing-workshop/${workshopId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({reviewerId, text})
    });

    if(res.status === 400)
    {
      console.error("Invalid review post request:", res.status);
      return;

      if(res.status === 404)
      {
        console.error("Workshop submission not found");
      }
    }

    review_input.value = "";

    const data = await getStoryReviewData();
    loadReviewComments(data);
});

window.addEventListener("DOMContentLoaded", async() => {
    const data = await getStoryReviewData();

    title.textContent = "Writing Workshop - " + data.title;
    story_title.textContent = data.title;

    Object.values(data.tags).forEach(tagValue => {
        const tags = Array.isArray(tagValue) ? tagValue : [tagValue];

        tags.forEach(tag => {
            if(!tag || tag.trim() === "")
            {
                return;
            }

            const story_tag = document.createElement("span");
            story_tag.classList.add("story_tag");
            story_tag.textContent = tag;
            story_tags.appendChild(story_tag);
        });
    });

    authors_note.textContent = data.authorsNote;

    if(authors_note.textContent === "")
    {
        authors_note.hidden = true;
    }

    story_content.textContent = data.content;
    story_content.innerHTML = story_content.textContent.replace(/\n/g, "<br>");

    const reviewerId = localStorage.getItem("reviewerId");

    if(data.reviewerId === reviewerId)
    {
        download_feedback.hidden = false;
        download_feedback.addEventListener("click", () => downloadAllFeedback(data));
    }

    loadReviewComments(data);
});