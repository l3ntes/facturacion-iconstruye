import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService {
  private client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });
  private docClient = DynamoDBDocumentClient.from(this.client);

  async saveDte(folio: string, data: any) {
    const tableName = process.env.DYNAMODB_TABLE_NAME || 'DTEs';

    const command = new PutCommand({
      TableName: tableName,
      Item: {
        folio: folio,
        status: 'Procesado',
        data: data,
        timestamp: new Date().toISOString(),
      },
    });

    const result = await this.docClient.send(command);
    console.log('DynamoDB save result:', result);
    return result;
  }

  async getDte(folio: string) {
    const tableName = process.env.DYNAMODB_TABLE_NAME || 'DTEs';

    const command = new GetCommand({
      TableName: tableName,
      Key: { folio: folio },
    });

    const result = await this.docClient.send(command);
    console.log('DynamoDB get result:', result);
    return result.Item;
  }
}
