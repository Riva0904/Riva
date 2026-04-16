using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Serilog;

namespace Riva.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ErrorHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleValidationExceptionAsync(HttpContext context, ValidationException ex)
    {
        Log.Warning("Validation error: {Errors}", ex.Errors);

        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        context.Response.ContentType = "application/json";

        var errors = ex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage });
        var result = JsonSerializer.Serialize(new { errors });

        await context.Response.WriteAsync(result);
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        Log.Error(ex, "An unexpected error occurred");

        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/json";

        var result = JsonSerializer.Serialize(new { error = "An unexpected error occurred" });

        await context.Response.WriteAsync(result);
    }
}