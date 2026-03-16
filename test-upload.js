const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

async function testUpload() {
  try {
    const buffer = Buffer.from('hello world');
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: 'test.txt',
      Body: buffer,
      ContentType: 'text/plain',
    });
    
    console.log('Sending command...');
    const result = await s3Client.send(command);
    console.log('Upload successful!', result);
  } catch (err) {
    console.error('Upload failed:');
    console.error(err);
  }
}

testUpload();
