async function loadGenres()
{
    const res = await fetch("scripts/home/genres/genres.json");
    return await res.json();
}

export { loadGenres };