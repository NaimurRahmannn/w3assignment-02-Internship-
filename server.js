const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const envFilePath = path.join(__dirname, ".env");

function readEnvValue(key) {
  if (!fs.existsSync(envFilePath)) {
    return "";
  }

  const lines = fs.readFileSync(envFilePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const envKey = trimmed.slice(0, separatorIndex).trim();
    if (envKey !== key) {
      continue;
    }
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }

  return "";
}

function getMapsApiKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env["Google Maps API Key"] ||
    readEnvValue("GOOGLE_MAPS_API_KEY") ||
    readEnvValue("Google Maps API Key") ||
    ""
  );
}
//maps config endpoint to provide API key to client
app.get("/maps-config.js", (req, res) => {
  
  const expose = String(process.env.EXPOSE_MAPS_KEY || "").toLowerCase() === "true";
  const apiKey = expose ? getMapsApiKey() : "";
  res.type("application/javascript");
  res.send(`window.GOOGLE_MAPS_API_KEY=${JSON.stringify(apiKey)};`);
});

function readJson(filename) {
  const filePath = path.join(__dirname, "data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

app.get("/get-property", (req, res) => {
  try {
    let dataset = "most_popular.json";

    if (req.query["highest-price"] === "true") {
      dataset = "highest_price.json";
    } else if (req.query["lowest-price"] === "true") {
      dataset = "lowest_price.json";
    } else if (req.query["most-popular"] === "true") {
      dataset = "most_popular.json";
    }

    const jsonData = readJson(dataset);

    let properties = jsonData.Result.Items;

    const limit = Number(req.query.limit);

    if (!Number.isNaN(limit) && limit > 0) {
      properties = properties.slice(0, limit);
    }

    res.json(properties);
  } catch (error) {
    console.error("GET /get-property error:", error);

    res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
});

app.get("/images", (req, res) => {
  const imagesDir = path.join(__dirname, "public", "images");

  const images = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map((file) => `/images/${file}`);

  res.json(images);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});