async function loadFilters()
{
    const res = await fetch("scripts/community/filters/filter_tags.json");
    return await res.json();
}

export { loadFilters };