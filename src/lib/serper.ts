const apiKey = import.meta.env.VITE_SERPER_API_KEY;

if (!apiKey) {
  console.warn("VITE_SERPER_API_KEY is not set in .env.local. Web search functionality will be disabled.");
}

export const searchSerper = async (query: string): Promise<string> => {
  if (!apiKey) {
    return "Web search is disabled. Please configure the VITE_SERPER_API_KEY in your .env.local file.";
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Serper API Error:", errorBody);
      throw new Error(`Serper API error: ${errorBody.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.answerBox) {
      return data.answerBox.snippet || data.answerBox.answer || "No direct answer found.";
    }
    
    if (data.organic && data.organic.length > 0) {
        return data.organic.map((result: { title: string; link: string; snippet: string }) => 
          `Title: ${result.title}\nURL: ${result.link}\nSnippet: ${result.snippet}`
        ).slice(0, 5).join('\n\n---\n\n');
    }

    return "No relevant search results found.";

  } catch (error) {
    console.error("Error calling Serper API:", error);
    throw new Error("Failed to get response from the web search API.");
  }
};