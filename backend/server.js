const express = require("express");
const cors = require("cors");
const algosdk = require("algosdk");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json());

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Initialize Algorand client (LocalNet configuration)
const algodToken = "a".repeat(64);
const algodServer = "http://localhost";
const algodPort = 4001;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Smart Contract App ID (replace with your actual deployed ID, e.g., 1005)
const APP_ID = parseInt(process.env.APP_ID || "1005", 10);

app.post("/access-data", async (req, res) => {
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