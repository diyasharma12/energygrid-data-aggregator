const crypto = require("crypto");
const axios = require("axios");
const API_URL = "http://localhost:3000/device/real/query";
const TOKEN = "interview_token_123";
const REQUEST_INTERVAL_MS = 1000;


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
async function fetchBatch(snList) {
  const timestamp = Date.now().toString();
  const signature = generateSignature(
    "/device/real/query",
    TOKEN,
    timestamp
  );

  const response = await axios.post(
    API_URL,
    { sn_list: snList },
    {
      headers: {
        timestamp: timestamp,
        signature: signature
      }
    }
  );

  return response.data.data;
}

async function fetchBatchWithRetry(snList, retries = 3) {
  try {
    return await fetchBatch(snList);
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    console.log("⚠️ Error occurred. Retrying...");
    await sleep(2000);
    return fetchBatchWithRetry(snList, retries - 1);
  }
}

async function main() {
  console.log("🚀 EnergyGrid Data Aggregator Started");

  const serialNumbers = generateSerialNumbers();
  const batches = createBatches(serialNumbers);

  const allResults = [];

  for (let i = 0; i < batches.length; i++) {
    console.log(`📡 Processing batch ${i + 1} / ${batches.length}`);

    const batchData = await fetchBatchWithRetry(batches[i]);
    allResults.push(...batchData);

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log("✅ All batches processed successfully");
  console.log(`📊 Total devices fetched: ${allResults.length}`);
}

main().catch(error => {
  console.error("❌ Fatal error:", error.message);
});
