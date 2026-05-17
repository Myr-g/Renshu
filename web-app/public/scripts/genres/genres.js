async function loadGenres()
{
    const res = await fetch("scripts/genres/genres.json");
    return await res.json();
}

export { loadGenres };