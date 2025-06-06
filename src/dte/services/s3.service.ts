import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
  });

  async uploadDteFile(folio: string, data: any) {
    const bucketName =
      process.env.S3_BUCKET_NAME || 'poc-facturacion-iconstruye';
    const key = `dtes/${folio}.json`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });

    const result = await this.client.send(command);
    console.log('S3 upload result:', result);
    return result;
  }
}
