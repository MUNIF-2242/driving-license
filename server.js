const express = require("express");
const {
  TextractClient,
  DetectDocumentTextCommand,
} = require("@aws-sdk/client-textract");

require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json({ limit: "50mb" }));

// Configure AWS Textract Client
const textractClient = new TextractClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.YOUR_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.YOUR_AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/extractLicenseInfo", async (req, res) => {
  console.log("Endpoint /extractLicenseInfo was hit.");

  const { fileName } = req.body;

  if (!fileName) {
    console.log("No fileName provided.");
    return res.status(400).send("No file name provided.");
  }

  const params = {
    Document: {
      S3Object: {
        Bucket: process.env.YOUR_S3_BUCKET_NAME,
        Name: fileName,
      },
    },
  };

  try {
    console.log("Calling Textract to detect text...");

    const command = new DetectDocumentTextCommand(params);
    const textractData = await textractClient.send(command);
    const jsonData = textractData.Blocks;

    const lineBlocks = jsonData.filter((block) => block.BlockType === "LINE");

    let success = false;

    let licenseNo = null;
    let licenseHolderName = null;
    let licenseIssueDate = null;
    let dateOfBirth = null;
    let licenseExpirationDate = null;
    let bloodGroup = null;
    let fatherName = null;

    for (let i = 0; i < lineBlocks.length; i++) {
      const block = lineBlocks[i];
      const text = block.Text.trim().toLowerCase();

      switch (true) {
        case text.includes("name"):
          if (i + 1 < lineBlocks.length) {
            licenseHolderName = lineBlocks[i + 1].Text.trim();
            console.log("Found licenseHolderName", licenseHolderName);
          }
          break;

        case text.includes("birth"):
          if (i + 1 < lineBlocks.length) {
            dateOfBirth = lineBlocks[i + 1].Text.trim();
            console.log("Found dateOfBirth", dateOfBirth);
          }
          break;

        case text.includes("group"):
          if (i + 1 < lineBlocks.length) {
            bloodGroup = lineBlocks[i + 1].Text.trim();
            console.log("Found bloodGroup", bloodGroup);
          }
          break;

        case text.includes("father"):
          if (i + 1 < lineBlocks.length) {
            fatherName = lineBlocks[i + 1].Text.trim();
            console.log("Found fatherName", fatherName);
          }
          break;

        case text.includes("authority"):
          if (i + 1 < lineBlocks.length) {
            licenseNo = lineBlocks[i + 1].Text.trim().substring(0, 16);
            console.log("Found licenseNo", licenseNo);
          }
          break;

        case text.includes("validity"):
          if (i + 1 < lineBlocks.length) {
            licenseIssueDate = lineBlocks[i + 1].Text.trim();
            console.log("Found licenseIssueDate", licenseIssueDate);
          }

          break;

        case text.includes("licence no"):
          if (i - 1 < lineBlocks.length) {
            licenseExpirationDate = lineBlocks[i - 1].Text.trim();
            console.log("Found licenseExpirationDate", licenseExpirationDate);
          }
          break;
      }
    }

    // Check if all required fields are present
    const allExtracted =
      licenseHolderName &&
      licenseIssueDate &&
      dateOfBirth &&
      licenseExpirationDate &&
      bloodGroup &&
      fatherName;

    // Validate issue and expiration dates
    let dateValid = false;
    if (licenseIssueDate && licenseExpirationDate) {
      const today = new Date();
      const issueDate = new Date(licenseIssueDate);
      const expirationDate = new Date(licenseExpirationDate);

      if (issueDate <= today && expirationDate >= today) {
        dateValid = true;
        console.log("Found isLicenseDateValid: ", dateValid);
      } else {
        console.log("❌ Date validation failed:");
      }
    }

    success = allExtracted && dateValid;

    res.json({
      status: success ? "success" : "fail",
      licenseData: {
        licenseHolderName: licenseHolderName,
        dateOfBirth: dateOfBirth,
        bloodGroup: bloodGroup,
        fatherName: fatherName,
        licenseIssueDate: licenseIssueDate,
        licenseExpirationDate: licenseExpirationDate,
        licenseNo: licenseNo,
        isLicenseDateValid: dateValid,
      },
    });
  } catch (error) {
    console.error("Error occurred while detecting text:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while detecting text.",
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
