const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); 

module.exports = cache;