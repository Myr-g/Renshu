import { formatStoryForDownload } from "../../utils/story_manager.js";
const { PDFDocument } = PDFLib;

async function formatStoryToPdf(story)
{
    const story_data = formatStoryForDownload(story); 

    const formattedStory = []; 
    
    formattedStory.push(story_data.title); 
    formattedStory.push("");

    const metadata = story_data.metadata; 

    if(metadata.length > 0) 
    { 
        for(const line of metadata)
        {
            formattedStory.push(line);
        }

        formattedStory.push("");
    } 

    formattedStory.push("---"); 
    formattedStory.push("");

    for(const line of story_data.content)
    {
        formattedStory.push(line);
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();

    const { width, height } = page.getSize();
    const margin = 50;
    const maxWidth = width - margin * 2;
    let y = height - margin;

    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const fontSize = 12;

    for(const line of formattedStory) 
    {
        // Split on newline characters
        const actualLines = line.split("\n");

        for(const sub of actualLines) 
        {
            if(sub.trim() === "") 
            {
                y -= 20;
                continue;
            }

            const wrapped = wrapText(sub, font, fontSize, maxWidth);

            for(const wrappedLine of wrapped) 
            {
                if(y < margin) 
                {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }

                page.drawText(wrappedLine, { x: margin, y, size: fontSize, font });
                y -= 20;
            }
        }
    }


    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    return blob;
}

function wrapText(text, font, fontSize, maxWidth) 
{
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) 
    {
        const testLine = currentLine ? currentLine + " " + word : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > maxWidth) 
        {
            lines.push(currentLine);
            currentLine = word;
        } 
        
        else 
        {
            currentLine = testLine;
        }
    }

    if (currentLine) 
    {
        lines.push(currentLine);    
    }

    return lines;
}

export { formatStoryToPdf };
