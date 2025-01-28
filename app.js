
const express = require("express");
const serverapp = express();
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const arxiv = require("arxiv-api");
const NodeCache = require("node-cache");
const cookieParser = require('cookie-parser');

// Initialize cache
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

// Middleware
serverapp.use(cors({ origin: "*" }));
serverapp.use(cookieParser());
serverapp.use(express.static(path.join(__dirname, "./public")));

// Arxiv API route
serverapp.get('/arxiv', async (req, res) => {
  const query = req.query.q;
  const cacheKey = `arxiv_${query}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return res.json(cachedResult);
  }

  try {
    const arxivPapers = await arxiv.search({
      searchQueryParams: [{ include: [{ name: query }] }],
      start: 0,
      maxResults: 2,
    });
    cache.set(cacheKey, arxivPapers);
    res.json(arxivPapers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Search route
serverapp.get("/search", async (req, res) => {
  const query = req.query.q;
  const cacheKey = `search_${query}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return res.send(cachedResult);
  }

  const repos = [
    { url: `https://www.biorxiv.org/search/${query}`, title: "bioRxiv" },
    { url: `https://www.medrxiv.org/search/${query}`, title: "medRxiv" },
    { url: `https://www.ncbi.nlm.nih.gov/pmc/?term=${query}`, title: "NCBI PMC" },
  ];

  try {
    const responseData = await Promise.all(repos.map((repo) => axios.get(repo.url)));

    const dataArray = responseData.map((response) => {
      let data = response.data;
      data = data.replace(/�/g, ""); // Replace with the desired character
      return data;
    });

    const htmlData = dataArray.join("");
    cache.set(cacheKey, htmlData);
    res.setHeader("Content-Type", "text/html");
    res.send(htmlData);
  } catch (error) {
    console.log("Error while fetching", error.message);
    res.status(500).json({ error: "An error occurred" });
  }
});

const port = 3000;
serverapp.listen(port, function () {
  console.log(`Server: ${port}`);
});
