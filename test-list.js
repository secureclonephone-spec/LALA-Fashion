const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const R2_ACCOUNT_ID = '44d23cef2e2ff8877438565e123ea974';
const R2_ACCESS_KEY_ID = 'fe24a2f3b576d5fa2badffc11683f426';
const R2_SECRET_ACCESS_KEY = '1eedeb4313fa20f900adf6ff0ecc8b88e8374ea1137992fc4d36b8cfc0d139ac';
const R2_BUCKET_NAME = 'naveed-commerce-images';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listFiles() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
    });
    const result = await s3Client.send(command);
    console.log('Files in bucket:', result.Contents ? result.Contents.length : 0);
    if (result.Contents) {
      result.Contents.forEach(f => console.log('-', f.Key, f.Size, 'bytes'));
    }
  } catch (err) {
    console.error('List failed:', err);
  }
}

listFiles();
