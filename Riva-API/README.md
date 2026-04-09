# Riva-API Project Structure

## Overview

Riva-API is a multi-layered .NET 8.0 API application following Clean Architecture principles with complete separation of concerns.

## Project Layers

### 1. **Riva.Api** (Presentation Layer)
- **Location:** `api/Riva.Api/`
- **Purpose:** HTTP API layer - Controllers, middleware, and request/response handling
- **Key Components:**
  - `Controllers/` - API endpoints
  - `Middleware/` - Custom middleware components
  - `Util/` - Utility functions
  - `Program.cs` - Application configuration and startup
  - `appsettings.json` - Configuration files

### 2. **Riva.Service** (Application/Business Logic Layer)
- **Location:** `service/Riva.Service/`
- **Purpose:** Business logic and orchestration
- **Key Components:**
  - `Query/` - Query objects organized by domain
  - `Command/` - Command objects for mutations
  - `Handler/`
    - `QueryHandler/` - Handlers for queries
    - `CommandHandler/` - Handlers for commands
  - `Repository/` - Data access abstractions
  - `Interfaces/` - Service contracts
  - `ExternalPort/` - External service integrations

### 3. **Riva.Domain** (Domain Layer)
- **Location:** `domain/Riva.Domain/`
- **Purpose:** Core business entities and rules
- **Key Components:**
  - `Entity/` - Domain entities
  - `Enum/` - Domain enumerations
  - `Constants/` - Domain constants
  - `Mapping/` - Entity mapping configurations

### 4. **Riva.Dto** (Data Transfer Layer)
- **Location:** `dto/Riva.Dto/`
- **Purpose:** Data transfer objects for API communication
- **Modules:**
  - `Auth/` - Authentication DTOs
  - `User/` - User management DTOs
  - `Template/` - Template DTOs
  - `Invitation/` - Invitation DTOs
  - `Public/` - Public API DTOs
  - `Upload/` - File upload DTOs
  - `Admin/` - Admin panel DTOs

## Supporting Layers

### 5. **Database Layer**
- **Location:** `database/`
- **Databases:**
  - `userdb/` - User management database
  - `admindb/` - Admin database
  - `templatedb/` - Template database
  - `invitationdb/` - Invitation database
- **Components:**
  - `procedure/` - Stored procedures
  - `entity/` - Database entity mappings

### 6. **Authentication**
- **Location:** `authentication/`
- **Components:**
  - `Jwt/` - JWT token management
  - `RefreshToken/` - Refresh token handling
  - `Authorization/` - Authorization policies and handlers

### 7. **Shared**
- **Location:** `shared/`
- **Components:**
  - `Response/` - Common response models
  - `Helpers/` - Utility helper classes
  - `Exceptions/` - Custom exception definitions
  - `Common/` - Shared constants and utilities

### 8. **Testing**
- **Location:** `test/`
- **Suites:**
  - `UnitTest/` - Unit tests
  - `IntegrationTest/` - Integration tests

## Project Dependencies

```
Riva.Api (depends on)
├── Riva.Service
├── Riva.Domain
├── Riva.Dto
└── External: MediatR, Swashbuckle.AspNetCore

Riva.Service (depends on)
├── Riva.Domain
├── Riva.Dto
└── External: MediatR

Riva.Dto (depends on)
└── Riva.Domain

Riva.Domain (no dependencies)
```

## Key Technologies

- **.NET:** 8.0
- **Architecture:** Clean Architecture
- **Pattern:** CQRS (Command Query Responsibility Segregation) via MediatR
- **API Documentation:** Swagger/OpenAPI
- **Package Manager:** NuGet

## Building & Running

### Prerequisites
- `.NET 8.0 SDK` or higher
- Visual Studio 2022 or VS Code with C# extension

### Build
```bash
dotnet build
```

### Run API
```bash
cd api/Riva.Api
dotnet run
```

### Run Tests
```bash
# Unit Tests
dotnet test test/UnitTest

# Integration Tests
dotnet test test/IntegrationTest
```

## API Documentation

Once running, access Swagger UI at: `https://localhost:{port}/swagger`

## Folder Structure at a Glance

```
Riva-API/
├── api/Riva.Api/                      # Presentation Layer
├── service/Riva.Service/              # Application Layer
├── domain/Riva.Domain/                # Domain Layer
├── dto/Riva.Dto/                      # DTO Layer
├── database/                          # Database schemas & procedures
├── authentication/                    # Auth & security
├── shared/                            # Shared utilities
├── test/                              # Test suites
└── Riva-API.sln                       # Solution file
```

## Getting Started

1. **Clone/Open the project**
2. **Build the solution:** `dotnet build`
3. **Configure database connections** in `appsettings.json`
4. **Run migrations** (if using EF Core)
5. **Start the API:** `dotnet run` from the `api/Riva.Api` folder
6. **Access Swagger:** Navigate to the URL shown in console

## Contributing

Follow the Clean Architecture guidelines when adding new features:
- New entities go in `Domain`
- DTOs go in `Dto`
- Business logic goes in `Service`
- API endpoints go in `Api`

## Notes

- Ensure all layer projects have proper namespace conventions
- Use dependency injection for loose coupling
- Follow SOLID principles across all layers
