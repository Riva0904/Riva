FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["api/Riva.Api/Riva.Api.csproj",       "api/Riva.Api/"]
COPY ["service/Riva.Service/Riva.Service.csproj", "service/Riva.Service/"]
COPY ["domain/Riva.Domain/Riva.Domain.csproj",    "domain/Riva.Domain/"]
COPY ["dto/Riva.Dto/Riva.Dto.csproj",             "dto/Riva.Dto/"]

RUN dotnet restore "api/Riva.Api/Riva.Api.csproj"

COPY . .

RUN dotnet publish "api/Riva.Api/Riva.Api.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Riva.Api.dll"]
