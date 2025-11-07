/**
 * storageService:
 * - if S3_ENABLED=true in .env, uploads files to S3
 * - otherwise returns local /uploads path URL
 *
 * Controllers should call storageService.upload(file) and receive back { url, key }
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const S3_ENABLED = process.env.S3_ENABLED === 'true';

let s3Client;
if (S3_ENABLED) {
  const AWS = require('aws-sdk');
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  s3Client = new AWS.S3();
}

async function uploadLocal(file) {
  // file: multer file object
  const url = `/uploads/${file.filename}`;
  return { url, key: file.filename };
}

async function uploadS3(file) {
  const Bucket = process.env.S3_BUCKET;
  const Key = `uploads/${file.filename}`;
  const Body = fs.createReadStream(file.path);
  const ContentType = file.mimetype;

  const params = { Bucket, Key, Body, ContentType, ACL: 'public-read' };
  const res = await s3Client.upload(params).promise();
  return { url: res.Location, key: Key };
}

async function upload(file) {
  if (!file) return null;
  if (S3_ENABLED) return uploadS3(file);
  return uploadLocal(file);
}

async function remove(key) {
  if (!key) return;
  if (S3_ENABLED) {
    const params = { Bucket: process.env.S3_BUCKET, Key: key };
    return s3Client.deleteObject(params).promise();
  } else {
    const p = path.join(process.cwd(), 'uploads', key);
    try { await fs.promises.unlink(p); } catch (e) { /* ignore */ }
  }
}

module.exports = { upload, remove };
