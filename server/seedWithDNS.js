/**
 * Seed wrapper that forces Google DNS (8.8.8.8) to bypass
 * ISP DNS issues with MongoDB Atlas SRV resolution.
 */
const dns = require("dns");

// Force Google DNS before any connections
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Now run the actual seed script
require("./seedERP.js");
