# POC - Facturación IConstruye

## Descripción

Este proyecto corresponde a la prueba técnica de POC para IConstruye.

Se construyó una arquitectura basada en eventos, utilizando:

- NestJS (TypeScript)
- AWS CDK (Infraestructura como código)
- AWS Lambda (Microservicios serverless)
- AWS API Gateway (HTTP API)
- AWS S3 (para almacenamiento de archivos)
- AWS DynamoDB (persistencia de estados de DTEs)
- AWS EventBridge (eventos internos)
- AWS Route 53 + ACM (dominio custom + HTTPS)
- Seguridad basada en JWT
- Pruebas unitarias con Jest
- Documentación con Swagger

## Estructura del proyecto

facturacion-iconstruye/
├── src/
│ ├── app.module.ts
│ ├── auth/
│ ├── dte/
├── lambda/
│ ├── emit-dte.handler.ts
│ ├── status-dte.handler.ts
│ ├── bootstrap-lambda.ts
├── infra/ (AWS CDK Stack)
├── README.md

## Endpoints disponibles

| Método | Endpoint | Seguridad |
|--------|----------|-----------|
| POST | `/emit` | JWT |
| GET | `/status/:folio` | JWT |
| GET | `/api-docs` | Público |

## Dominio API

```text
https://api.poc-facturacion-iconstruye.com
```

# Instalar dependencias
```yarn install```

# Compilar el proyecto
```yarn build```

# Ejecutar pruebas unitarias
```yarn test --coverage```

# Levantar en local
```yarn start:dev```

# Desplegar infraestructura

```cd infra
yarn install
yarn build
cdk synth
cdk deploy
```
# Seguridad JWT

Authorization: Bearer <JWT>

# Documentación - Swagger

``[Swagger - POC Facturacion iConstruye](https://api.poc-facturacion-iconstruye.com/api-docs)```
