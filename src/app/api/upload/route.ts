import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = '44d23cef2e2ff8877438565e123ea974';
const R2_ACCESS_KEY_ID = 'fe24a2f3b576d5fa2badffc11683f426';
const R2_SECRET_ACCESS_KEY = '1eedeb4313fa20f900adf6ff0ecc8b88e8374ea1137992fc4d36b8cfc0d139ac';
const R2_BUCKET_NAME = 'naveed-commerce-images';

// Ensure required variables are present
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error('R2 credentials are not configured');
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Use the correctly provided Public R2.dev bucket domain URL
    const publicUrl = `https://pub-f80746b3e2fd42f88d73de5777c6f77f.r2.dev/${filePath}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('API /upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
