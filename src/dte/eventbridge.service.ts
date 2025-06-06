import { Injectable } from '@nestjs/common';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

@Injectable()
export class EventBridgeService {
  private client = new EventBridgeClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });

  async publishEvent(detailType: string, detail: any) {
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName:
            process.env.AWS_EVENTBRIDGE_BUS || 'poc-facturacion-iconstruye-bus',
          Source: 'facturacion.iconstruye.dte',
          DetailType: detailType,
          Detail: JSON.stringify(detail),
        },
      ],
    });

    const result = await this.client.send(command);
    console.log('EventBridge publish result:', result);
    return result;
  }
}
