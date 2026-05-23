/*---- DOM Elements ----*/
const story_reviews = document.getElementById("story_reviews");
const prompt_contributions = document.getElementById("prompt_contributions");

/*---- Landing Page Navigation----*/
story_reviews.addEventListener("click", () => {
    window.location.href="/story_reviews.html";
});

prompt_contributions.addEventListener("click", () => {
    window.location.href="/prompt_contributions.html";
});
