const crypto = require("crypto");
const axios = require("axios");
const API_URL = "http://localhost:3000/device/real/query";
const TOKEN = "interview_token_123";


function generateSignature(url, token, timestamp) {
  const rawString = url + token + timestamp;

  const signature = crypto
    .createHash("md5")
    .update(rawString)
    .digest("hex");

  return signature;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateSerialNumbers() {
  const serialNumbers = [];

  for (let i = 0; i < 500; i++) {
    const sn = "SN-" + String(i).padStart(3, "0");
    serialNumbers.push(sn);
  }

  return serialNumbers;
}

function createBatches(serialNumbers) {
  const batches = [];

  for (let i = 0; i < serialNumbers.length; i += 10) {
    const batch = serialNumbers.slice(i, i + 10);
    batches.push(batch);
  }

  return batches;
}

const serials = generateSerialNumbers();
const batches = createBatches(serials);

console.log("Total batches:", batches.length);
console.log("First batch:", batches[0]);
console.log("Last batch:", batches[batches.length - 1]);

const testTimestamp = Date.now().toString();
const testSignature = generateSignature(
  "/device/real/query",
  "interview_token_123",
  testTimestamp
);

console.log("Timestamp:", testTimestamp);
console.log("Signature:", testSignature);
