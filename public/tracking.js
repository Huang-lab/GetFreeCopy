// Function to track searches
const button = document.getElementById("button");

button.addEventListener("submit", (event) => {
  event.preventDefault();
  // Function to track searches
  function trackSearch() {
    const searchQuery = document.getElementById("search-input").value;
    // Send the search query to the server
    fetch(`/search?q=${searchQuery}`, {
      method: "GET",
    });
  }
   trackSearch()
});
