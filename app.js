const express = require("express");
const serverapp = express();
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const scholar = require("google-scholar");
const arxiv = require("arxiv-api");
const SerpApi = require('google-search-results-nodejs');

serverapp.use(
  cors({
    origin: "*",
  })
);

serverapp.use(express.static(path.join(__dirname, "./public")));

// '/data' routi oz ichiga google scholar search engine malumotlarini oladi
serverapp.get("/data", async (req, res) => {
  const query = req.query.q;
  try {
    const search = new SerpApi.GoogleSearch("97c3a287fbc05bb6873ba733dbbe1ac40d08bf3363528ada2df69f06cb714601");

    const params = {
    engine: "google_scholar",
    q: query,
};

const callback = function(data) {
  res.json(data["organic_results"]);
};

// Show result as JSON
search.json(params, callback);

} catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "An error occurred" }); // Enhanced error response
  }
});



serverapp.get('/arxiv', async (req, res) => {
  const query = req.query.q;
  try {
    const arxivPapers = await arxiv.search({
      searchQueryParams: [
        {
          include: [{ name: query}],
        },
      ],
      start: 0,
      maxResults: 2
    });
    res.json(arxivPapers);
  } catch (error) {
    console.error(error); // Print the error for debugging
    res.status(500).json({ error: 'An error occurred' }); // Send an error response
  }
});

serverapp.get("/search", async function (req, res) {
  const query = req.query.q;

  const repos = [
    {
      url: `https://arxiv.org/search/?query=${query}&searchtype=all&source=header`,
      title: "arXiv",
    },
    {
      url: `https://www.biorxiv.org/search/${query}`,
      title: "bioRxiv",
    },
    {
      url: `https://www.medrxiv.org/search/${query}`,
      title: "medRxiv",
    },
    {
      url: `https://www.ncbi.nlm.nih.gov/pmc/?term=${query}`,
      title: "NCBI PMC",
    },
    // {
    //   url: `https://scholar.google.com/scholar?q=${query}+pdf`,
    //   // url: `https://www.google.com/search?q=${query}+pdf`,
    //   title: "PDF Search",
    // },
  ];

  try {
    const responseData = await Promise.all(
      repos.map((repo) => axios.get(repo.url))
    );

    const dataArray = responseData.map((response) => {
      let data = response.data;
      // Replace the question mark character with the appropriate encoding
      data = data.replace(/�/g, ""); // Replace with the desired character

      return data;
    });

    const htmlData = dataArray.join(""); // Combine all the processed data into a single HTML string

    res.setHeader("Content-Type", "text/html"); // Set the content type as HTML
    res.send(htmlData); // Send the HTML response
  } catch (error) {
    console.log("Error while fetching", error.message);
    res.status(500).json({ error: "An error occurred" });
  }
});

const port = 3000;
serverapp.listen(port, function () {
  console.log(`Server: ${port}`);
});
