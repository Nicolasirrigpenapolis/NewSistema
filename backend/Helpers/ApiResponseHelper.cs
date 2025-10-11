using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Helpers
{
    public static class ApiResponseHelper
    {
        public static IActionResult Success<T>(T data, string message = "Operação realizada com sucesso")
        {
            return new OkObjectResult(new
            {
                success = true,
                message = message,
                data = data
            });
        }

        public static IActionResult Error(string message, int statusCode = 500, object? errors = null)
        {
            return new ObjectResult(new
            {
                success = false,
                message = message,
                errors = errors
            })
            {
                StatusCode = statusCode
            };
        }

        public static IActionResult NotFound(string message = "Recurso não encontrado")
        {
            return Error(message, 404);
        }

        public static IActionResult BadRequest(string message, object? errors = null)
        {
            return Error(message, 400, errors);
        }
    }
}
