/**
 * storageService:
 * - if S3_ENABLED=true in .env, uploads files to S3
 * - otherwise returns local /uploads path URL
 *
 * Controllers should call storageService.upload(file) and receive back { url, key }
 */

import { createReadStream, promises } from "fs";
import { join } from "path";
import dotenv from 'dotenv';
dotenv.config();

const S3_ENABLED = process.env.S3_ENABLED === "true";

let s3Client;
if (S3_ENABLED) {
  const AWS = require("aws-sdk");
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  s3Client = new AWS.S3();
}

export async function uploadLocal(file) {
  // file: multer file object
  const url = `/uploads/${file.filename}`;
  return { url, key: file.filename };
}

export async function uploadS3(file) {
  const Bucket = process.env.S3_BUCKET;
  const Key = `uploads/${file.filename}`;
  const Body = createReadStream(file.path);
  const ContentType = file.mimetype;

  const params = { Bucket, Key, Body, ContentType, ACL: "public-read" };
  const res = await s3Client.upload(params).promise();
  return { url: res.Location, key: Key };
}

export async function upload(file) {
  if (!file) return null;
  if (S3_ENABLED) return uploadS3(file);
  return uploadLocal(file);
}

export async function remove(key) {
  if (!key) return;
  if (S3_ENABLED) {
    const params = { Bucket: process.env.S3_BUCKET, Key: key };
    return s3Client.deleteObject(params).promise();
  } else {
    const p = join(process.cwd(), "uploads", key);
    try {
      await promises.unlink(p);
    } catch (e) {
      /* ignore */
    }
  }
}
