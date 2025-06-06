import { Handler, Context, APIGatewayProxyEvent, Callback } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { bootstrapLambda } from './bootstrap-lambda';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = await bootstrapLambda();
    cachedServer = createServer(expressApp);
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
) => {
  const server = await bootstrap();
  return proxy(server, event, context, 'PROMISE').promise;
};
