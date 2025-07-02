const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const cache = require("./cache");
const { fetchArxiv } = require("./arxivSearch");
const { fetchBiorxiv } = require("./biorxiv");
const { searchPubmed } = require("./pubmed");
const { fetchMedrxiv } = require("./medRxiv"); 

// Middleware
const serverapp = express();
serverapp.use(cors({ origin: "*" }));
serverapp.use(cookieParser());
serverapp.use(express.static(path.join(__dirname, "./public"))); 

// Arxiv API route
serverapp.get("/api/search", async (req, res) => {
  const q = req.query.q;
  const from = req.query.from || "2025-06-01";
  const to = req.query.to || "2025-06-23";

  // Cache keys
  const arxivKey = `arxiv:${q}`;
  const bioKey = `biorxiv:${from}-${to}`;
  const pubmedKey = `pubmed:${q}`;
  const medKey = `medrxiv:${from}-${to}`;

  try {
    // 1. arXiv search
    let arxiv = cache.get(arxivKey);
    if (!arxiv) {
      arxiv = await fetchArxiv(q);
      cache.set(arxivKey, arxiv);
      console.log("Fetched from arXiv API");
    } else {
      console.log("Fetched from cache (arXiv)");
    }

    // 2. bioRxiv search
    let biorxiv = cache.get(bioKey);
    if (!biorxiv) {
      biorxiv = await fetchBiorxiv("biorxiv", from, to);
      cache.set(bioKey, biorxiv);
      console.log("Fetched from bioRxiv API");
    } else {
      console.log("Fetched from cache (bioRxiv)");
    }

    // 3. PubMed search
    let pubmed = cache.get(pubmedKey);
    if (!pubmed) {
      pubmed = await searchPubmed(q);
      cache.set(pubmedKey, pubmed);
      console.log("Fetched from PubMed API");
    } else {
      console.log("Fetched from cache (PubMed)");
    }

    // 4. medRxiv search
    let medrxiv = cache.get(medKey);
    if (!medrxiv) {
      medrxiv = await fetchMedrxiv("medrxiv", from, to); 
      cache.set(medKey, medrxiv);
      console.log("Fetched from medRxiv API");
    } else {
      console.log("Fetched from cache (medRxiv)");
    }

    res.json({ arxiv, biorxiv, pubmed, medrxiv });
  } catch (error) {
    console.error("Error while fetching data:", error); 
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

serverapp.use((req, res) => {
  res.status(404).send("File not found");
});

const port = 3000;
serverapp.listen(port, function () {
  console.log(`Server: ${port}`);
});
