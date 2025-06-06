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

``[Swagger - POC Facturacion iConstruye](https://api.poc-facturacion-iconstruye.com/swagger)```

NOTA: En esta arquitectura (Lambda + API Gateway HttpApi), Swagger UI no se sirve correctamente por limitaciones conocidas de aws-serverless-express + HttpApi V2. 

En producción, la recomendación es servir Swagger UI desde S3 + CloudFront o desde un backend dedicado, lo cual no será abordado en este POC ya que para efectos del mismo, el swagger local funciona correctamente.


## EventBridge - Arquitectura basada en eventos

Este POC implementa un flujo basado en eventos:

- Cuando se emite un DTE (`POST /emit`), se publica un evento en **EventBridge**:

  - Bus: `poc-facturacion-iconstruye-bus`
  - Source: `facturacion.iconstruye.dte`
  - DetailType: `DTE.Emitted`

- El evento es capturado por una regla de EventBridge, que lo publica en **CloudWatch Logs**.

### Monitoreo de eventos

Puedes visualizar los eventos en: CloudWatch → Logs → Log groups → /aws/events/DTEEmitted

## Flujo de negocio completo - POC Facturación IConstruye

### 1️⃣ POST `/emit`

Cuando se realiza un `POST /emit`, el flujo es:

1️⃣ Se genera un `folio` para el DTE  
2️⃣ El DTE es guardado como archivo JSON en S3:

```text
Bucket: poc-facturacion-iconstruye
Key: dtes/<folio>.json
```

### 2️⃣ GET ``/status/:folio``

1️⃣ Se consulta DynamoDB (tabla DTEs)
2️⃣ Si el folio existe → devuelve su estado y timestamp
3️⃣ Si no existe → devuelve status "No encontrado"

# POC - Facturación IConstruye - LICENSE

---

**Aviso legal:**  
Este proyecto es propiedad intelectual de Jorge Molina.  
Su uso, reproducción, modificación o distribución en entornos de producción o con fines comerciales por parte de terceros (incluyendo pero no limitado a la empresa IConstruye) está estrictamente prohibido sin la autorización expresa y por escrito del autor.

---