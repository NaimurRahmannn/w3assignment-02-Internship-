const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

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