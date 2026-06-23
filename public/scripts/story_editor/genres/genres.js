async function loadGenres()
{
    const res = await fetch("/scripts/story_editor/genres/genres.json");
    return await res.json();
}

export { loadGenres };