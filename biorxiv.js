const axios = require("axios");

async function fetchBiorxiv(server = "biorxiv", from, to, cursor = 0) {
    const url = `https://api.biorxiv.org/details/${server}/${from}/${to}/${cursor}`;
    const { data } = await axios.get(url);

    if (!data.collection || !Array.isArray(data.collection)) {
        console.error("Invalid response from bioRxiv API:", data);
        return []; 
    }

    return data.collection.slice(0, 3).map((item) => ({ 
        title: item.title || "No title",
        summary: item.abstract || "",
        authors: item.authors || "Unknown Author(s)",
        link: `https://www.biorxiv.org/content/${item.doi}`, 
        published: item.date ? new Date(item.date).toLocaleDateString() : "Unknown Date",
    }));
}



module.exports = { fetchBiorxiv };