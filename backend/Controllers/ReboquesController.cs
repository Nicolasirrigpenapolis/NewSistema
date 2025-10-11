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
    public class ReboquesController : BaseController<Reboque, ReboqueListDto, ReboqueResponseDto, ReboqueCreateDto, ReboqueUpdateDto>
    {
        public ReboquesController(
            SistemaContext context,
            ILogger<ReboquesController> logger,
            ICacheService cacheService)
            : base(context, logger, cacheService)
        {
        }

        protected override DbSet<Reboque> GetDbSet() => _context.Reboques;

        protected override ReboqueListDto EntityToListDto(Reboque entity)
        {
            return new ReboqueListDto
            {
                Id = entity.Id,
                Placa = entity.Placa,
                Tara = entity.Tara,
                TipoRodado = entity.TipoRodado,
                TipoCarroceria = entity.TipoCarroceria,
                Uf = entity.Uf,
                Rntrc = entity.Rntrc,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override ReboqueResponseDto EntityToDetailDto(Reboque entity)
        {
            return new ReboqueResponseDto
            {
                Id = entity.Id,
                Placa = entity.Placa,
                Tara = entity.Tara,
                TipoRodado = entity.TipoRodado,
                TipoCarroceria = entity.TipoCarroceria,
                Uf = entity.Uf,
                Rntrc = entity.Rntrc,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao,
                DataUltimaAlteracao = entity.DataUltimaAlteracao
            };
        }

        protected override Reboque CreateDtoToEntity(ReboqueCreateDto dto)
        {
            var reboque = new Reboque
            {
                Placa = dto.Placa,
                Tara = dto.Tara,
                TipoRodado = dto.TipoRodado.Trim(),
                TipoCarroceria = dto.TipoCarroceria.Trim(),
                Uf = dto.Uf.Trim(),
                Rntrc = dto.Rntrc?.Trim()
            };

            DocumentUtils.LimparDocumentosReboque(reboque);
            return reboque;
        }

        protected override void UpdateEntityFromDto(Reboque entity, ReboqueUpdateDto dto)
        {
            entity.Placa = dto.Placa;
            entity.Tara = dto.Tara;
            entity.TipoRodado = dto.TipoRodado.Trim();
            entity.TipoCarroceria = dto.TipoCarroceria.Trim();
            entity.Uf = dto.Uf.Trim();
            entity.Rntrc = dto.Rntrc?.Trim();

            DocumentUtils.LimparDocumentosReboque(entity);
        }

        protected override IQueryable<Reboque> ApplySearchFilter(IQueryable<Reboque> query, string search)
        {
            var searchTerm = search.ToLower();
            return query.Where(r =>
                (r.Placa != null && r.Placa.ToLower().Contains(searchTerm)) ||
                (r.Rntrc != null && r.Rntrc.ToLower().Contains(searchTerm))
            );
        }

        protected override IQueryable<Reboque> ApplyOrdering(IQueryable<Reboque> query, string? sortBy, string? sortDirection)
        {
            var isDesc = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "tara" => isDesc ? query.OrderByDescending(r => r.Tara) : query.OrderBy(r => r.Tara),
                "uf" => isDesc ? query.OrderByDescending(r => r.Uf) : query.OrderBy(r => r.Uf),
                "datacriacao" => isDesc ? query.OrderByDescending(r => r.DataCriacao) : query.OrderBy(r => r.DataCriacao),
                _ => isDesc ? query.OrderByDescending(r => r.Placa) : query.OrderBy(r => r.Placa)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Reboque entity)
        {
            // Verificar se reboque está sendo usado em algum MDFe
            var temMdfe = await _context.MDFeReboques.AnyAsync(mr => mr.ReboqueId == entity.Id);
            if (temMdfe)
            {
                return (false, "Não é possível excluir reboque com MDF-e vinculados");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(ReboqueCreateDto dto)
        {
            var reboqueTemp = new Reboque { Placa = dto.Placa };
            DocumentUtils.LimparDocumentosReboque(reboqueTemp);

            var existingPlaca = await _context.Reboques
                .AnyAsync(r => r.Placa == reboqueTemp.Placa && r.Ativo);
            if (existingPlaca)
            {
                return (false, "Placa já cadastrada");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Reboque entity, ReboqueUpdateDto dto)
        {
            var placaOriginal = entity.Placa;
            var reboqueTemp = new Reboque { Placa = dto.Placa };
            DocumentUtils.LimparDocumentosReboque(reboqueTemp);

            if (reboqueTemp.Placa != placaOriginal)
            {
                var existingPlaca = await _context.Reboques
                    .AnyAsync(r => r.Placa == reboqueTemp.Placa && r.Id != entity.Id && r.Ativo);
                if (existingPlaca)
                {
                    return (false, "Placa já cadastrada");
                }
            }
            return (true, string.Empty);
        }
    }
}
