const mongoose = require("mongoose");
const dns = require("dns");

/**
 * Force MongoDB's SRV/TXT lookups through reliable public DNS resolvers.
 *
 * `mongodb+srv://` connection strings require a DNS SRV lookup on every
 * connection. Some ISP/router DNS resolvers handle these poorly and time out
 * (queryTxt/querySrv ETIMEOUT), which makes the whole app appear to have lost
 * its data. Prepending Google + Cloudflare DNS in front of the OS resolvers
 * fixes this without changing the connection string.
 */
function usePublicDns() {
  try {
    const publicDns = ["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"];
    const existing = dns.getServers().filter((s) => !publicDns.includes(s));
    dns.setServers([...publicDns, ...existing]);
  } catch (err) {
    // Non-fatal: fall back to the default resolver.
    console.warn("Could not set custom DNS servers:", err.message);
  }
}

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 30000, // wait up to 30s for a reachable node
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
};

async function connectWithRetry(attempt = 1) {
  const MAX_ATTEMPTS = 5;
  try {
    await mongoose.connect(process.env.MONGODB_URI, CONNECT_OPTIONS);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(
      `MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
      err.message
    );
    if (attempt >= MAX_ATTEMPTS) throw err;
    const delay = Math.min(2000 * attempt, 10000); // linear backoff, capped at 10s
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectWithRetry(attempt + 1);
  }
}

async function connectDB() {
  usePublicDns();

  // Log drops/recoveries so a transient DNS/network blip is visible and not
  // mistaken for data loss. Mongoose auto-reconnects on its own.
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected — attempting to reconnect…");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  await connectWithRetry();
}

module.exports = connectDB;
