export async function searchGoogleViaSerper(query: string, gl: string = "ng") {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl, // "ng" for Nigeria, "us" for United States, "gb" for UK
      num: 10,
    }),
  });

  if (!res.ok) return null;
  return res.json(); // Returns organic results, People Also Ask, and related searches
}

export async function fetchTrendsViaSerpApi(query: string, geo: string = "NG") {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  const url = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(
    query
  )}&geo=${geo}&data_type=RELATED_QUERIES&api_key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json(); // Returns rising & top breakout search queries
}