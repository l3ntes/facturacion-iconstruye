import { Handler } from 'aws-lambda';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

const eventBridge = new EventBridgeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const handler: Handler = async (event) => {
  console.log('Received event (DTE.Signed):', JSON.stringify(event, null, 2));

  const detail = event.detail;

  // Simulacion envío a SII
  const sentDetail = {
    ...detail,
    enviadoASii: true,
    siiTimestamp: new Date().toISOString(),
  };

  // Publicar nuevo evento DTE.SentToSII
  const command = new PutEventsCommand({
    Entries: [
      {
        EventBusName:
          process.env.AWS_EVENTBRIDGE_BUS || 'poc-facturacion-iconstruye-bus',
        Source: 'facturacion.iconstruye.dte',
        DetailType: 'DTE.SentToSII',
        Detail: JSON.stringify(sentDetail),
      },
    ],
  });

  const result = await eventBridge.send(command);
  console.log('Published DTE.SentToSII event:', result);

  return { status: 'SENT_TO_SII', detail: sentDetail };
};
