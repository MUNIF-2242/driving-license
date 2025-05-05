# 🧾 License Text Extraction API using AWS Textract

This project is an AWS Lambda function that uses **AWS Textract** to extract specific fields from a driving license image stored in an **S3 bucket**. It identifies key details such as name, date of birth, blood group, license number, issue/expiration dates, and father's name from the document using optical character recognition (OCR).

---

## 📦 Features

- Extracts text from documents using AWS Textract
- Parses key fields from driving licenses
- Validates license issue and expiration dates
- Designed for serverless deployment on AWS Lambda

---

## 🛠 Setup Instructions

### 1. Prerequisites

- Node.js 16.x+
- AWS account
- IAM user with permissions for Textract and S3
- An existing S3 bucket with uploaded license images

---

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/aws-textract-license-parser.git
cd aws-textract-license-parser
