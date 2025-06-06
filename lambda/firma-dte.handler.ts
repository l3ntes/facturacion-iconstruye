import { Handler } from 'aws-lambda';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

const eventBridge = new EventBridgeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const handler: Handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const detail = event.detail;

  // Simulacion de firma digital
  const signedDetail = {
    ...detail,
    firmado: true,
    firmadoTimestamp: new Date().toISOString(),
  };

  const command = new PutEventsCommand({
    Entries: [
      {
        EventBusName:
          process.env.AWS_EVENTBRIDGE_BUS || 'poc-facturacion-iconstruye-bus',
        Source: 'facturacion.iconstruye.dte',
        DetailType: 'DTE.Signed',
        Detail: JSON.stringify(signedDetail),
      },
    ],
  });

  const result = await eventBridge.send(command);
  console.log('Published DTE.Signed event:', result);

  return { status: 'SIGNED', detail: signedDetail };
};
