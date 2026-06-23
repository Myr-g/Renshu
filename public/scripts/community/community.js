/*---- DOM Elements ----*/
const writing_workshop = document.getElementById("writing-workshop");
const prompt_submissions = document.getElementById("prompt-submissions");

/*---- Landing Page Navigation----*/
writing_workshop.addEventListener("click", () => {
    window.location.href="/writing_workshop.html";
});

prompt_submissions.addEventListener("click", () => {
    window.location.href="/prompt_submissions.html";
});
