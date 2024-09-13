const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const fs = require("fs").promises;
const Papa = require("papaparse");

const convertToCSV = async (data, outputFilePath) => {
  try {
    const csv = Papa.unparse(data);
    await fs.writeFile(outputFilePath, csv);
    console.log(`CSV file has been written to ${outputFilePath}`);
  } catch (err) {
    console.error("Error writing CSV file:", err);
  }
};

const parseCSV = (data) => {
  return new Promise((resolve, reject) => {
    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
};

const parseFileAsync = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const parsedData = await parseCSV(data);
    return parsedData;
  } catch (err) {
    console.error("Error:", err);
  }
};

app.post("/", async (req, res) => {
  const { Code, NewName } = req.body;
  console.log(Code, NewName);
  const data = await parseFileAsync("currency.csv");
  const updatedData = data.map((item) => {
    if (item.Code === Code) {
      return {
        Code: item.Code,
        Symbol: item.Symbol,
        Name: NewName,
      };
    } else {
      return item;
    }
  });
  convertToCSV(updatedData, "currency.csv");
  res.send(updatedData);
});

app.get("/", async (req, res) => {
  const data = await parseFileAsync("currency.csv");
  res.send(data);
});

app.listen(3002, () => {
  console.log(`Example app listening on port ${port}`);
});
