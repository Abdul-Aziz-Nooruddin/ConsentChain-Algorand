const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let consentGiven = false;
let earnings = 0;

// Give Consent
app.post("/give-consent", (req, res) => {
  consentGiven = true;
  res.json({ message: "Consent given" });
});

// Pause Consent
app.post("/pause-consent", (req, res) => {
  consentGiven = false;
  res.json({ message: "Consent paused" });
});

// Revoke Consent
app.post("/revoke-consent", (req, res) => {
  consentGiven = false;
  earnings = 0;
  res.json({ message: "Consent revoked & earnings reset" });
});

// Company Access
app.post("/access-data", (req, res) => {
  if (!consentGiven) {
    return res.json({ message: "No consent from user" });
  }

  earnings += 10; // simulate payment
  res.json({ message: "Data accessed, user earned ₹10", earnings });
});

// Get status
app.get("/status", (req, res) => {
  res.json({ consentGiven, earnings });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});