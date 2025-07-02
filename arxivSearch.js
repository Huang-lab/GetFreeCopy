const arxiv = require("arxiv-api");

async function fetchArxiv(query, maxResults = 3) {
  const results = await arxiv.search({
    searchQueryParams: [{ include: [{ name: query }] }],
    start: 0,
    maxResults: maxResults,
  });

  if (!results || !Array.isArray(results)) {
    console.error("Invalid response from arXiv API:", results);
    return [];
  }

  return results.map((e) => ({
    title: e.title || "No title",
    summary: e.summary || "",
    authors: e.authors,
    link: e.id || "#",
    published: e.published ? new Date(e.published).toLocaleDateString() : "Unknown Date",
  }));
}

module.exports = { fetchArxiv };
