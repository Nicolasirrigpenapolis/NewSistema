using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;
using Backend.Api.Utils;
using Backend.Api.Helpers;
using Backend.Api.Services;

namespace Backend.Api.Controllers
{
    [Route("api/[controller]")]
    public class SeguradorasController : BaseController<Seguradora, SeguradoraListDto, SeguradoraDetailDto, SeguradoraCreateDto, SeguradoraUpdateDto>
    {
        public SeguradorasController(
            SistemaContext context,
            ILogger<SeguradorasController> logger,
            ICacheService cacheService)
            : base(context, logger, cacheService)
        {
        }

        protected override DbSet<Seguradora> GetDbSet() => _context.Seguradoras;

        protected override SeguradoraListDto EntityToListDto(Seguradora entity)
        {
            return new SeguradoraListDto
            {
                Id = entity.Id,
                Cnpj = entity.Cnpj,
                RazaoSocial = entity.RazaoSocial,
                NomeFantasia = entity.NomeFantasia,
                Apolice = entity.Apolice,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override SeguradoraDetailDto EntityToDetailDto(Seguradora entity)
        {
            return new SeguradoraDetailDto
            {
                Id = entity.Id,
                Cnpj = entity.Cnpj,
                RazaoSocial = entity.RazaoSocial,
                NomeFantasia = entity.NomeFantasia,
                Apolice = entity.Apolice,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao,
                DataUltimaAlteracao = entity.DataUltimaAlteracao
            };
        }

        protected override Seguradora CreateDtoToEntity(SeguradoraCreateDto dto)
        {
            var seguradora = new Seguradora
            {
                Cnpj = dto.Cnpj,
                RazaoSocial = dto.RazaoSocial.Trim(),
                NomeFantasia = string.IsNullOrWhiteSpace(dto.NomeFantasia) ? null : dto.NomeFantasia.Trim(),
                Apolice = string.IsNullOrWhiteSpace(dto.Apolice) ? null : dto.Apolice.Trim(),
                Ativo = dto.Ativo
            };

            DocumentUtils.LimparDocumentosSeguradora(seguradora);
            return seguradora;
        }

        protected override void UpdateEntityFromDto(Seguradora entity, SeguradoraUpdateDto dto)
        {
            entity.Cnpj = dto.Cnpj;
            entity.RazaoSocial = dto.RazaoSocial.Trim();
            entity.NomeFantasia = string.IsNullOrWhiteSpace(dto.NomeFantasia) ? null : dto.NomeFantasia.Trim();
            entity.Apolice = string.IsNullOrWhiteSpace(dto.Apolice) ? null : dto.Apolice.Trim();
            entity.Ativo = dto.Ativo;

            DocumentUtils.LimparDocumentosSeguradora(entity);
        }

        protected override IQueryable<Seguradora> ApplySearchFilter(IQueryable<Seguradora> query, string search)
        {
            return query.Where(s =>
                s.RazaoSocial.Contains(search) ||
                s.Cnpj.Contains(search) ||
                (s.Apolice != null && s.Apolice.Contains(search))
            );
        }

        protected override IQueryable<Seguradora> ApplyOrdering(IQueryable<Seguradora> query, string? sortBy, string? sortDirection)
        {
            var isDesc = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "cnpj" => isDesc ? query.OrderByDescending(s => s.Cnpj) : query.OrderBy(s => s.Cnpj),
                "datacriacao" => isDesc ? query.OrderByDescending(s => s.DataCriacao) : query.OrderBy(s => s.DataCriacao),
                _ => isDesc ? query.OrderByDescending(s => s.RazaoSocial) : query.OrderBy(s => s.RazaoSocial)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Seguradora entity)
        {
            var temMdfeVinculado = await _context.MDFes.AnyAsync(m => m.SeguradoraId == entity.Id);
            if (temMdfeVinculado)
            {
                return (false, "Não é possível excluir seguradora com MDF-e vinculados");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(SeguradoraCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Cnpj))
            {
                return (false, "CNPJ é obrigatório");
            }

            // OTIMIZADO: Usar DocumentUtils para limpeza consistente
            var cnpjLimpo = DocumentUtils.LimparCnpj(dto.Cnpj);

            // Verificar apenas duplicação (validação de CNPJ é responsabilidade do ValidationController)
            var existenteCnpj = await _context.Seguradoras
                .AnyAsync(s => s.Cnpj == cnpjLimpo);
            if (existenteCnpj)
            {
                return (false, "Já existe uma seguradora cadastrada com este CNPJ");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Seguradora entity, SeguradoraUpdateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Cnpj))
            {
                return (false, "CNPJ é obrigatório");
            }

            // OTIMIZADO: Usar DocumentUtils para limpeza consistente
            var cnpjLimpo = DocumentUtils.LimparCnpj(dto.Cnpj);

            // Verificar apenas duplicação (validação de CNPJ é responsabilidade do ValidationController)
            var existenteCnpj = await _context.Seguradoras
                .AnyAsync(s => s.Id != entity.Id && s.Cnpj == cnpjLimpo);
            if (existenteCnpj)
            {
                return (false, "Já existe outra seguradora cadastrada com este CNPJ");
            }
            return (true, string.Empty);
        }


        // Método personalizado para aceitar wrapper do frontend
        [HttpPost("wrapper")]
        public async Task<ActionResult<SeguradoraDetailDto>> CreateFromWrapper([FromBody] SeguradoraCreateWrapper wrapper)
        {
            return await Create(wrapper.Dto);
        }
    }
}
