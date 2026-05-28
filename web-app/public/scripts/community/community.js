/*---- DOM Elements ----*/
const story_reviews = document.getElementById("story_reviews");
const prompt_submissions = document.getElementById("prompt_submissions");

/*---- Landing Page Navigation----*/
story_reviews.addEventListener("click", () => {
    window.location.href="/story_reviews.html";
});

prompt_submissions.addEventListener("click", () => {
    window.location.href="/prompt_submissions.html";
});
