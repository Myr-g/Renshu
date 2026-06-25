const crypto = require("crypto");

function generateId()
{
    const bytes = crypto.randomBytes(8);
    const id = Array.from(bytes, byte => (byte % 36).toString(36)).join('');
    return id;
}

function generateUserId()
{
    return "usr_" + generateId();
}

function generateWorkshopId()
{
    return "workshop_" + generateId();
}

function generatePromptSubmissionId(type)
{
    if(type === "simple_prompt")
    {
        return "simpro_" + generateId();
    }

    else if(type === "generator_contribution")
    {
        return "gencon_" + generateId();
    }
}

module.exports = {generateUserId, generateWorkshopId, generatePromptSubmissionId};