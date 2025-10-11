using Backend.Api.Data; 
using Backend.Api.Models; 
using Microsoft.EntityFrameworkCore; 
namespace Backend.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(SistemaContext context, ILogger logger)
    {
        // Evita seed duplicado
        if (await context.Emitentes.AnyAsync())
        {
            logger.LogInformation("[SEED] Base já possui dados - ignorando seed.");
            return;
        }

        logger.LogInformation("[SEED] Inserindo dados básicos...");

        var emitente = new Emitente
        {
            RazaoSocial = "Emitente Demo LTDA",
            Cnpj = "12345678000199",
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        };
        context.Emitentes.Add(emitente);
        await context.SaveChangesAsync();

        var veiculo = new Veiculo
        {
            Placa = "ABC1D23",
            Ativo = true,
            DataCriacao = DateTime.UtcNow,
            Tara = 5000
        };
        context.Veiculos.Add(veiculo);

        var condutor = new Condutor
        {
            Nome = "Motorista Demo",
            Cpf = "12345678901",
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        };
        context.Condutores.Add(condutor);

        await context.SaveChangesAsync();
        logger.LogInformation("[SEED] Seed concluído.");
    }
}
