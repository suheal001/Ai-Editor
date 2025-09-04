const apiKey = import.meta.env.VITE_TAVILY_API_KEY;

if (!apiKey || apiKey.includes("YOUR_TAVILY_API_KEY")) {
  console.warn("VITE_TAVILY_API_KEY is not set correctly in .env.local. Web search functionality will be disabled.");
}

export const searchTavily = async (query: string): Promise<string> => {
  if (!apiKey || apiKey.includes("YOUR_TAVILY_API_KEY")) {
    return "Web search is disabled. Please configure the VITE_TAVILY_API_KEY in your .env.local file.";
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Tavily API Error:", errorBody);
      throw new Error(`Tavily API error: ${errorBody.error || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.answer) {
      return data.answer;
    }
    
    return data.results.map((result: { title: string; url: string; content: string }) => 
      `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
    ).join('\n\n---\n\n');

  } catch (error) {
    console.error("Error calling Tavily API:", error);
    throw new Error("Failed to get response from the web search API.");
  }
};