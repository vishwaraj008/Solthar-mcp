# 🚀 Solthar MCP Server(Very incomplete project)
## Need many Changes and addtion

**Solthar MCP** is a production-ready Node.js Express server implementing the **Model Context Protocol (MCP)** for intelligent, context-aware AI request routing and processing.

## ✨ Features

### 🧠 Core MCP Capabilities
- **Context-Aware Processing** - Intelligent request analysis with conversation history
- **Multi-Model Routing** - Automatic routing to appropriate AI services (Athena/OpenAI)
- **Conversation Persistence** - Session-based context management with Redis caching
- **Batch Processing** - Handle multiple requests efficiently
- **Real-time Analysis** - Intent detection and response optimization

### 🔒 Security & Performance
- **JWT + API Key Authentication** - Dual authentication methods
- **Rate Limiting** - Per-user and per-IP request throttling
- **Request Logging** - Comprehensive audit trail with analytics
- **Graceful Shutdown** - Safe connection cleanup
- **Health Monitoring** - Kubernetes-ready health checks

### 🏗️ Architecture
- **Modular Design** - Clean separation of concerns
- **Database Abstraction** - MySQL with connection pooling
- **Caching Layer** - Upstash Redis for performance
- **Error Handling** - Comprehensive error management
- **Logging** - Structured JSON logging with Pino

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|----------|
| **Server** | Express.js | HTTP server and routing |
| **Database** | MySQL 8.0+ | Persistent data storage |
| **Cache** | Upstash Redis / IORedis | Session and response caching |
| **Authentication** | JWT + API Keys | Secure access control |
| **AI Integration** | OpenAI API (Athena) | LLM processing |
| **Logging** | Pino | Structured logging |
| **Validation** | Joi | Request validation |
| **Security** | Helmet + CORS | Security headers |

---

## 📋 Prerequisites

- **Node.js** >= 18.x
- **MySQL** 8.0+ (or compatible)
- **Redis** instance (Upstash recommended) or local Redis
- **OpenAI API Key** (for Athena integration)

---

## ⚡ Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd SoltharMcp
npm install
```

### 2. Environment Setup
Update `.env` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=solthar_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# OpenAI (Athena)
ATHENA_API_KEY=sk-your-openai-api-key
ATHENA_API_URL=https://api.openai.com/v1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE solthar_db;"

# Start the server (it will auto-create tables)
npm run dev

# In another terminal, add sample data
mysql -u root -p solthar_db < sql/setup.sql
```

### 4. Test the Server
```bash
# Health check
curl http://localhost:3000/health

# MCP status (requires auth)
curl -H "x-api-key: sk-user-test-key-789012" \
     http://localhost:3000/api/mcp/status
```

---

## 🔧 API Reference

### Authentication
Solthar supports two authentication methods:

#### JWT Token
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     http://localhost:3000/api/mcp/process
```

#### API Key
```bash
curl -H "x-api-key: sk-user-test-key-789012" \
     http://localhost:3000/api/mcp/process
```

### Core Endpoints

#### 🧠 Process Request
```bash
POST /api/mcp/process
```

**Example Request:**
```json
{
  "message": "Explain quantum computing in simple terms",
  "context": {
    "previousMessages": ["Hi", "I'm interested in technology"],
    "intent": "explanation",
    "language": "en"
  },
  "config": {
    "response_type": "detailed",
    "max_tokens": 500,
    "temperature": 0.7
  },
  "metadata": {
    "source": "web_app",
    "device": "desktop"
  }
}
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "response": "Quantum computing is like...",
    "context": {...},
    "model": "gpt-3.5-turbo",
    "source": "athena",
    "tokensUsed": 342,
    "processingTime": 1250,
    "metadata": {
      "intent": "question",
      "confidence": 0.8,
      "strategy": "athena"
    }
  },
  "processingTime": "1250ms",
  "requestId": "req_1704067200_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 💬 Chat Interface
```bash
POST /api/mcp/chat
```

#### 🎯 Content Generation
```bash
POST /api/mcp/generate
```

#### 📊 Content Analysis
```bash
POST /api/mcp/analyze
```

#### 📦 Batch Processing
```bash
POST /api/mcp/batch
```

### Context Management

#### Save Context
```bash
POST /api/mcp/context/save
```

#### Get Context
```bash
GET /api/mcp/context/{sessionId}
```

#### Delete Context
```bash
DELETE /api/mcp/context/{sessionId}
```

### Health & Monitoring

- `GET /health` - Basic health check
- `GET /health/detailed` - Full system health
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/metrics` - System metrics

---

## 🔐 Test Credentials

After running `sql/setup.sql`, you can use these test credentials:

### Admin User
- **Username:** admin
- **Password:** admin123
- **API Key:** `sk-admin-test-key-123456`
- **Permissions:** All permissions

### Regular User
- **Username:** testuser
- **Password:** test123
- **API Key:** `sk-user-test-key-789012`
- **Permissions:** Basic MCP operations

---

## 🧪 Testing Examples

### Basic Chat Request
```bash
curl -X POST http://localhost:3000/api/mcp/chat \
  -H "x-api-key: sk-user-test-key-789012" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you help me understand MCP?",
    "sessionId": "test_session_123"
  }'
```

### Content Generation
```bash
curl -X POST http://localhost:3000/api/mcp/generate \
  -H "x-api-key: sk-user-test-key-789012" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a brief introduction to AI",
    "type": "text",
    "config": {
      "response_type": "concise",
      "max_tokens": 200
    }
  }'
```

### Batch Processing
```bash
curl -X POST http://localhost:3000/api/mcp/batch \
  -H "x-api-key: sk-user-test-key-789012" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "id": "req1",
        "type": "process",
        "payload": {"message": "What is AI?"}
      },
      {
        "id": "req2",
        "type": "generate",
        "payload": {"prompt": "Explain machine learning", "type": "text"}
      }
    ]
  }'
```

---

## 🚀 Deployment

### Production Environment Variables
```env
# Security
NODE_ENV=production
JWT_SECRET=<strong-secret-key>
ALLOWED_ORIGINS=https://yourdomain.com

# Database
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000

# Logging
LOG_LEVEL=info
```

### Docker Support
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Check Integration
Solthar provides Kubernetes-ready health checks:
- **Liveness:** `GET /health/live`
- **Readiness:** `GET /health/ready`

---

## 📈 Monitoring & Analytics

### Request Logs
All requests are logged to `request_logs` table with:
- Processing time
- Token usage
- Error details
- User analytics

### Context Analytics
Track conversation patterns in `context_logs`:
- Session duration
- Context types
- Expiration management

### Admin Dashboard
Access admin endpoints for:
- User management: `/api/admin/users`
- System statistics: `/api/admin/stats`
- API key management: `/api/admin/api-keys`

---

## 🔧 Development

### Available Scripts
```bash
npm run dev    # Development with nodemon
npm start      # Production start
npm test       # Run tests (not implemented yet)
npm run lint   # Code linting (not implemented yet)
```

### Project Structure
```
src/
├── config/          # Database, Redis, configuration
├── controllers/     # Request handlers
├── middleware/      # Auth, error handling, validation
├── routes/          # Express routes
├── services/        # Business logic (MCP, Context, Athena)
├── validators/      # Request validation schemas
├── utils/           # Logging, helpers
└── app.js           # Main application
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🆘 Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Verify your environment configuration
3. Test with the provided sample credentials
4. Review the health check endpoints

**Happy coding with Solthar MCP!** 🎉
