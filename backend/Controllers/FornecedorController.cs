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

        protected override DbSet<Fornecedor> GetDbSet()
        {
            return _context.Fornecedores;
        }

        protected override FornecedorListDto EntityToListDto(Fornecedor entity)
        {
            return new FornecedorListDto
            {
                Id = entity.Id,
                Nome = entity.Nome,
                Cnpj = entity.Cnpj,
                Cpf = entity.Cpf,
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

            return new FornecedorDetailDto
            {
                Id = entity.Id,
                Nome = entity.Nome,
                Cnpj = entity.Cnpj,
                Cpf = entity.Cpf,
                Telefone = entity.Telefone,
                Email = entity.Email,
                Endereco = entity.Endereco,
                Cidade = entity.Cidade,
                Uf = entity.Uf,
                Cep = entity.Cep,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao,
                DataUltimaAlteracao = entity.DataUltimaAlteracao,
                TotalManutencoes = totalManutencoes,
                ValorTotalManutencoes = valorTotalManutencoes
            };
        }

        protected override Fornecedor CreateDtoToEntity(FornecedorCreateDto dto)
        {
            return new Fornecedor
            {
                Nome = dto.Nome,
                Cnpj = !string.IsNullOrEmpty(dto.Cnpj) ? DocumentValidator.RemoverFormatacao(dto.Cnpj) : null,
                Cpf = !string.IsNullOrEmpty(dto.Cpf) ? DocumentValidator.RemoverFormatacao(dto.Cpf) : null,
                Telefone = dto.Telefone,
                Email = dto.Email,
                Endereco = dto.Endereco,
                Cidade = dto.Cidade,
                Uf = dto.Uf,
                Cep = dto.Cep,
                Ativo = true,
                DataCriacao = DateTime.Now
            };
        }

        protected override void UpdateEntityFromDto(Fornecedor entity, FornecedorUpdateDto dto)
        {
            entity.Nome = dto.Nome;
            entity.Cnpj = !string.IsNullOrEmpty(dto.Cnpj) ? DocumentValidator.RemoverFormatacao(dto.Cnpj) : null;
            entity.Cpf = !string.IsNullOrEmpty(dto.Cpf) ? DocumentValidator.RemoverFormatacao(dto.Cpf) : null;
            entity.Telefone = dto.Telefone;
            entity.Email = dto.Email;
            entity.Endereco = dto.Endereco;
            entity.Cidade = dto.Cidade;
            entity.Uf = dto.Uf;
            entity.Cep = dto.Cep;
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
            // Deve ter CNPJ ou CPF
            if (string.IsNullOrEmpty(dto.Cnpj) && string.IsNullOrEmpty(dto.Cpf))
            {
                return (false, "Fornecedor deve ter CNPJ ou CPF");
            }

            // ✅ VALIDAÇÃO DE CNPJ (Backend valida, não confia no frontend!)
            if (!string.IsNullOrEmpty(dto.Cnpj))
            {
                if (!DocumentValidator.ValidarCnpj(dto.Cnpj))
                {
                    return (false, "CNPJ inválido");
                }

                // Normalizar CNPJ (remover formatação antes de salvar)
                var cnpjLimpo = DocumentValidator.RemoverFormatacao(dto.Cnpj);

                var cnpjExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cnpj == cnpjLimpo);

                if (cnpjExists)
                {
                    return (false, "CNPJ já cadastrado para outro fornecedor");
                }
            }

            // ✅ VALIDAÇÃO DE CPF (Backend valida, não confia no frontend!)
            if (!string.IsNullOrEmpty(dto.Cpf))
            {
                if (!DocumentValidator.ValidarCpf(dto.Cpf))
                {
                    return (false, "CPF inválido");
                }

                // Normalizar CPF (remover formatação antes de salvar)
                var cpfLimpo = DocumentValidator.RemoverFormatacao(dto.Cpf);

                var cpfExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cpf == cpfLimpo);

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
            // Deve ter CNPJ ou CPF
            if (string.IsNullOrEmpty(dto.Cnpj) && string.IsNullOrEmpty(dto.Cpf))
            {
                return (false, "Fornecedor deve ter CNPJ ou CPF");
            }

            // ✅ VALIDAÇÃO DE CNPJ (Backend valida, não confia no frontend!)
            if (!string.IsNullOrEmpty(dto.Cnpj))
            {
                if (!DocumentValidator.ValidarCnpj(dto.Cnpj))
                {
                    return (false, "CNPJ inválido");
                }

                // Normalizar CNPJ (remover formatação antes de comparar)
                var cnpjLimpo = DocumentValidator.RemoverFormatacao(dto.Cnpj);

                var cnpjExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cnpj == cnpjLimpo && f.Id != entity.Id);

                if (cnpjExists)
                {
                    return (false, "CNPJ já cadastrado para outro fornecedor");
                }
            }

            // ✅ VALIDAÇÃO DE CPF (Backend valida, não confia no frontend!)
            if (!string.IsNullOrEmpty(dto.Cpf))
            {
                if (!DocumentValidator.ValidarCpf(dto.Cpf))
                {
                    return (false, "CPF inválido");
                }

                // Normalizar CPF (remover formatação antes de comparar)
                var cpfLimpo = DocumentValidator.RemoverFormatacao(dto.Cpf);

                var cpfExists = await _context.Fornecedores
                    .AnyAsync(f => f.Cpf == cpfLimpo && f.Id != entity.Id);

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
