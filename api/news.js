import fetch from "node-fetch";

export default async function handler(req, res) {
  const API_KEY = process.env.5be31f1f2a562587e6e4dfe8b8b24b11; 
  const url = `https://gnews.io/api/v4/top-headlines?lang=en&country=us&max=5&token=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch news" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching news" });
  }
}
