import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';
import * as path from 'path';

// Lambda
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaRuntime from 'aws-cdk-lib/aws-lambda';

// API Gateway
import * as apigateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

// DynamoDB
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// S3
import * as s3 from 'aws-cdk-lib/aws-s3';

// EventBridge y CloudWatch
import * as events from 'aws-cdk-lib/aws-events';
import * as logs from 'aws-cdk-lib/aws-logs';

// Route 53
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';

// Infraestructura IaC
export class FacturacionIconstruyeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // EventBridge: Event Bus personalizado
    const eventBus = new events.EventBus(this, 'DteEventBus', {
      eventBusName: 'poc-facturacion-iconstruye-bus',
    });

    // Lambda: emit DTE Handler
    const emitDteLambda = new lambda.NodejsFunction(this, 'EmitDteLambda', {
      entry: path.resolve(__dirname, '../../lambda/emit-dte.handler.ts'),
      handler: 'handler',
      runtime: lambdaRuntime.Runtime.NODEJS_20_X,
      projectRoot: path.resolve(__dirname, '../../'),
      bundling: {
        forceDockerBundling: false,
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/websockets',
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
        ],
      },
      environment: {
        NODE_ENV: 'production',
        JWT_SECRET: 'changeme', // TODO: despues sacarlo desde SSM / Secrets Manager
        DYNAMODB_TABLE_NAME: 'DTEs',
        S3_BUCKET_NAME: 'poc-facturacion-iconstruye',
        EVENT_BUS_NAME: 'poc-facturacion-iconstruye-bus',
      },
    });

    // Lambda: status DTE Handler
    const statusDteLambda = new lambda.NodejsFunction(this, 'StatusDteLambda', {
      entry: path.resolve(__dirname, '../../lambda/status-dte.handler.ts'),
      handler: 'handler',
      runtime: lambdaRuntime.Runtime.NODEJS_20_X,
      projectRoot: path.resolve(__dirname, '../../'),
      bundling: {
        forceDockerBundling: false,
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/websockets',
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
        ],
      },
      environment: {
        NODE_ENV: 'production',
        JWT_SECRET: 'changeme',
        DYNAMODB_TABLE_NAME: 'DTEs',
        S3_BUCKET_NAME: 'poc-facturacion-iconstruye',
        EVENT_BUS_NAME: 'poc-facturacion-iconstruye-bus',
      },
    });

    // Lambda: firma DTE Handler
    const firmaDteLambda = new lambda.NodejsFunction(this, 'FirmaDteLambda', {
      entry: path.resolve(__dirname, '../../lambda/firma-dte.handler.ts'),
      handler: 'handler',
      runtime: lambdaRuntime.Runtime.NODEJS_20_X,
      projectRoot: path.resolve(__dirname, '../../'),
      bundling: {
        forceDockerBundling: false,
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/websockets',
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
          '@aws-sdk/client-eventbridge',
        ],
      },
      environment: {
        AWS_EVENTBRIDGE_BUS: eventBus.eventBusName,
        AWS_REGION: 'us-east-1',
      },
    });

    // Lambda: Envio a SII DTE Handler
    const envioSiiLambda = new lambda.NodejsFunction(this, 'EnvioSiiLambda', {
      entry: path.resolve(__dirname, '../../lambda/envio-sii.handler.ts'),
      handler: 'handler',
      runtime: lambdaRuntime.Runtime.NODEJS_20_X,
      projectRoot: path.resolve(__dirname, '../../'),
      bundling: {
        forceDockerBundling: false,
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/websockets',
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
          '@aws-sdk/client-eventbridge',
        ],
      },
      environment: {
        AWS_EVENTBRIDGE_BUS: eventBus.eventBusName,
        AWS_REGION: 'us-east-1',
      },
    });

    // DynamoDB: Tabla DTEs
    const dteTable = new dynamodb.Table(this, 'DteTable', {
      partitionKey: { name: 'folio', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: 'DTEs',
      removalPolicy: RemovalPolicy.DESTROY, // TODO: en prod, en prod usar RETAIN
    });

    // S3: Bucket para almacenar XML de DTEs
    const dteBucket = new s3.Bucket(this, 'DteBucket', {
      bucketName: 'poc-facturacion-iconstruye',
      removalPolicy: RemovalPolicy.DESTROY, // TODO: en prod, en prod usar RETAIN
      autoDeleteObjects: true,
    });

    // CloudWatch: LogGroup
    const eventLogGroup = new logs.LogGroup(this, 'DteEventLogGroup', {
      logGroupName: '/aws/events/DTEEmitted',
      retention: logs.RetentionDays.ONE_WEEK,
    });

    // Asocia el LogGroup al EventBus
    const eventRule = new events.Rule(this, 'DteEmittedRule', {
      eventBus: eventBus,
      eventPattern: {
        source: ['facturacion.iconstruye.dte'],
        detailType: ['DTE.Emitted'],
      },
    });

    eventRule.addTarget(new targets.CloudWatchLogGroup(eventLogGroup));

    // Regla para activar lambda de firma
    const firmaRule = new events.Rule(this, 'DteEmittedToFirmaRule', {
      eventBus: eventBus,
      eventPattern: {
        source: ['facturacion.iconstruye.dte'],
        detailType: ['DTE.Emitted'],
      },
    });

    firmaRule.addTarget(new targets.LambdaFunction(firmaDteLambda));

    // Regla para activar lambda de envio a SII
    const envioSiiRule = new events.Rule(this, 'DteSignedToEnvioSiiRule', {
      eventBus: eventBus,
      eventPattern: {
        source: ['facturacion.iconstruye.dte'],
        detailType: ['DTE.Signed'],
      },
    });

    envioSiiRule.addTarget(new targets.LambdaFunction(envioSiiLambda));

    // Route53, configuración de dominio
    const hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: 'poc-facturacion-iconstruye.com',
    });

    // ACM Certificate y validacion de DNS
    const certificate = new certificatemanager.Certificate(
      this,
      'ApiCertificate',
      {
        domainName: 'api.poc-facturacion-iconstruye.com',
        validation:
          certificatemanager.CertificateValidation.fromDns(hostedZone),
      },
    );

    // Crea el dominio Custom en el Api Gateway
    const domainName = new apigatewayv2.DomainName(this, 'ApiDomainName', {
      domainName: 'api.poc-facturacion-iconstruye.com',
      certificate: certificate,
    });

    // Route53 y registro A
    new route53.ARecord(this, 'ApiAliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId,
        ),
      ),
      recordName: 'api',
    });

    // API Gateway REST
    const api = new apigateway.HttpApi(this, 'FacturacionIconstruyeApi', {
      apiName: 'facturacion-iconstruye-api',
      defaultDomainMapping: {
        domainName: domainName,
      },
    });

    // Integración API Gateway y Lambdas
    api.addRoutes({
      path: '/emit',
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        'EmitIntegration',
        emitDteLambda,
      ),
    });

    api.addRoutes({
      path: '/status/{folio}',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        'StatusIntegration',
        statusDteLambda,
      ),
    });

    // TODO: Solo para no perderme, aca puedo añadir mas infra

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url ?? 'Something went wrong with the deploy',
    });

    new cdk.CfnOutput(this, 'DteTableName', {
      value: dteTable.tableName,
    });

    new cdk.CfnOutput(this, 'DteBucketName', {
      value: dteBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
    });
  }
}
