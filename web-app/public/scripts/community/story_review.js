/*----DOM Elements ----*/
const back_button = document.getElementById("back_button");

const story_title = document.getElementById("story_title");
const story_tags = document.getElementById("story_tags");
const authors_note = document.getElementById("authors_note");
const story_content = document.getElementById("story_content");

const review_comments = document.getElementById("review_comments");
const review_form = document.getElementById("review_form");
const review_input = document.getElementById("review_input");
const review_submit = document.getElementById("review_submit");

async function getStoryReviewData()
{
    const reviewId = localStorage.getItem("reviewId");

    const res = await fetch(`/community/story-reviews/${reviewId}`);

    if(!res.ok)
    {
        localStorage.removeItem("reviewId");
        window.location.href = "/";
        return;
    }

    const data = await res.json();
    return data;
}

back_button.addEventListener("click", () => {
    localStorage.removeItem("reviewId");
    window.location.href = "/story_reviews.html";
});

function anonymizeReviewer(reviewerId)
{
  const id = reviewerId.split("_")[1];
  return `Reviewer#${id.slice(0, 4)}`;
}

async function loadReviewComments(data)
{
    for(const item of data.reviews)
    {
        const review = document.createElement("div");
        review.classList.add("review_comment");

        const reviewer = document.createElement("p");
        reviewer.classList.add("review_name")
        reviewer.textContent = anonymizeReviewer(item.reviewerId);

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

review_submit.addEventListener("click", async() => {
    const reviewId = localStorage.getItem("reviewId");
    const reviewerId = localStorage.getItem("reviewerId");
    const text = review_input.value.trim();

    const res = await fetch(`/community/story-reviews/${reviewId}/review`, {
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

    loadReviewComments(data);

});