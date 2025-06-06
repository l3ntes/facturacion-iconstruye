import { bootstrapLambda } from './bootstrap-lambda';

export const handler = async (event: any, context: any) => {
  const app = await bootstrapLambda();
  return app.run(event, context);
};
