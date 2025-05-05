const {
  TextractClient,
  DetectDocumentTextCommand,
} = require("@aws-sdk/client-textract");
require("dotenv").config();

// Configure AWS Textract client
const textractClient = new TextractClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.YOUR_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.YOUR_AWS_SECRET_ACCESS_KEY,
  },
});

exports.handler = async (event) => {
  try {
    console.log("Event received:", JSON.stringify(event));

    const { fileName } =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || event;

    if (!fileName) {
      return {
        statusCode: 400,
        status: "error",
        message: "No file name provided.",
      };
    }

    const params = {
      Document: {
        S3Object: {
          Bucket: process.env.YOUR_S3_BUCKET_NAME,
          Name: fileName,
        },
      },
    };

    console.log("Calling AWS Textract with params:", params);
    const command = new DetectDocumentTextCommand(params);
    const textractData = await textractClient.send(command);

    const blocks = textractData.Blocks || [];
    const lineBlocks = blocks.filter((block) => block.BlockType === "LINE");

    // Fields to extract
    let licenseNo = null;
    let licenseHolderName = null;
    let licenseIssueDate = null;
    let dateOfBirth = null;
    let licenseExpirationDate = null;
    let bloodGroup = null;
    let fatherName = null;

    for (let i = 0; i < lineBlocks.length; i++) {
      const text = lineBlocks[i].Text.trim().toLowerCase();

      switch (true) {
        case text.includes("name"):
          licenseHolderName = lineBlocks[i + 1]?.Text.trim();
          break;
        case text.includes("birth"):
          dateOfBirth = lineBlocks[i + 1]?.Text.trim();
          break;
        case text.includes("group"):
          bloodGroup = lineBlocks[i + 1]?.Text.trim();
          break;
        case text.includes("father"):
          fatherName = lineBlocks[i + 1]?.Text.trim();
          break;
        case text.includes("authority"):
          licenseNo = lineBlocks[i + 1]?.Text.trim().substring(0, 16);
          break;
        case text.includes("validity"):
          licenseIssueDate = lineBlocks[i + 1]?.Text.trim();
          break;
        case text.includes("licence no"):
          licenseExpirationDate = lineBlocks[i - 1]?.Text.trim();
          break;
      }
    }

    const allExtracted =
      licenseHolderName &&
      licenseIssueDate &&
      dateOfBirth &&
      licenseExpirationDate &&
      bloodGroup &&
      fatherName;

    let dateValid = false;
    if (licenseIssueDate && licenseExpirationDate) {
      const today = new Date();
      const issueDate = new Date(licenseIssueDate);
      const expirationDate = new Date(licenseExpirationDate);
      if (issueDate <= today && expirationDate >= today) {
        dateValid = true;
      }
    }
    return {
      statusCode: 200,
      status: allExtracted && dateValid ? "success" : "fail",
      licenseData: {
        licenseHolderName,
        dateOfBirth,
        bloodGroup,
        fatherName,
        licenseIssueDate,
        licenseExpirationDate,
        licenseNo,
        isLicenseDateValid: dateValid,
      },
    };
  } catch (error) {
    console.error("Error during Textract processing:", error);
    return {
      statusCode: 500,
      status: "error",
      message: "An error occurred while detecting text.",
    };
  }
};
