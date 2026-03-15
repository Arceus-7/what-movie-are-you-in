
/**
 * Sends the image to our secure Netlify serverless function proxy.
 * This prevents the Gemini API key from being exposed to the public frontend.
 */
export async function analyzeImage(base64Image) {
  try {
    // In local development, Netlify CLI routes this. In production, it routes automatically.
    // Ensure we send it to our serverless function path.
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detailedError = errorData.details ? `${errorData.error} - ${errorData.details}` : errorData.error;
      throw new Error(detailedError || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error communicating with secure backend proxy:", error);
    throw error;
  }
}
