const axios = require("axios");
const { raw } = require("body-parser");
const ncbi = require("node-ncbi");

async function searchPubmed(query, start = 0, maxResults = 3) {
  try {
    const results = await ncbi.pubmed.search({
      term: query,
      retmin: start,
      retmax: maxResults,
    });
    if (!results || !results.papers || !Array.isArray(results.papers)) {
      console.error("Invalid response from PubMed API:", results);
      return []; 
    }

    return results.papers.map((paper) => ({
      raw: paper.raw,
      published: paper.pubDate ? new Date(paper.pubDate).toLocaleDateString() : "Unknown Date",
      title: paper.title,
      link: `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`,
      authors: paper.authors || "Unknown Author(s)", 
    }));
  } catch (error) {
    console.error("Error fetching from PubMed API:", error);
    return [];
  }
}

module.exports = { searchPubmed };
