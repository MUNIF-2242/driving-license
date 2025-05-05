# Driving License Data Extractor

This AWS Lambda function utilizes Amazon Textract to extract key information from Bangladeshi driving license documents stored in Amazon S3. It identifies and retrieves fields such as:

- License Holder Name
- Date of Birth
- Blood Group
- Father's Name
- License Issue Date
- License Expiration Date
- License Number
- License Validity Status

---

## 🧩 Features

- Accepts a JSON payload with an S3 file name.
- Utilizes Amazon Textract to extract text from the specified document.
- Parses and identifies relevant fields from the extracted text.
- Determines the validity of the license based on issue and expiration dates.
- Returns a structured JSON response containing the extracted data and validity status.

---

## ⚙️ Prerequisites

- Node.js 18.x or later
- An AWS Account with:
  - An S3 bucket containing driving license images or PDFs
  - IAM permissions for Textract and S3
- Lambda function configured with necessary environment variables

---

## 🔐 Environment Variables

Set the following environment variables for your Lambda function:

| Variable Name               | Description                 |
|-----------------------------|-----------------------------|
| `YOUR_AWS_ACCESS_KEY_ID`    | AWS access key              |
| `YOUR_AWS_SECRET_ACCESS_KEY`| AWS secret access key       |
| `YOUR_S3_BUCKET_NAME`       | Name of your S3 bucket      |

*Note: These can be configured in Lambda environment variables or via a `.env` file for local development.*

---

## 📤 Request Payload Format

Send a POST request with the following JSON body:

```json
{
  "fileName": "your-document.pdf"
}
