const fs = require("fs");

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

module.exports = {appendToJsonFile};