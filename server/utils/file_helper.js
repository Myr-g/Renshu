const fs = require("fs");
const path = require("path");

function appendToJsonFile(path, entry)
{
    let data = [];

    if(fs.existsSync(path)) 
    {
        const raw = fs.readFileSync(path, "utf8");
        data = JSON.parse(raw);
    }

    data.push(entry);

    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function loadMapFromJsonFile(path, map) 
{
    let data = []

    if(fs.existsSync(path)) 
    {
        const raw = fs.readFileSync(path, 'utf8');
        data = JSON.parse(raw);
        data.forEach(obj => { map.set(obj.id, obj); });
    }
}

function saveMapToJsonFile(path, map) 
{
    const data = Array.from(map.values());

    if(fs.existsSync(path))
    {
        fs.writeFileSync(path, JSON.stringify(data, null, 4), 'utf8');
    }
}

module.exports = { appendToJsonFile, loadMapFromJsonFile, saveMapToJsonFile };