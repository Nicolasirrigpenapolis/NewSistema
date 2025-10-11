using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;

namespace Backend.Api.Middleware
{
    public class ValidationExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ValidationExceptionMiddleware> _logger;

        public ValidationExceptionMiddleware(RequestDelegate next, ILogger<ValidationExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            var response = context.Response;

            var errorResponse = new ErrorResponse
            {
                Success = false,
                Message = "Ocorreu um erro interno"
            };

            switch (exception)
            {
                case ValidationException validationEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "Erro de validação";
                    errorResponse.Details = validationEx.Message;
                    break;

                case DbUpdateException dbEx when dbEx.InnerException?.Message.Contains("String or binary data would be truncated") == true:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "Dados muito longos";
                    errorResponse.Details = "Um ou mais campos excedem o tamanho máximo permitido. Verifique os dados informados.";
                    _logger.LogWarning("Erro de truncamento de dados: {Message}", dbEx.Message);
                    break;

                case DbUpdateException dbEx when dbEx.InnerException?.Message.Contains("duplicate key") == true:
                    response.StatusCode = (int)HttpStatusCode.Conflict;
                    errorResponse.Message = "Dados duplicados";
                    errorResponse.Details = "Já existe um registro com os mesmos dados únicos.";
                    _logger.LogWarning("Erro de dados duplicados: {Message}", dbEx.Message);
                    break;

                case DbUpdateException dbEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "Erro ao salvar dados";
                    errorResponse.Details = "Erro interno ao processar os dados. Verifique as informações fornecidas.";
                    _logger.LogError(dbEx, "Erro de banco de dados: {Message}", dbEx.Message);
                    break;

                case ArgumentException argEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "Argumento inválido";
                    errorResponse.Details = argEx.Message;
                    break;

                case UnauthorizedAccessException:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse.Message = "Acesso não autorizado";
                    break;

                case KeyNotFoundException:
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse.Message = "Recurso não encontrado";
                    break;

                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "Erro interno do servidor";
                    _logger.LogError(exception, "Erro não tratado: {Message}", exception.Message);
                    break;
            }

            var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }

    public class ErrorResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
