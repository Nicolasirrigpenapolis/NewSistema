using Backend.Api.Data; 
using Backend.Api.Models; 
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(SistemaContext context, ILogger logger)
    {
        logger.LogInformation("[SEED] Iniciando seed do banco de dados...");

        // SEED OBRIGATÓRIO: Permissões, Cargo Programador e Usuário Programador
        await SeedPermissoesAsync(context, logger);
        await SeedCargoProgramadorAsync(context, logger);
        await SeedUsuarioProgramadorAsync(context, logger);

        // SEED OPCIONAL: Dados demo DESABILITADO (removido a pedido do usuário)
        // if (!await context.Emitentes.AnyAsync())
        // {
        //     logger.LogInformation("[SEED] Base vazia - inserindo dados demo...");
        //     await SeedDadosDemoAsync(context, logger);
        // }
        // else
        // {
        //     logger.LogInformation("[SEED] Base já possui emitentes - pulando dados demo.");
        // }

        logger.LogInformation("[SEED] Seed concluído com sucesso.");
    }

    private static async Task SeedPermissoesAsync(SistemaContext context, ILogger logger)
    {
        var permissoes = new List<(string Codigo, string Nome, string Descricao, string Modulo)>
        {
            // Operações - Veículos
            ("veiculos.listar", "Listar veículos", "Permite visualizar a lista de veículos", "Operacoes"),
            ("veiculos.criar", "Criar veículos", "Permite cadastrar novos veículos", "Operacoes"),
            ("veiculos.editar", "Editar veículos", "Permite editar veículos existentes", "Operacoes"),
            
            // Operações - Reboques
            ("reboques.listar", "Listar reboques", "Permite visualizar a lista de reboques", "Operacoes"),
            ("reboques.criar", "Criar reboques", "Permite cadastrar novos reboques", "Operacoes"),
            ("reboques.editar", "Editar reboques", "Permite editar reboques existentes", "Operacoes"),
            
            // Operações - Condutores
            ("condutores.listar", "Listar condutores", "Permite visualizar a lista de condutores", "Operacoes"),
            ("condutores.criar", "Criar condutores", "Permite cadastrar novos condutores", "Operacoes"),
            ("condutores.editar", "Editar condutores", "Permite editar condutores existentes", "Operacoes"),
            
            // Operações - Viagens
            ("viagens.criar", "Criar viagens", "Permite cadastrar novas viagens", "Operacoes"),
            ("viagens.editar", "Editar viagens", "Permite editar viagens existentes", "Operacoes"),
            
            // Documentos - MDF-e
            ("mdfe.listar", "Listar MDF-e", "Permite visualizar o módulo de MDF-e", "Documentos"),
            ("mdfe.criar", "Criar MDF-e", "Permite criar novos manifestos eletrônicos", "Documentos"),
            ("mdfe.editar", "Editar MDF-e", "Permite editar manifestos eletrônicos", "Documentos"),
            ("mdfe.transmitir", "Transmitir MDF-e", "Permite transmitir manifestos para a SEFAZ", "Documentos"),
            ("mdfe.cancelar", "Cancelar MDF-e", "Permite cancelar manifestos autorizados", "Documentos"),
            ("mdfe.encerrar", "Encerrar MDF-e", "Permite encerrar manifestos autorizados", "Documentos"),
            
            // Documentos - NF-e e CT-e
            ("nfe.listar", "Listar NF-e", "Permite visualizar o módulo de NF-e", "Documentos"),
            ("cte.listar", "Listar CT-e", "Permite visualizar o módulo de CT-e", "Documentos"),
            
            // Cadastros - Contratantes
            ("contratantes.listar", "Listar contratantes", "Permite visualizar contratantes", "Cadastros"),
            ("contratantes.criar", "Criar contratantes", "Permite cadastrar novos contratantes", "Cadastros"),
            ("contratantes.editar", "Editar contratantes", "Permite editar contratantes existentes", "Cadastros"),
            
            // Cadastros - Seguradoras
            ("seguradoras.listar", "Listar seguradoras", "Permite visualizar seguradoras", "Cadastros"),
            ("seguradoras.criar", "Criar seguradoras", "Permite cadastrar novas seguradoras", "Cadastros"),
            ("seguradoras.editar", "Editar seguradoras", "Permite editar seguradoras existentes", "Cadastros"),
            
            // Cadastros - Municípios
            ("municipios.listar", "Listar municípios", "Permite visualizar municípios", "Cadastros"),
            ("municipios.criar", "Criar municípios", "Permite cadastrar novos municípios", "Cadastros"),
            ("municipios.editar", "Editar municípios", "Permite editar municípios existentes", "Cadastros"),
            
            // Cadastros - Fornecedores
            ("fornecedores.listar", "Listar fornecedores", "Permite visualizar fornecedores", "Cadastros"),
            ("fornecedores.criar", "Criar fornecedores", "Permite cadastrar novos fornecedores", "Cadastros"),
            ("fornecedores.editar", "Editar fornecedores", "Permite editar fornecedores existentes", "Cadastros"),
            
            // Manutenções
            ("manutencoes.listar", "Listar manutenções", "Permite visualizar manutenções", "Manutencoes"),
            ("manutencoes.criar", "Criar manutenções", "Permite cadastrar manutenções", "Manutencoes"),
            ("manutencoes.editar", "Editar manutenções", "Permite editar manutenções", "Manutencoes"),
            
            // Relatórios
            ("relatorios.manutencao", "Relatório de manutenção", "Permite acessar o relatório de manutenção", "Inteligencia"),
            ("relatorios.despesas", "Relatório de despesas", "Permite acessar o relatório de despesas de viagens", "Inteligencia"),
            
            // Administração
            ("usuarios.listar", "Listar usuários", "Permite visualizar usuários", "Administracao"),
            ("usuarios.criar", "Criar usuários", "Permite criar novos usuários", "Administracao"),
            ("usuarios.visualizar", "Visualizar usuários", "Permite visualizar detalhes de usuários", "Administracao"),
            ("usuarios.editar", "Editar usuários", "Permite editar usuários", "Administracao"),
            ("cargos.listar", "Listar cargos", "Permite visualizar cargos", "Administracao"),
            ("cargos.criar", "Criar cargos", "Permite criar novos cargos", "Administracao"),
            ("cargos.editar", "Editar cargos", "Permite editar cargos existentes", "Administracao"),
            ("cargos.desativar", "Desativar cargos", "Permite desativar cargos", "Administracao"),
            ("cargos.gerenciar_permissoes", "Gerenciar permissões de cargos", "Permite gerenciar permissões atribuídas aos cargos", "Administracao"),
            ("emitente.configurar", "Configurar emitente", "Permite configurar dados do emitente", "Administracao")
        };

        var permissoesInseridas = 0;
        foreach (var (codigo, nome, descricao, modulo) in permissoes)
        {
            var existe = await context.Permissoes.AnyAsync(p => p.Codigo == codigo);
            if (!existe)
            {
                context.Permissoes.Add(new Permissao
                {
                    Codigo = codigo,
                    Nome = nome,
                    Descricao = descricao,
                    Modulo = modulo,
                    Ativo = true,
                    DataCriacao = DateTime.UtcNow
                });
                permissoesInseridas++;
            }
        }

        if (permissoesInseridas > 0)
        {
            await context.SaveChangesAsync();
            logger.LogInformation("[SEED] {Count} permissões criadas.", permissoesInseridas);
        }
        else
        {
            logger.LogInformation("[SEED] Todas as permissões já existem.");
        }
    }

    private static async Task SeedCargoProgramadorAsync(SistemaContext context, ILogger logger)
    {
        const string cargoNome = "Programador";
        
        var cargo = await context.Cargos
            .Include(c => c.CargoPermissoes)
            .FirstOrDefaultAsync(c => c.Nome == cargoNome);

        if (cargo == null)
        {
            cargo = new Cargo
            {
                Nome = cargoNome,
                Descricao = "Cargo de programador com acesso total ao sistema",
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };
            context.Cargos.Add(cargo);
            await context.SaveChangesAsync();
            logger.LogInformation("[SEED] Cargo '{CargoNome}' criado.", cargoNome);
        }

        // Vincular todas as permissões ao cargo Programador
        var todasPermissoes = await context.Permissoes.ToListAsync();
        var permissoesVinculadas = cargo.CargoPermissoes?.Select(cp => cp.PermissaoId).ToList() ?? new List<int>();

        var novasVinculacoes = 0;
        foreach (var permissao in todasPermissoes)
        {
            if (!permissoesVinculadas.Contains(permissao.Id))
            {
                context.CargoPermissoes.Add(new CargoPermissao
                {
                    CargoId = cargo.Id,
                    PermissaoId = permissao.Id,
                    DataCriacao = DateTime.UtcNow
                });
                novasVinculacoes++;
            }
        }

        if (novasVinculacoes > 0)
        {
            await context.SaveChangesAsync();
            logger.LogInformation("[SEED] {Count} permissões vinculadas ao cargo '{CargoNome}'.", novasVinculacoes, cargoNome);
        }
        else
        {
            logger.LogInformation("[SEED] Cargo '{CargoNome}' já possui todas as permissões vinculadas.", cargoNome);
        }
    }

    private static async Task SeedUsuarioProgramadorAsync(SistemaContext context, ILogger logger)
    {
        const string userName = "programador";
        const string password = "conectairrig@";
        const string nome = "Programador";

        var usuario = await context.Usuarios
            .FirstOrDefaultAsync(u => u.UserName == userName);

        if (usuario == null)
        {
            var cargo = await context.Cargos.FirstOrDefaultAsync(c => c.Nome == "Programador");
            if (cargo == null)
            {
                logger.LogError("[SEED] Cargo Programador não encontrado. Execute SeedCargoProgramadorAsync primeiro.");
                throw new InvalidOperationException("Cargo Programador não encontrado.");
            }

            var passwordHash = HashPassword(password);

            usuario = new Usuario
            {
                UserName = userName,
                PasswordHash = passwordHash,
                Nome = nome,
                CargoId = cargo.Id,
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };

            context.Usuarios.Add(usuario);
            await context.SaveChangesAsync();
            logger.LogInformation("[SEED] Usuário '{UserName}' criado com sucesso. Senha: '{Password}'", userName, password);
        }
        else
        {
            logger.LogInformation("[SEED] Usuário '{UserName}' já existe.", userName);
        }
    }

    private static async Task SeedDadosDemoAsync(SistemaContext context, ILogger logger)
    {
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
        logger.LogInformation("[SEED] Dados demo inseridos.");
    }

    private static string HashPassword(string password)
    {
        const string salt = "SistemaModelo2024";
        var saltedPassword = password + salt;
        var bytes = Encoding.UTF8.GetBytes(saltedPassword);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }
}
