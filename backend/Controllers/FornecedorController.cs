using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Controllers;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;
using Backend.Api.Services;
using Backend.Api.Utils;

namespace Backend.Api.Controllers
{
    [Route("api/fornecedores")]
    public class FornecedorController : BaseController<Fornecedor, FornecedorListDto, FornecedorDetailDto, FornecedorCreateDto, FornecedorUpdateDto>
    {
        public FornecedorController(SistemaContext context, ILogger<FornecedorController> logger, ICacheService? cacheService = null)
            : base(context, logger, cacheService)
        {
        }

        /// <summary>
        /// Endpoint para obter fornecedores como opções para combobox
        /// </summary>
        [HttpGet("options")]
        public async Task<ActionResult<ApiResponse<List<EntityOption>>>> GetOptions()
        {
            try
            {
                var fornecedores = await _context.Fornecedores
                    .Where(f => f.Ativo)
                    .OrderBy(f => f.Nome)
                    .Select(f => new EntityOption
                    {
                        Id = f.Id.ToString(),
                        Label = f.Nome,
                        Description = f.Cidade != null && f.Uf != null ? $"{f.Cidade}/{f.Uf}" : null
                    })
                    .ToListAsync();

                return Ok(ApiResponse<List<EntityOption>>.CreateSuccess(fornecedores, "Fornecedores obtidos com sucesso"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter opções de fornecedores");
                return StatusCode(500, ApiResponse<List<EntityOption>>.CreateError("Erro interno do servidor"));
            }
        }

        protected override DbSet<Fornecedor> GetDbSet()
        {
            return _context.Fornecedores;
        }

        protected override FornecedorListDto EntityToListDto(Fornecedor entity)
        {
            var isPessoaJuridica = !string.IsNullOrEmpty(entity.Cnpj);
            return new FornecedorListDto
            {
                Id = entity.Id,
                Nome = entity.Nome,
                CnpjCpf = isPessoaJuridica ? entity.Cnpj : entity.Cpf,
                TipoPessoa = isPessoaJuridica ? "J" : "F",
                Telefone = entity.Telefone,
                Email = entity.Email,
                Cidade = entity.Cidade,
                Uf = entity.Uf,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override FornecedorDetailDto EntityToDetailDto(Fornecedor entity)
        {
            var totalManutencoes = entity.Manutencoes?.Count ?? 0;
            var valorTotalManutencoes = entity.Manutencoes?.Sum(m => m.ValorTotal) ?? 0;
            var isPessoaJuridica = !string.IsNullOrEmpty(entity.Cnpj);

            return new FornecedorDetailDto
            {
                Id = entity.Id,
                Nome = entity.Nome,
                CnpjCpf = isPessoaJuridica ? entity.Cnpj : entity.Cpf,
                TipoPessoa = isPessoaJuridica ? "J" : "F",
                Telefone = entity.Telefone,
                Email = entity.Email,
                Endereco = entity.Endereco,
                Cidade = entity.Cidade,
                Uf = entity.Uf,
                Cep = entity.Cep,
                Observacoes = entity.Observacoes,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao,
                DataUltimaAlteracao = entity.DataUltimaAlteracao,
                TotalManutencoes = totalManutencoes,
                ValorTotalManutencoes = valorTotalManutencoes
            };
        }

        protected override Fornecedor CreateDtoToEntity(FornecedorCreateDto dto)
        {
            var documentoLimpo = !string.IsNullOrEmpty(dto.CnpjCpf) ? DocumentValidator.RemoverFormatacao(dto.CnpjCpf) : null;
            var isPessoaJuridica = dto.TipoPessoa?.ToUpper() == "J";
            
            return new Fornecedor
            {
                Nome = dto.Nome,
                Cnpj = isPessoaJuridica ? documentoLimpo : null,
                Cpf = !isPessoaJuridica ? documentoLimpo : null,
                Telefone = dto.Telefone,
                Email = dto.Email,
                Endereco = dto.Endereco,
                Cidade = dto.Cidade,
                Uf = dto.Uf,
                Cep = dto.Cep,
                Observacoes = dto.Observacoes,
                Ativo = true,
                DataCriacao = DateTime.Now
            };
        }

        protected override void UpdateEntityFromDto(Fornecedor entity, FornecedorUpdateDto dto)
        {
            var documentoLimpo = !string.IsNullOrEmpty(dto.CnpjCpf) ? DocumentValidator.RemoverFormatacao(dto.CnpjCpf) : null;
            var isPessoaJuridica = dto.TipoPessoa?.ToUpper() == "J";
            
            entity.Nome = dto.Nome;
            entity.Cnpj = isPessoaJuridica ? documentoLimpo : null;
            entity.Cpf = !isPessoaJuridica ? documentoLimpo : null;
            entity.Telefone = dto.Telefone;
            entity.Email = dto.Email;
            entity.Endereco = dto.Endereco;
            entity.Cidade = dto.Cidade;
            entity.Uf = dto.Uf;
            entity.Cep = dto.Cep;
            entity.Observacoes = dto.Observacoes;
            entity.Ativo = dto.Ativo;
            entity.DataUltimaAlteracao = DateTime.Now;
        }

        protected override IQueryable<Fornecedor> ApplySearchFilter(IQueryable<Fornecedor> query, string search)
        {
            if (string.IsNullOrWhiteSpace(search))
                return query;

            var searchLower = search.ToLower();
            return query.Where(f =>
                f.Nome.ToLower().Contains(searchLower) ||
                (f.Cnpj != null && f.Cnpj.Contains(search)) ||
                (f.Cpf != null && f.Cpf.Contains(search)) ||
                (f.Email != null && f.Email.ToLower().Contains(searchLower)) ||
                (f.Cidade != null && f.Cidade.ToLower().Contains(searchLower))
            );
        }

        protected override IQueryable<Fornecedor> ApplyOrdering(IQueryable<Fornecedor> query, string? sortBy, string? sortDirection)
        {
            var isAscending = sortDirection?.ToLower() != "desc";

            return sortBy?.ToLower() switch
            {
                "nome" => isAscending ? query.OrderBy(f => f.Nome) : query.OrderByDescending(f => f.Nome),
                "cnpj" => isAscending ? query.OrderBy(f => f.Cnpj) : query.OrderByDescending(f => f.Cnpj),
                "cidade" => isAscending ? query.OrderBy(f => f.Cidade) : query.OrderByDescending(f => f.Cidade),
                "uf" => isAscending ? query.OrderBy(f => f.Uf) : query.OrderByDescending(f => f.Uf),
                "datacriacao" => isAscending ? query.OrderBy(f => f.DataCriacao) : query.OrderByDescending(f => f.DataCriacao),
                _ => query.OrderByDescending(f => f.DataCriacao)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Fornecedor entity)
        {
            var hasManutencoes = await _context.ManutencaoVeiculos
                .AnyAsync(m => m.FornecedorId == entity.Id);

            if (hasManutencoes)
            {
                return (false, "Não é possível excluir o fornecedor pois existem manutenções vinculadas a ele");
            }

            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(FornecedorCreateDto dto)
        {
            // Deve ter CnpjCpf
            if (string.IsNullOrEmpty(dto.CnpjCpf))
            {
                return (false, "Fornecedor deve ter CNPJ ou CPF");
            }

            var documentoLimpo = DocumentValidator.RemoverFormatacao(dto.CnpjCpf);
            var isPessoaJuridica = dto.TipoPessoa?.ToUpper() == "J";

            // ✅ VALIDAÇÃO DE CNPJ (Backend valida, não confia no frontend!)
            if (isPessoaJuridica)
            {
                if (documentoLimpo.Length != 14)
                {
                    return (false, "CNPJ deve ter 14 dígitos");
                }

                if (!DocumentValidator.ValidarCnpj(dto.CnpjCpf))
                {
                    return (false, "CNPJ inválido");
                }

                var cnpjExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cnpj == documentoLimpo);

                if (cnpjExists)
                {
                    return (false, "CNPJ já cadastrado para outro fornecedor");
                }
            }
            // ✅ VALIDAÇÃO DE CPF (Backend valida, não confia no frontend!)
            else
            {
                if (documentoLimpo.Length != 11)
                {
                    return (false, "CPF deve ter 11 dígitos");
                }

                if (!DocumentValidator.ValidarCpf(dto.CnpjCpf))
                {
                    return (false, "CPF inválido");
                }

                var cpfExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cpf == documentoLimpo);

                if (cpfExists)
                {
                    return (false, "CPF já cadastrado para outro fornecedor");
                }
            }

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var emailExists = await _context.Fornecedores
                    .AnyAsync(f => f.Email == dto.Email);

                if (emailExists)
                {
                    return (false, "Email já cadastrado para outro fornecedor");
                }
            }

            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Fornecedor entity, FornecedorUpdateDto dto)
        {
            // Deve ter CnpjCpf
            if (string.IsNullOrEmpty(dto.CnpjCpf))
            {
                return (false, "Fornecedor deve ter CNPJ ou CPF");
            }

            var documentoLimpo = DocumentValidator.RemoverFormatacao(dto.CnpjCpf);
            var isPessoaJuridica = dto.TipoPessoa?.ToUpper() == "J";

            // ✅ VALIDAÇÃO DE CNPJ (Backend valida, não confia no frontend!)
            if (isPessoaJuridica)
            {
                if (documentoLimpo.Length != 14)
                {
                    return (false, "CNPJ deve ter 14 dígitos");
                }

                if (!DocumentValidator.ValidarCnpj(dto.CnpjCpf))
                {
                    return (false, "CNPJ inválido");
                }

                var cnpjExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cnpj == documentoLimpo && f.Id != entity.Id);

                if (cnpjExists)
                {
                    return (false, "CNPJ já cadastrado para outro fornecedor");
                }
            }
            // ✅ VALIDAÇÃO DE CPF (Backend valida, não confia no frontend!)
            else
            {
                if (documentoLimpo.Length != 11)
                {
                    return (false, "CPF deve ter 11 dígitos");
                }

                if (!DocumentValidator.ValidarCpf(dto.CnpjCpf))
                {
                    return (false, "CPF inválido");
                }

                var cpfExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cpf == documentoLimpo && f.Id != entity.Id);

                if (cpfExists)
                {
                    return (false, "CPF já cadastrado para outro fornecedor");
                }
            }

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var emailExists = await _context.Fornecedores
                    .AnyAsync(f => f.Email == dto.Email && f.Id != entity.Id);

                if (emailExists)
                {
                    return (false, "Email já cadastrado para outro fornecedor");
                }
            }

            return (true, string.Empty);
        }
    }
}
