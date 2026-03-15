const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `You are a visionary cinematographer and film director. 
The user will provide you with a photograph of their current "real life" scene. 
Your job is to seamlessly re-contextualize this exact photo as a still from a fictional, highly acclaimed, culturally significant movie.
You must return your response as a valid, structured JSON object with the following keys exactly:

- "movieTitle": (String) A compelling, slightly pretentious, highly evocative title for this fictional film.
- "director": (String) An invented name of a visionary auteur director.
- "year": (Number) A realistic year this film would have been released (e.g., 1994, 2011, 2023).
- "country": (String) A country of origin (e.g., "France", "South Korea", "USA", "A24 Co-Production").
- "genre": (String) The specific micro-genre (e.g., "Neo-Noir Thriller", "Mumblecore Indie", "Slow Cinema", "Sci-Fi Horror").
- "totalRuntime": (Number) The runtime in minutes (e.g., 94, 132, 168).
- "minutesIn": (Number) The exact minute mark this photo occurs in the film's timeline.
- "characterDescription": (String) Briefly describe the protagonist in this scene based on the photo. What are their motivations? What are they wearing (even if not visible, invent it based on vibes)?
- "whatJustHappened": (String) A 1-2 sentence description of the intense or mundane dramatic action that occurred right before this frame.
- "whatIsAboutToHappen": (String) A 1-2 sentence description of the impending action or emotional beat that will follow this frame.
- "cinematographyNote": (String) A technical yet artsy description of how this shot was achieved (e.g., "Shot on 35mm Kodak Vision3 with an anamorphic lens, relying purely on the ambient street neon to silhouette the subject's quiet desperation.")
- "songPlaying": (String) An invented, highly specific licensed track name and artist that is playing diegetically or non-diegetically over this scene (e.g., "Neon Rain" by The Midnight, or "Concerto no. 4" by Vivaldi).`;

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error: Missing API Key.' })
      };
    }

    const { base64Image } = JSON.parse(event.body);

    if (!base64Image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing base64Image in request body.' })
      };
    }

    // Extract base64 payload by removing the data url prefix if it exists
    const base64Data = base64Image.split(',')[1] || base64Image;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const prompt = [
      { text: SYSTEM_PROMPT },
      { text: "Analyze this image and return the JSON scene card." },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ];

    let result;
    let lastError = null;
    const modelsToTry = [
      "gemini-2.5-flash", 
      "gemini-2.0-flash", 
      "gemini-1.5-flash", 
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro"
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log("Severless Proxy: Trying model: " + modelName);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        result = await model.generateContent(prompt);
        break; // break early if successful
      } catch (error) {
        console.warn(`Serverless Proxy: Model ${modelName} failed:`, error.message);
        lastError = error;
        // Only continue if the error is a 404 model not found
        if (!error.message.includes('404') && !error.message.includes('not found')) {
          throw error;
        }
      }
    }

    if (!result) {
      throw new Error("All fallback Gemini models returned a 404 Not Found. " + lastError?.message);
    }

    const responseText = result.response.text();
    console.log("Serverless Proxy: Gemini Raw Response received.");
    
    // In strict JSON mode, the response *is* valid JSON, but occasionally it might still have markdown wrapping if a fallback model ignored the config.
    const cleanText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    const parsedData = JSON.parse(cleanText);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parsedData)
    };

  } catch (error) {
    console.error("Serverless proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze image.', details: error.message })
    };
  }
};
