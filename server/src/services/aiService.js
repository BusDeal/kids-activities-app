const { Configuration, OpenAIApi } = require('openai');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const path = require('path');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generatePlaceholder = async (fileType) => {
  try {
    const response = await openai.createImage({
      prompt: `A colorful, kid-friendly illustration representing ${fileType}. Style: cute, playful, and educational. Safe for children.`,
      n: 1,
      size: "256x256",
    });

    const imageUrl = response.data.data[0].url;
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
      text = 'PDF document';
    } else if (file.mimetype.startsWith('image/')) {
      // Use OpenAI's GPT-4 Vision API to analyze the image
      const response = await openai.createImageAnalysis({
        image: file.buffer,
        model: "gpt-4-vision-preview",
        prompt: "Describe this image in a way that's engaging for children. Focus on educational aspects and keep it brief (2-3 sentences)."
      });
      text = response.data.choices[0].text;
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