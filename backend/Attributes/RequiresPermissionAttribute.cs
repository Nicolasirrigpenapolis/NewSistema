using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Backend.Api.Services;
using System.Security.Claims;

namespace Backend.Api.Attributes
{
    public class RequiresPermissionAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string _permissionCode;

        public RequiresPermissionAttribute(string permissionCode)
        {
            _permissionCode = permissionCode;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // BYPASS PARA DESENVOLVIMENTO - Permitir acesso direto em desenvolvimento
            var environment = context.HttpContext.RequestServices.GetService<IWebHostEnvironment>();
            if (environment?.IsDevelopment() == true)
            {
                await next();
                return;
            }

            var permissaoService = context.HttpContext.RequestServices.GetService<IPermissaoService>();

            if (permissaoService == null)
            {
                context.Result = new StatusCodeResult(500);
                return;
            }

            // Extrair cargoId do JWT
            var cargoIdClaim = context.HttpContext.User?.FindFirst("CargoId")?.Value;
            var userName = context.HttpContext.User?.FindFirst(ClaimTypes.Name)?.Value;

            if (!int.TryParse(cargoIdClaim, out int cargoId))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Token inválido ou CargoId não encontrado" });
                return;
            }

            // Bypass opcional: permite definir um usuário super via variável de ambiente (sem valor padrão)
            var superUserName = Environment.GetEnvironmentVariable("SUPERUSER_USERNAME");
            if (!string.IsNullOrEmpty(superUserName) &&
                !string.IsNullOrEmpty(userName) &&
                string.Equals(userName, superUserName, StringComparison.OrdinalIgnoreCase))
            {
                await next();
                return;
            }

            // Verificar se o cargo tem a permissão normalmente
            var hasPermission = await permissaoService.UserHasPermissionAsync(cargoId, _permissionCode);

            if (!hasPermission)
            {
                context.Result = new ObjectResult(new { message = $"Acesso negado. Permissão necessária: {_permissionCode}" })
                {
                    StatusCode = 403
                };
                return;
            }

            await next();
        }
    }
}
