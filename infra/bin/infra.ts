#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FacturacionIconstruyeStack } from '../lib/facturacion-iconstruye-stack';

const app = new cdk.App();

new FacturacionIconstruyeStack(app, 'FacturacionIconstruyeStack', {
  /* env: { account: '123456789012', region: 'us-east-1' }, */
});
