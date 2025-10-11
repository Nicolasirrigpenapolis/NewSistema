using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.DTOs;
using Backend.Api.Utils;
using Backend.Api.Services;

namespace Backend.Api.Controllers
{
    [Route("api/[controller]")]
    public class CondutoresController : BaseController<Condutor, CondutorListDto, CondutorResponseDto, CondutorCreateDto, CondutorUpdateDto>
    {
        public CondutoresController(
            SistemaContext context,
            ILogger<CondutoresController> logger,
            ICacheService cacheService)
            : base(context, logger, cacheService)
        {
        }

        protected override DbSet<Condutor> GetDbSet() => _context.Condutores;

        protected override CondutorListDto EntityToListDto(Condutor entity)
        {
            return new CondutorListDto
            {
                Id = entity.Id,
                Nome = entity.Nome,
                Cpf = entity.Cpf,
                Ativo = entity.Ativo
            };
        }

        protected override CondutorResponseDto EntityToDetailDto(Condutor entity)
        {
            return new CondutorResponseDto
            {
                Id = entity.Id,
                Nome = entity.Nome,
                Cpf = entity.Cpf,
                Telefone = entity.Telefone,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override Condutor CreateDtoToEntity(CondutorCreateDto dto)
        {
            return new Condutor
            {
                Nome = DocumentUtils.RemoverAcentos(dto.Nome?.Trim()) ?? string.Empty,
                Cpf = DocumentUtils.LimparCpf(dto.Cpf) ?? string.Empty,
                Telefone = dto.Telefone?.Trim() ?? string.Empty
            };
        }

        protected override void UpdateEntityFromDto(Condutor entity, CondutorUpdateDto dto)
        {
            entity.Nome = DocumentUtils.RemoverAcentos(dto.Nome?.Trim()) ?? string.Empty;
            entity.Cpf = DocumentUtils.LimparCpf(dto.Cpf) ?? string.Empty;
            entity.Telefone = dto.Telefone?.Trim() ?? string.Empty;
        }

        protected override IQueryable<Condutor> ApplySearchFilter(IQueryable<Condutor> query, string search)
        {
            var searchTerm = search.ToLower();
            return query.Where(c =>
                c.Nome.ToLower().Contains(searchTerm) ||
                (c.Cpf != null && c.Cpf.Contains(searchTerm))
            );
        }

        protected override IQueryable<Condutor> ApplyOrdering(IQueryable<Condutor> query, string? sortBy, string? sortDirection)
        {
            var isDesc = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "cpf" => isDesc ? query.OrderByDescending(c => c.Cpf) : query.OrderBy(c => c.Cpf),
                "datacriacao" => isDesc ? query.OrderByDescending(c => c.DataCriacao) : query.OrderBy(c => c.DataCriacao),
                _ => isDesc ? query.OrderByDescending(c => c.Nome) : query.OrderBy(c => c.Nome)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Condutor entity)
        {
            var temMdfe = await _context.MDFes.AnyAsync(m => m.CondutorId == entity.Id);
            if (temMdfe)
            {
                return (false, "Não é possível excluir condutor com MDF-e vinculados");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(CondutorCreateDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.Cpf))
            {
                var cpfLimpo = DocumentUtils.LimparCpf(dto.Cpf);
                var existingCpf = await _context.Condutores
                    .AnyAsync(c => c.Cpf == cpfLimpo && c.Ativo);
                if (existingCpf)
                {
                    return (false, "CPF já cadastrado");
                }
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Condutor entity, CondutorUpdateDto dto)
        {
            var cpfLimpo = DocumentUtils.LimparCpf(dto.Cpf);
            if (!string.IsNullOrWhiteSpace(cpfLimpo) && cpfLimpo != entity.Cpf)
            {
                var existingCpf = await _context.Condutores
                    .AnyAsync(c => c.Cpf == cpfLimpo && c.Id != entity.Id && c.Ativo);
                if (existingCpf)
                {
                    return (false, "CPF já cadastrado");
                }
            }
            return (true, string.Empty);
        }
    }
}
