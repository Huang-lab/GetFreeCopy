document
  .getElementById("search-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const searchInput = document.querySelector('input[name="term"]');
    const q = searchInput.value.trim();

    const from = document.querySelector('input[name="from"]').value;
    const to = document.querySelector('input[name="to"]').value;

    const url = new URL("/api/search", window.location.origin);
    url.searchParams.set("q", q);
    if (from) url.searchParams.set("from", from);
    if (to) url.searchParams.set("to", to);

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    try {
      const res = await fetch(url);
      const data = await res.json();
      displayResults(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      document.getElementById("results").innerHTML = `<p>Error fetching data. Please try again later.</p>`;
    } finally {
      loader.style.display = "none";
    }
  });

function displayResults(data) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  for (const [key, list] of Object.entries(data)) {
    const section = document.createElement("div");
    section.classList.add("section");
    section.innerHTML = `<h2>${key}</h2>`;

    const ul = document.createElement("ul");

    if (!Array.isArray(list) || list.length === 0) { 
      const li = document.createElement("li");
      li.textContent = "No results found.";
      ul.appendChild(li);
    } else {
      list.forEach((item) => {
        const li = document.createElement("li");

        const titleLink = document.createElement("a");
        titleLink.href = item.link || "#";
        titleLink.target = "_blank";
        titleLink.textContent = item.title || "No title";
        titleLink.style.fontWeight = "bold";
        titleLink.style.color = "#007bff";
        titleLink.style.display = "block";

        const authors = document.createElement("div");
        authors.innerHTML = `<strong>Author(s):</strong> ${item.authors || "Unknown"}`;

        const published = document.createElement("div");
        published.innerHTML = `<strong>Published:</strong> ${item.published || "Unknown Date"}`; 

        const summary = document.createElement("p");
        summary.textContent = item.summary || "";

        li.appendChild(titleLink);
        li.appendChild(authors);
        li.appendChild(published);
        li.appendChild(summary);
        ul.appendChild(li);
      });
    }

    section.appendChild(ul);
    container.appendChild(section);
  }
}
