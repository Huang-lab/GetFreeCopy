const loader = document.querySelector(".loader");

document.getElementById("search-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const searchInput = document.querySelector('input[name="term"]');
    const searchResults = document.getElementById("search-results");
    const query = searchInput.value.trim();  

    if (query === "") {
      return;
    }

    function hideResult(){
      searchResults.style.display = "none"; // Hide search results container
     
    }
    function showResult() {
      searchResults.style.display = "flex"; // Show search results container
      searchResults.style.flexWrap = "nowrap"; // Use camelCase for flexWrap
      searchResults.style.justifyContent = "space-around"; // Use camelCase for justifyContent
      searchResults.style.gap = "6px"; // No change needed here
    }
      
    searchResults.innerHTML = ""; // Clear previous search results
    const repos = [
      {
        title: "arXiv",
      },
      {
        title: "bioRxiv",
      },
      {
        title: "medRxiv",
      },
      {
        title: "NCBI PMC",
      },
    // {
    //   title: "PDF Search",
    // },
    ];

    
    for (const repo of repos) {
      const repoDiv = document.createElement("div");
      repoDiv.className = "repository";
      repoDiv.innerHTML = `<h3>${repo.title}</h3>`;
      searchResults.appendChild(repoDiv);


      hideResult();
      loader.style.display = "block"
      // Fetch search results from the server

      try {
        const response = await fetch(`/search?q=${query}`);
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");

        //======================================================================================= Arxiv Search================================================================        

        if (repo.title === "arXiv") {
          try {
            const response = await fetch(`/arxiv?q=${query}`);
            const jsonData = await response.json();


            if (jsonData.length === 0) {
              repoDiv.innerHTML += "<p>No results found.</p>";
            } else {
              for (const paperData of jsonData) {
                const paperDiv = document.createElement("div");
                paperDiv.className = "paper";

                // Extract title from paper data
                const titleLink = document.createElement("a");
                titleLink.className = "arxivTitleLink";
                titleLink.href = paperData.links[0]["href"]; // Set the URL for the link
                titleLink.textContent = paperData.title;
                titleLink.style.fontSize = "18px"; // Adjust the font size as needed for h4 size

                // Extract author from paper data
                const authorEl = document.createElement("p");
                authorEl.className = "author";
                authorEl.innerHTML =
                  "<strong>Author(s):</strong> " + paperData.authors;

                // Extract summary from paper data
                const summaryElement = document.createElement("p");
                summaryElement.textContent = paperData.summary;

                // Extract published from paper data
                const publishedData = document.createElement("p");
                publishedData.className = "publishedData";
                publishedData.innerHTML =
                  "<strong>Published Date: </strong> " + paperData.published;

                // Extract updated from paper data
                const updatedEl = document.createElement("p");
                updatedEl.className = "updated";
                updatedEl.innerHTML =
                  "<strong>Updated Date:</strong>: " + paperData.updated;

                // extract DOI from the paper
                const doi = document.createElement('p');
                doi.className = "doi";
                doi.innerHTML = "<strong>doi:</strong> " + paperData.id;

                
                paperDiv.appendChild(titleLink);
                paperDiv.appendChild(authorEl);
                paperDiv.appendChild(summaryElement);
                paperDiv.appendChild(publishedData);
                paperDiv.appendChild(updatedEl);
                paperDiv.appendChild(doi);

                repoDiv.appendChild(paperDiv); // Append the paper div to the repository div
              }
            }
          } catch (error) {
            console.error(
              "Error while fetching or processing data:",
              error.message
            );
          }
        }

        //========================================================================================  NCBI PMC =============================================================

        if (repo.title === "NCBI PMC") {
          const paperItems = doc.querySelectorAll(".rprt");
          const topPaperItems = Array.from(paperItems).slice(0, 3);

          if (topPaperItems.length === 0) {
            repoDiv.innerHTML += "<p>No results found.</p>";
          } else {
            topPaperItems.forEach((paperItem) => {
              const paperDiv = document.createElement("div");
              paperDiv.className = "paper";

              const authors = Array.from(
                paperItem.querySelectorAll(".desc")
              ).map((author) => author.innerText);
              const pmcId = Array.from(
                paperItem.querySelectorAll(".rprtid dd")
              ).map((pmcid) => pmcid.textContent);
              const pmcDate = Array.from(
                paperItem.querySelectorAll(".ms-submitted-date")
              ).map((date) => date.textContent);
              const doi = Array.from(paperItem.querySelectorAll(".doi")).map(
                (doi) => doi.textContent
              );

              const links = paperItem
                .querySelector(".links")
                .querySelectorAll("a");
              const articleLinks = Array.from(links).map((link) => {
                const href = link.getAttribute("href");
                const url = "https://www.ncbi.nlm.nih.gov" + href;
                return `<a href="${url}">${link.textContent}</a>`;
              });

              // directing to the desired page

              const href = paperItem.querySelector("a").getAttribute("href");
              const titleLink = document.createElement("a");
              titleLink.setAttribute(
                "href",
                "https://www.ncbi.nlm.nih.gov" + href
              );
              titleLink.textContent =
                paperItem.querySelector(".title").textContent;

              // Highlight exact title match
              if (titleLink.textContent.toLowerCase() === query.toLowerCase()) {
                paperDiv.innerHTML = `<h4><mark>${titleLink.outerHTML}</mark></h4>`;
              } else {
                paperDiv.innerHTML = `<h4>${titleLink.outerHTML}</h4>`;
              }

              paperDiv.innerHTML += `
            <p><strong>Author(s): </strong> ${authors.join(", ")}</p>
            <p><strong>PMCID:</strong> ${pmcId}</p>
            <p><strong>Date:</strong> ${pmcDate}</p>
            <p><strong>${doi}</strong></p>
            <p class="article">${articleLinks.join(" ")}</p>
          `;

              repoDiv.appendChild(paperDiv);
            });
          }
        }

        //========================================================================================  For bioRxiv =============================================================
        if (repo.title === "bioRxiv") {
          const paperItems = doc.querySelectorAll(
            ".search-result-highwire-citation"
          );
          const topPaperItems = Array.from(paperItems).slice(0, 4);

          if (topPaperItems.length === 0) {
            repoDiv.innerHTML += "<p>No results found.</p>";
          } else {
            topPaperItems.forEach((paperItem) => {
              const paperDiv = document.createElement("div");
              paperDiv.className = "paper";

              const authors = Array.from(
                paperItem.querySelectorAll(".highwire-cite-authors")
              ).map((author) => author.innerText);
              const journal = Array.from(
                paperItem.querySelectorAll(".highwire-cite-metadata-journal")
              ).map((journal) => journal.textContent);
              const bioDate = Array.from(
                paperItem.querySelectorAll(".highwire-cite-metadata-pages")
              ).map((bioDate) => bioDate.textContent);
              const doi = Array.from(
                paperItem.querySelectorAll(".highwire-cite-metadata-doi")
              ).map((doi) => doi.textContent);

              
      
              const dateString = bioDate[0];
              const dateArray = dateString.match(/\d{4}\.\d{2}\.\d{2}/);
              const formattedDate = dateArray ? dateArray[0] : "Date not found";

              // directing to the desired page
              const href = paperItem.querySelector("a").getAttribute("href");
              const titleLink = document.createElement("a");
              titleLink.setAttribute("href", "https://www.biorxiv.org/" + href);
              titleLink.textContent = paperItem.querySelector(
                ".highwire-cite-title"
              ).textContent;

              // Highlight exact title match
              if (titleLink.textContent.toLowerCase() === query.toLowerCase()) {
                paperDiv.innerHTML = `<h4><mark>${titleLink.outerHTML}</mark></h4>`;
              } else {
                paperDiv.innerHTML = `<h4>${titleLink.outerHTML}</h4>`;
              }
              paperDiv.innerHTML += `
            <p><strong>Author(s): </strong> ${authors.join(", ")}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p> <strong>Journal: </strong> ${journal}</p>
            <p> <strong>${doi}</strong></p>
            `;
              repoDiv.appendChild(paperDiv);
            });
          }
        }

        //=============================================================================== medRxiv =============================================================
        if (repo.title === "medRxiv") {
          const paperItems = doc.querySelectorAll(".result-jcode-medrxiv");
          const topPaperItems = Array.from(paperItems).slice(0, 4);

          if (topPaperItems.length === 0) {
            repoDiv.innerHTML += "<p>No results found.</p>";
          } else {
            topPaperItems.forEach((paperItem) => {
              const paperDiv = document.createElement("div");
              paperDiv.className = "paper";

              const authors = Array.from(
                paperItem.querySelectorAll(
                  ".highwire-citation-authors .highwire-citation-author"
                )
              ).map((author) => author.innerText);
              const journal = Array.from(
                paperItem.querySelectorAll(".highwire-cite-metadata-journal")
              ).map((journal) => journal.textContent);
              const medDate = Array.from(
                paperItem.querySelectorAll(".highwire-cite-metadata-pages")
              ).map((medDate) => medDate.textContent);
              const doi = Array.from(
                paperItem.querySelectorAll(".highwire-cite-metadata-doi")
              ).map((doi) => doi.textContent);

              const dateString = medDate[0];
              const dateArray = dateString.match(/\d{4}\.\d{2}\.\d{2}/);
              const formattedDate = dateArray ? dateArray[0] : "Date not found";

              // directing to the desired page
              const href = paperItem.querySelector("a").getAttribute("href");
              const titleLink = document.createElement("a");
              titleLink.setAttribute("href", "https://www.medrxiv.org" + href);
              titleLink.textContent = paperItem.querySelector(
                ".highwire-cite-title"
              ).textContent;

              // Highlight exact title match
              if (titleLink.textContent.toLowerCase() === query.toLowerCase()) {
                paperDiv.innerHTML = `<h4><mark>${titleLink.outerHTML}</mark></h4>`;
              } else {
                paperDiv.innerHTML = `<h4>${titleLink.outerHTML}</h4>`;
              }

              paperDiv.innerHTML += `
            <p><strong>Author(s): </strong> ${authors.join(", ")}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p> <strong>Journal: </strong> ${journal}</p>
            <p> <strong>${doi}</strong></p>
            `;
              repoDiv.appendChild(paperDiv);
            });
          }
        }
        showResult();
        loader.style.display = "none";

      } catch (error) {
        console.error(`Error fetching data from ${repo.title}:`, error);
        repoDiv.innerHTML +=
          "<p>An error occurred while fetching the data.</p>";
      }
    }
  });
