const OpenAI = require('openai');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const path = require('path');
const pdfParser = require('pdf-parse');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generatePlaceholder = async (fileType) => {
  try {
    const response = await openai.images.generate({
      prompt: `A colorful, kid-friendly illustration representing ${fileType}. Style: cute, playful, and educational. Safe for children.`,
      n: 1,
      size: "256x256",
    });

    const imageUrl = response.data[0].url;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Optimize the image
    const optimizedBuffer = await sharp(Buffer.from(imageBuffer))
      .resize(256, 256)
      .jpeg({ quality: 80 })
      .toBuffer();

    return optimizedBuffer;
  } catch (error) {
    console.error('Error generating placeholder:', error);
    // Return a default placeholder image
    return await sharp(path.join(__dirname, '../assets/default-placeholder.jpg'))
      .resize(256, 256)
      .jpeg({ quality: 80 })
      .toBuffer();
  }
};

const extractDescription = async (file) => {
  try {
    let text = '';
    
    if (file.mimetype === 'application/pdf') {
      // Extract text from PDF using pdf-parse or similar library
      // For now, we'll skip this part
      const pdfData = await pdfParser(file.buffer);
      text = pdfData.text;
    } else if (file.mimetype.startsWith('image/')) {
      // Use OpenAI's GPT-4 Vision API to analyze the image
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this image in a way that's engaging for children. Focus on educational aspects and keep it brief (2-3 sentences)." },
              { type: "image_url", image_url: { url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}` } }
            ]
          }
        ],
        max_tokens: 100
      });
      text = response.choices[0].message.content;
    }

    if (!text) {
      text = 'A creative piece of work';
    }

    return text;
  } catch (error) {
    console.error('Error extracting description:', error);
    return 'A creative piece of work';
  }
};

module.exports = {
  generatePlaceholder,
  extractDescription
};