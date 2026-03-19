const express = require("express");
const cors = require("cors");
const algosdk = require("algosdk");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const app = express();

// 1. Basic Security Headers (XSS, CSP, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Add trusted external script domains here
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://algorand.com"],
      connectSrc: ["'self'", "http://localhost:4001", "https://*.algorand.network"], // Algorand nodes
      upgradeInsecureRequests: [],
    },
  },
}));

// 2. CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "CSRF-Token"],
}));

app.use(express.json({ limit: "10kb" })); // Body limit for protection
app.use(cookieParser());

// 3. Rate Limiting (Hard limit)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use(limiter);

// 4. Throttling (Slow down requests after 50 in 15 mins)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => hits * 500, // Incrementally slow down
});
app.use(speedLimiter);

// 5. CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Initialize Algorand client (Testnet)
const algodToken = process.env.ALGOD_TOKEN || "";
const algodServer = process.env.ALGOD_SERVER || "https://testnet-api.algonode.cloud";
const algodPort = process.env.ALGOD_PORT || 443;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Smart Contract App ID - Deployed to Testnet
const APP_ID = parseInt(process.env.APP_ID || "757371604", 10);

// Example secure endpoint with CSRF protection
app.post("/access-data", csrfProtection, async (req, res) => {
  const { userAddress, companyAddress } = req.body;

  if (!userAddress || !companyAddress) {
    return res.status(400).json({ error: "Missing userAddress or companyAddress" });
  }

  try {
    // Determine the Box Map key.
    // In Algorand Typescript we used BoxMap<readonly [Account, Account], uint64>({ keyPrefix: 'c' })
    // The key is: "c" + decodeAddress(user) + decodeAddress(company)
    const prefixBytes = new Uint8Array(Buffer.from("c", "utf8"));
    const userBytes = algosdk.decodeAddress(userAddress).publicKey;
    const companyBytes = algosdk.decodeAddress(companyAddress).publicKey;
    
    // Concatenate the pieces
    const boxKey = new Uint8Array(prefixBytes.length + userBytes.length + companyBytes.length);
    boxKey.set(prefixBytes);
    boxKey.set(userBytes, prefixBytes.length);
    boxKey.set(companyBytes, prefixBytes.length + userBytes.length);

    console.log(`Checking consent for User: ${userAddress} -> Company: ${companyAddress}`);

    let boxResponse;
    try {
      boxResponse = await algodClient.getApplicationBoxByName(APP_ID, boxKey).do();
    } catch (e) {
      if (e?.response?.status === 404) {
        return res.status(403).json({ error: "No consent found on the blockchain." });
      }
      throw e;
    }

    // The value is a uint64 (8 bytes). We only care if it's 1 (GIVEN)
    const value = algosdk.decodeUint64(boxResponse.value, "safe");

    if (value === 1n || value === 1) {
      return res.json({ 
        message: "Access granted! Here is the user's data.", 
        data: { creditScore: 780, healthStatus: "Healthy" },
        status: "GIVEN"
      });
    } else if (value === 2n || value === 2) {
      return res.status(403).json({ error: "Consent is currently PAUSED." });
    } else {
      return res.status(403).json({ error: "Consent is REVOKED or invalid." });
    }

  } catch (error) {
    console.error("Error reading blockchain:", error);
    res.status(500).json({ error: "Failed to read Algorand blockchain." });
  }
});

app.listen(5000, () => {
  console.log(`Backend running on http://localhost:5000 (Monitoring App ID: ${APP_ID})`);
});