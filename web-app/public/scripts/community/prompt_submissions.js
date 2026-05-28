/*---- DOM Elements ----*/
const simple_prompt = document.getElementById("simple_prompt");
const generator_contribution = document.getElementById("generator_contribution");

const simple_prompt_form = document.getElementById("simple_prompt_form");
const simple_prompt_submission = document.getElementById("simple_prompt_submission");
const simple_prompt_cancel = document.getElementById("simple_prompt_cancel");
const simple_prompt_submit = document.getElementById("simple_prompt_submit");

const generator_contribution_form = document.getElementById("generator_contribution_form");
const generator_contribution_type = document.getElementById("contribution_type");
const contribution_guidelines_toggle = document.getElementById("contribution_guidelines_toggle");
const contribution_guidelines = document.getElementById("contribution_guidelines");
const contribution_example_toggle = document.getElementById("contribution_example_toggle");
const contribution_example = document.getElementById("contribution_example");
const generator_contribution_submission = document.getElementById("generator_contribution_submission");
const contribution_notes = document.getElementById("contribution_notes");
const generator_contribution_cancel = document.getElementById("generator_contribution_cancel");
const generator_contribution_submit = document.getElementById("generator_contribution_submit");

/*---- Simple Prompt ----*/
simple_prompt.addEventListener("click", () => {
    simple_prompt_form.classList.add("expanded");
    generator_contribution_form.classList.remove("expanded");
});

simple_prompt_cancel.addEventListener("click", (event) => {
    event.stopPropagation();
    simple_prompt_form.classList.remove("expanded");
});

simple_prompt_submit.addEventListener("click", async() => {
    const submission = simple_prompt_submission.value.trim();

    const res = await fetch("/community/prompt-submissions/simple-prompt-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({submission})
    });

    if(res.status === 400)
    {
        console.error("Invalid simple prompt submission request: ", res.status);
        return;
    }

    simple_prompt_submission.value = "";
    simple_prompt_form.classList.remove("expanded");

    const data = await res.json();
    console.log(data);
});

/*---- Generator Contribution ----*/
generator_contribution.addEventListener("click", () => {
    generator_contribution_form.classList.add("expanded");
    simple_prompt_form.classList.remove("expanded");

    if(generator_contribution_type.value === "template")
    {
        contribution_guidelines.textContent = "Templates should establish a narrative setup or tension, using placeholders that are interchangeable to ensure a wide variety of different combinations for a single template.\n\n" +
        "Placeholders should not have 'a', 'an', or 'the' before them, as that would disrupt the general flow of the template and lowers reusability. Instead, they should go inside the word bank itself.\n\n" +
        "Templates should not expect highly-specific outputs for a word bank, and should generally work with most entries and across any genre.\n\n" +
        "Word Banks: character, character_adj, secondary_character, object, location, event, strange_event, message, goal, condition, consequence";

        contribution_example.textContent = "{character_adj} {character} realizes {condition}, and must decide whether or not to {goal}.";

        generator_contribution_submission.placeholder = "Write a reusable template using placeholders...";
    }

    if(generator_contribution_type.value === "word_bank")
    {
        contribution_guidelines.textContent = "General word banks should work across multiple genres and avoid any overly-specific details. They should be compatible with any template and encourage many different variations for any singular template.\n\n" +
        "Entries should be relatively short to ensure prompts read naturally.\n\n" +
        "Word Banks: character, character_adj, secondary_character, object, location, event, strange_event, message, goal, condition, consequence";

        contribution_example.textContent = "character: detective, poet, athlete\n" +
        "object: scratched music box, faded diary\n" +
        "location: narrow alley, quiet river";

        generator_contribution_submission.placeholder = "Add short, versatile entries for a new or existing word bank...";
    }

    if(generator_contribution_type.value === "genre_addition")
    {
        contribution_guidelines.textContent = "Genre-specific word banks should be compatible with any template, while also reinforcing the tone and/or atmosphere of a given genre without making prompts too repetitive or predictable.\n\n" +
        "Add: expands on the general word banks, enhancing variability by providing entries that are more specific to a given genre.\n\n" +
        "Override: replaces the general word banks that do not suit the given genre well, providing a different tone or atmosphere compared to the corresponding general word bank.\n\n" +
        "Word Banks: character, character_adj, secondary_character, object, location, event, strange_event, message, goal, condition, consequence";

        contribution_example.textContent = "Genre: Horror\n\n" +
        "Add:\n" +
        "location: abandoned church, empty parking garage\n" +
        "object: antique doll, rusted key\n\n" +
        "Override:\n" +
        "strange event: lights start flickering in constant rhythm";

        generator_contribution_submission.placeholder = "Add genre‑specific entries that enhance tone and atmosphere for a new or existing word bank...";
    }

    if(generator_contribution_type.value === "challenge_rule")
    {
        contribution_guidelines.textContent = "Challenge prompts provide an alternative structure for prompts, giving only elements of the story and a challenge rule.\n\n" +
        "Challenge rules should be made with the intention of getting writers a bit out of their usual comfort zones to enhance their writing by providing specific narrative styles, tropes, or other constraints.\n\n" +
        "Challenge prompts are intentionally more restrictive than standard prompts.";

        contribution_example.textContent = "write in first person\n" +
        "leave the ending open to interpretation\n" +
        "do not name any characters";

        generator_contribution_submission.placeholder = "Write a challenge rule that introduces a creative constraint for writers...";
    }

    contribution_example.textContent += "\n\nNote: Don't worry about matching the example format perfectly — just make it clear what goes where."

    contribution_guidelines.innerHTML = contribution_guidelines.textContent.replace(/\n/g, "<br>");
    contribution_example.innerHTML = contribution_example.textContent.replace(/\n/g, "<br>");
});

contribution_guidelines_toggle.addEventListener("click", (event) => {
    event.stopPropagation();

    contribution_guidelines.hidden = !contribution_guidelines.hidden;

    if(contribution_guidelines.hidden)
    {
        contribution_guidelines_toggle.textContent = "Guidelines ▸";
    }

    else
    {
        contribution_guidelines_toggle.textContent = "Guidelines ▾";
    }
});

contribution_example_toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    
    contribution_example.hidden = !contribution_example.hidden;

    if(contribution_example.hidden)
    {
        contribution_example_toggle.textContent = "Example ▸";
    }

    else
    {
        contribution_example_toggle.textContent = "Example ▾";
    }
});

generator_contribution_cancel.addEventListener("click", (event) => {
    event.stopPropagation();
    generator_contribution_form.classList.remove("expanded");
});

generator_contribution_submit.addEventListener("click", async() => {
    const contribution_type = generator_contribution_type.value;
    const submission = generator_contribution_submission.value.trim();
    const notes = contribution_notes.value.trim();

    const res = await fetch("/community/prompt-submissions/generator-contribution-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({contribution_type, submission, notes})
    });

    if(res.status === 400)
    {
        console.error("Invalid generator contribution submission request: ", res.status);
        return;
    }
    
    generator_contribution_type.value = "template";
    generator_contribution_submission.value = "";
    contribution_notes.value = "";
    generator_contribution_form.classList.remove("expanded");

    const data = await res.json();
    console.log(data);
});