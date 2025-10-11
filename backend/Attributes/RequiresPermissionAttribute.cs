using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Backend.Api.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

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
            var permissaoService = context.HttpContext.RequestServices.GetService<IPermissaoService>();
            var dbContext = context.HttpContext.RequestServices.GetService<Backend.Api.Data.SistemaContext>();

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

            // Bypass para super usuário (nome configurável via env SUPERUSER_USERNAME)
            var superUserName = Environment.GetEnvironmentVariable("SUPERUSER_USERNAME") ?? "programador";
            if (!string.IsNullOrEmpty(userName) && string.Equals(userName, superUserName, StringComparison.OrdinalIgnoreCase))
            {
                await next();
                return;
            }

            // Bypass alternativo: se o cargo se chama Programador
            if (dbContext != null)
            {
                var cargoNome = await dbContext.Cargos.Where(c => c.Id == cargoId).Select(c => c.Nome).FirstOrDefaultAsync();
                if (!string.IsNullOrEmpty(cargoNome) && string.Equals(cargoNome, "Programador", StringComparison.OrdinalIgnoreCase))
                {
                    await next();
                    return;
                }
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
