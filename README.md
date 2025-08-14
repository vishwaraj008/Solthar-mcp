
# Solthar MCP Server

---

## Description
**Solthar MCP** (Semantic Orchestration Layer for Threaded Hierarchical Abstraction & Reasoning) is a Node.js server implementing a Model Context Protocol router with JWT authentication, MySQL, Redis, and integration with external tools like Athena and MOAD.

---

## Features
- JWT-based authentication
- API key management
- Context and request logging
- Rate limiting and security middleware (Helmet, CORS, HTTPS)
- Athena and MOAD tool integration
- MySQL and Redis support
- Modular, scalable architecture

---

## Project Structure
```text
src/
  app.js                # Main server entry
  config/               # Configuration files (MySQL, Redis, etc.)
  controllers/          # Route controllers
  middleware/           # Auth, CORS, error handling, etc.
  models/               # Database models
  processors/           # Core MCP logic
  routes/               # Express route definitions
  services/             # Athena, MOAD, and other services
  utils/                # Utility functions
  validators/           # Input validation
```

---

## API Endpoints

### Auth Routes
| Method | Endpoint      | Description         |
|--------|--------------|---------------------|
| POST   | /login       | User login          |
| POST   | /logout      | User logout (JWT)   |

### MCP Routes (JWT required)
| Method | Endpoint         | Description                  |
|--------|------------------|------------------------------|
| POST   | /initialize      | Initialize MCP session       |
| POST   | /execute         | Execute MCP command          |
| GET    | /status          | Get MCP status               |
| GET    | /commands        | List available MCP commands  |
| POST   | /shutdown        | Shutdown MCP                 |

---

## Tools Available(You can find them on my github)
- **Athena**: External API integration for advanced reasoning
- **MOAD**: External tool for orchestration (see `toolService.js`)

---

## Setup & Commands
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start in development mode (with nodemon):**
   ```bash
   npm run dev
   ```
3. **Start in production mode:**
   ```bash
   npm start
   ```

---

## Request Body Examples

### MOAD: Generate Documentation
```json
{
  "tool": "Moad",
  "params": {
    "projectPath": "path to your project",
    "outputPath": "output path where you want your docs",
    "includeIndirectLogic": true
  }
}
```

### Athena: Ask a Question
```json
{
  "tool": "Athena",
  "params": {
    "prompt": "prompt/question for Athena"
  }
}
```

### Athena: Upload and Ingest Docs
```json
{
  "tool": "Athena",
  "params": {
    "upload": {
      "file": "filePath",
      "title": "name/title of file",
      "source_type": "file type",
      "description": "description of file",
      "tags": "tags"
    }
  }
}
```

---

## Environment Variables
- `ATHENA_API_URL`, `ATHENA_API_KEY`: Athena tool config
- `MOAD_API_URL`, `MOAD_API_KEY`: MOAD tool config
- `MYSQL_*`, `REDIS_*`: Database configs
- `JWT_SECRET`: JWT signing key

---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.





