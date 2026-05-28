import { loadGenres } from "./genres/genres.js";
import { getStories, deleteStory, createStory } from "../utils/story_manager.js";

/*---- DOM Elements ----*/
const new_story_panel_toggle = document.getElementById("new_story_button");
const new_story_panel = document.getElementById("new_story_panel");
const story_title = document.getElementById("story_title");
const solo_button = document.getElementById("solo_story");
const collaborative_button = document.getElementById("collaborative_story");
const username_label = document.getElementById("username_label");
const username_input = document.getElementById("username");
const selected_genre = document.getElementById("genre_select");
const prompt_type = document.getElementById("prompt_type");
const cancel_button = document.getElementById("cancel_new_story");
const create_button = document.getElementById("create_new_story");

const join_panel = document.getElementById("join_panel");
const join_username_input = document.getElementById("join_username");
const cancel_join = document.getElementById("cancel_join");
const confirm_join = document.getElementById("confirm_join");

/*---- Variables ----*/
let story_type = "solo";
let joining = false;
let selected_session_id = null;

/*---- New Story Panel ----*/

// Open Panel
new_story_panel_toggle.addEventListener("click", () => {
  new_story_panel.hidden = false;
  story_title.focus();
  story_title.select();
});

// Close panel if user clicks outside of it
document.addEventListener("click", (event) => {
  if(event.target === new_story_panel) 
  {
    new_story_panel.hidden = true;
  }

  if(event.target === join_panel)
  {
    join_panel.hidden = true;
    joining = false;
    selected_session_id = null;
  }
});

// Close panel on esc key press
document.addEventListener("keydown", (event) => {
  if(event.key === "Escape") 
  {
    new_story_panel.hidden = true;
    join_panel.hidden = true;
    joining = false;
    selected_session_id = null;
  }
});

solo_button.addEventListener("click", () => {
  story_type = "solo";
  solo_button.classList.add("active");
  collaborative_button.classList.remove("active");
  username_label.hidden = true;
  username_input.hidden = true;
});

collaborative_button.addEventListener("click", () => {
  story_type = "collaborative";
  collaborative_button.classList.add("active");
  solo_button.classList.remove("active");
  username_label.hidden = false;
  username_input.hidden = false
  username_input.focus();
  
  if(localStorage.getItem("username"))
  {
    username_input.value = localStorage.getItem("username");
  }
});


await loadGenreList();

async function loadGenreList()
{
  const genres = await loadGenres();

  const select = document.getElementById("genre_select");
  select.length = 1;

  for(const genre of genres)
  {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    select.appendChild(option);
  }
}

// Close panel if the cancel button is pressed
cancel_button.addEventListener("click", () => {
  new_story_panel.hidden = true;
});

// Create new story or session
create_button.addEventListener("click", async () => {
  let title = story_title.value.trim();
  const genre = selected_genre.value;

  if(story_type === "solo")
  {
    if(!title)
    {
      title = "Untitled";
    }

    const data = {
      title: title,
      genre: genre,
      promptType: prompt_type.value, 
      prompt: ""              
    };

    const story = createStory(data);
    localStorage.setItem("storyId", story.id);
    window.location.href = "/writing.html";
  }

  else
  {
    try 
    {
      const username = username_input.value.trim();
      const promptType = prompt_type.value;

      if(!username)
      {
        console.error("Missing username");
        return;
      }

      if(!title)
      {
        title = "Untitled";
      }

      const createRes = await fetch("/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({title, genre, promptType})
      });

      if(createRes.status === 400)
      {
        console.error("Invalid session creation request:", createRes.status);
        return;
      }

      if(createRes.status === 409)
      {
        console.error("Session name already exists:", createRes.status);
        return;
      }

      if(!createRes.ok) 
      {
        console.error("Unexpected error:", createRes.status);
        return;
      }

      const createData = await createRes.json();
      console.log("Session created:", createData);

      const sessionId = createData.id;

      joining = true;

      const joinRes = await fetch(`/sessions/${sessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username})
      });

      if(joinRes.status === 400)
      {
        console.error("Missing username:", joinRes.status);
        return;
      }

      if(joinRes.status === 404)
      {
        console.error("Session join failed:", joinRes.status);
        return;
      }

      if(!joinRes.ok)
      {
        console.error("Unexpected error:", joinRes.status);
        return;
      }

      const joinData = await joinRes.json();

      localStorage.setItem("sessionId", joinData.sessionId);
      localStorage.setItem("userId", joinData.userId);
      localStorage.setItem("username", joinData.username);

      console.log("Joined session:", joinData);
      window.location.href = "/session.html";
    } 
  
    catch (err) 
    {
      console.error("Network error:", err);
    }

    finally
    {
      joining = false;
    }
  }
});

/*---- Stories List ----*/
loadStoriesList();

function loadStoriesList()
{
  const stories = getStories();
  const stories_list = document.getElementById("stories_list");
  stories_list.innerHTML = "";

  if(stories.length === 0)
  {
    const li = document.createElement("li");
    li.textContent = "No saved stories — create one to get started!";
    stories_list.appendChild(li);
  }

  else
  {
    for(const story of stories)
    {
      const li = document.createElement("li");
      li.classList.add("story-item");
      li.dataset.storyId = story.id;

      li.addEventListener("click", () => {
        localStorage.setItem("storyId", story.id);
        window.location.href = "/writing.html";
      });

      const titleSpan = document.createElement("span");
      titleSpan.textContent = story.title;

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete_story")
      deleteButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
	      <path d="M0 0h24v24H0z" fill="none" />
	      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16l-1.58 14.22A2 2 0 0 1 16.432 22H7.568a2 2 0 0 1-1.988-1.78zm3.345-2.853A2 2 0 0 1 9.154 2h5.692a2 2 0 0 1 1.81 1.147L18 6H6zM2 6h20m-12 5v5m4-5v5" />
      </svg>`;

      deleteButton.addEventListener("click", (event) => {
      
        event.stopPropagation();
        if(window.confirm("Are you sure?"))
        {
          deleteStory(story.id);
          loadStoriesList();
        }
      })

      li.appendChild(titleSpan);
      li.appendChild(deleteButton);
      stories_list.appendChild(li);
    }
  }
}

/*---- Sessions List ----*/
loadSessionsList();
setInterval(loadSessionsList, 5000);

async function loadSessionsList()
{
  if(joining)
  {
    return;
  }

  try
  {
    const res = await fetch('/sessions');

    if(!res.ok)
    {
      console.error("Failed to fetch sessions:", res.status);
      return;
    }

    const data = await res.json();

    const sessions_list = document.getElementById("sessions_list");
    sessions_list.innerHTML = "";

    if(data.sessions.length === 0)
    {
      const li = document.createElement("li");
      li.textContent = "No active sessions — create one of your own!";
      sessions_list.appendChild(li);
      return;
    }

    data.sessions.forEach(session => {
      const li = document.createElement("li");
      li.classList.add("session-item");
      li.textContent = `${session.title} - ${session.genre} | Writers: ${session.users}`;
      li.dataset.sessionId = session.id;

      li.addEventListener("click", async (event) => {
        event.stopPropagation();
        joining = true;
        join_panel.hidden = false;

        if(localStorage.getItem("username"))
        {
          join_username_input.value = localStorage.getItem("username");
        }

        join_username_input.focus();
        join_username_input.select();
        selected_session_id = li.dataset.sessionId;
      })
      
      sessions_list.appendChild(li);
    })
  }

  catch(err)
  {
    console.error("Network error:", err);
  }
}

/*---- Join Panel ----*/
cancel_join.addEventListener("click", () => {
  join_panel.hidden = true;
  joining = false;
})

confirm_join.addEventListener("click", async() => {
  const username = join_username_input.value;

  if(!username)
  {
    return;
  }

  const res = await fetch(`/sessions/${selected_session_id}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({username})
  });

  if(res.status === 400)
  {
    console.error("Missing username:", res.status);
    return;
  }

  if(res.status === 404)
  {
    console.error("Session join failed:", res.status);
    return;
  }

  if(!res.ok)
  {
    console.error("Unexpected error:", res.status);
    return;
  }

  const data = await res.json();

  localStorage.setItem("sessionId", data.sessionId);
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("username", data.username);

  console.log("Joined session:", data);
  window.location.href = "/session.html";
});
