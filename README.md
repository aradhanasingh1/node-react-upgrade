# Microservices Demo Application

A React + Next.js + Node.js application demonstrating microservices architecture with in-memory data storage.

## Architecture Overview

This application showcases a microservices architecture using:

- **Next.js** for routing only
- **React** for UI components  
- **Node.js** microservices with various integrations
- **In-memory data storage** (no database required)

## Microservices Included

### 1. SOAP Service (Port 3001)
- SOAP client/server implementation using `soap ^0.25.0`
- REST endpoints for testing
- User, Product, and Order management

### 2. Salesforce Service (Port 3002)
- Salesforce API integration using `jsforce ^1.9.3`
- Mock SOQL queries and CRUD operations
- Contact and Opportunity management

### 3. Stripe Service (Port 3003)
- Payment processing using `stripe ^8.130.0`
- Payment intents and customer management
- Webhook handling

### 4. Twilio Service (Port 3004)
- SMS/Voice services using `twilio ^3.63.1`
- Message broadcasting and call management
- Webhook endpoints

### 5. AWS Service (Port 3005)
- AWS services integration using `aws-sdk ^2.528.0`
- S3, EC2, Lambda, and SNS mock operations
- Resource management

### 6. Service Orchestrator (Port 3000)
- Central coordination service
- Demo workflow execution
- Service health monitoring

## Project Structure

```
├── src/
│   ├── services/           # Microservices
│   │   ├── memoryStore.ts  # In-memory data storage
│   │   ├── soapService.ts  # SOAP service
│   │   ├── salesforceService.ts # Salesforce integration
│   │   ├── stripeService.ts # Payment processing
│   │   ├── twilioService.ts # SMS/Voice services
│   │   ├── awsService.ts  # AWS services
│   │   ├── orchestrator.ts # Service orchestration
│   │   └── index.ts        # Service exports
│   ├── components/         # React components
│   │   └── ServiceDashboard.tsx # Main dashboard
│   ├── pages/              # Next.js pages
│   │   └── index.tsx       # Home page
│   ├── server.ts           # Main server entry point
│   ├── styles/             # Global styles
│   └── lib/                # Utility functions
├── public/                 # Static assets
├── dist/                   # Built output
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

1. **Start all microservices:**
```bash
npm run start
```

2. **Start development mode:**
```bash
npm run dev
```

3. **Start Next.js only:**
```bash
npm run dev:next
```

The application will be available at:
- **Main Dashboard**: `http://localhost:3000`
- **API Status**: `http://localhost:3000/api/status`

## API Endpoints

### Orchestrator (Port 3000)
- `GET /api/status` - Service health status
- `GET /api/data/summary` - Data summary
- `GET /api/data/all` - All in-memory data
- `POST /api/demo/workflow` - Run demo workflow
- `POST /api/data/reset` - Reset all data

### SOAP Service (Port 3001)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order

### Salesforce Service (Port 3002)
- `GET /api/salesforce/contacts` - List contacts
- `POST /api/salesforce/contact` - Create contact
- `GET /api/salesforce/opportunities` - List opportunities
- `POST /api/salesforce/opportunity` - Create opportunity
- `GET /api/salesforce/query?q=SOQL_QUERY` - Execute SOQL query

### Stripe Service (Port 3003)
- `POST /api/stripe/create-payment-intent` - Create payment intent
- `POST /api/stripe/confirm-payment/:id` - Confirm payment
- `POST /api/stripe/create-customer` - Create customer
- `GET /api/stripe/payment-intents` - List payment intents

### Twilio Service (Port 3004)
- `POST /api/twilio/send-sms` - Send SMS
- `POST /api/twilio/make-call` - Make call
- `GET /api/twilio/messages` - List messages
- `POST /api/twilio/broadcast` - Broadcast SMS

### AWS Service (Port 3005)
- `POST /api/aws/s3/buckets` - Create S3 bucket
- `POST /api/aws/ec2/instances` - Create EC2 instance
- `POST /api/aws/lambda/functions` - Create Lambda function
- `POST /api/aws/sns/publish` - Publish SNS message

## Demo Workflow

The application includes a comprehensive demo workflow that:

1. Creates a new user
2. Creates an order for a product
3. Processes payment via Stripe
4. Sends confirmation SMS via Twilio
5. Creates Salesforce opportunity record
6. Stores order data in AWS (mock)

Run the demo:
```bash
curl -X POST http://localhost:3000/api/demo/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Demo User",
    "userEmail": "demo@example.com", 
    "userPhone": "+1234567890",
    "productId": "1",
    "quantity": 2
  }'
```

## Features

- **In-memory Data Storage**: No database setup required
- **Mock Services**: All services work without real API keys
- **Real Dashboard**: React UI for testing all services
- **Service Orchestration**: Coordinated workflows across services
- **REST APIs**: Full REST endpoints for each service
- **SOAP Support**: SOAP service with WSDL endpoint
- **TypeScript**: Full TypeScript support
- **Hot Reload**: Development mode with hot reloading

## Environment Variables (Optional)

For real integrations, create a `.env.local` file:

```env
# Salesforce
SF_USERNAME=your_username
SF_PASSWORD=your_password
SF_SECURITY_TOKEN=your_token
SF_LOGIN_URL=https://login.salesforce.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1234567890

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

## Scripts

- `npm run dev` - Start development server with microservices
- `npm run dev:next` - Start Next.js only
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Technologies Used

- **Frontend**: React 16.8+, Next.js 6+
- **Backend**: Node.js, Express
- **Packages**: soap, jsforce, stripe, twilio, aws-sdk
- **Language**: TypeScript 4.8+
- **Styling**: Material-UI
- **State Management**: In-memory storage

## License

Proprietary - TalentScreen
