#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FacturacionIconstruyeStack } from '../lib/facturacion-iconstruye-stack';

const app = new cdk.App();

new FacturacionIconstruyeStack(app, 'FacturacionIconstruyeStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
