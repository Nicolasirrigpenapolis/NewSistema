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
    public class VeiculosController : BaseController<Veiculo, VeiculoListDto, VeiculoResponseDto, VeiculoCreateDto, VeiculoUpdateDto>
    {
        public VeiculosController(
            SistemaContext context,
            ILogger<VeiculosController> logger,
            ICacheService cacheService)
            : base(context, logger, cacheService)
        {
        }

        protected override DbSet<Veiculo> GetDbSet() => _context.Veiculos;

        protected override VeiculoListDto EntityToListDto(Veiculo entity)
        {
            return new VeiculoListDto
            {
                Id = entity.Id,
                Placa = entity.Placa,
                Marca = entity.Marca,
                Tara = entity.Tara,
                TipoRodado = entity.TipoRodado,
                TipoCarroceria = entity.TipoCarroceria,
                Uf = entity.Uf,
                Ativo = entity.Ativo
            };
        }

        protected override VeiculoResponseDto EntityToDetailDto(Veiculo entity)
        {
            return new VeiculoResponseDto
            {
                Id = entity.Id,
                Placa = entity.Placa,
                Marca = entity.Marca,
                Tara = entity.Tara,
                TipoRodado = entity.TipoRodado,
                TipoCarroceria = entity.TipoCarroceria,
                Uf = entity.Uf,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override Veiculo CreateDtoToEntity(VeiculoCreateDto dto)
        {
            var veiculo = new Veiculo
            {
                Placa = dto.Placa,
                Marca = dto.Marca?.Trim() ?? string.Empty,
                Tara = dto.Tara,
                TipoRodado = dto.TipoRodado?.Trim() ?? string.Empty,
                TipoCarroceria = dto.TipoCarroceria?.Trim() ?? string.Empty,
                Uf = dto.Uf?.Trim() ?? string.Empty
            };

            // Aplicar limpeza automática de documentos
            DocumentUtils.LimparDocumentosVeiculo(veiculo);
            return veiculo;
        }

        protected override void UpdateEntityFromDto(Veiculo entity, VeiculoUpdateDto dto)
        {
            entity.Placa = dto.Placa;
            entity.Marca = dto.Marca?.Trim() ?? string.Empty;
            entity.Tara = dto.Tara;
            entity.TipoRodado = dto.TipoRodado?.Trim() ?? string.Empty;
            entity.TipoCarroceria = dto.TipoCarroceria?.Trim() ?? string.Empty;
            entity.Uf = dto.Uf?.Trim() ?? string.Empty;

            // Aplicar limpeza automática de documentos
            DocumentUtils.LimparDocumentosVeiculo(entity);
        }

        protected override IQueryable<Veiculo> ApplySearchFilter(IQueryable<Veiculo> query, string search)
        {
            var searchTerm = search.ToLower();
            return query.Where(v =>
                (v.Placa != null && v.Placa.ToLower().Contains(searchTerm))
            );
        }

        protected override IQueryable<Veiculo> ApplyOrdering(IQueryable<Veiculo> query, string? sortBy, string? sortDirection)
        {
            var isDesc = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "tara" => isDesc ? query.OrderByDescending(v => v.Tara) : query.OrderBy(v => v.Tara),
                "uf" => isDesc ? query.OrderByDescending(v => v.Uf) : query.OrderBy(v => v.Uf),
                "datacriacao" => isDesc ? query.OrderByDescending(v => v.DataCriacao) : query.OrderBy(v => v.DataCriacao),
                _ => isDesc ? query.OrderByDescending(v => v.Placa) : query.OrderBy(v => v.Placa)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Veiculo entity)
        {
            var temMdfe = await _context.MDFes.AnyAsync(m => m.VeiculoId == entity.Id);
            if (temMdfe)
            {
                return (false, "Não é possível excluir veículo com MDF-e vinculados");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(VeiculoCreateDto dto)
        {
            var veiculo = new Veiculo { Placa = dto.Placa };
            DocumentUtils.LimparDocumentosVeiculo(veiculo);

            var existingPlaca = await _context.Veiculos
                .AnyAsync(v => v.Placa == veiculo.Placa && v.Ativo);
            if (existingPlaca)
            {
                return (false, "Placa já cadastrada");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Veiculo entity, VeiculoUpdateDto dto)
        {
            var placaOriginal = entity.Placa;
            var veiculoTemp = new Veiculo { Placa = dto.Placa };
            DocumentUtils.LimparDocumentosVeiculo(veiculoTemp);

            if (veiculoTemp.Placa != placaOriginal)
            {
                var existingPlaca = await _context.Veiculos
                    .AnyAsync(v => v.Placa == veiculoTemp.Placa && v.Id != entity.Id && v.Ativo);
                if (existingPlaca)
                {
                    return (false, "Placa já cadastrada");
                }
            }
            return (true, string.Empty);
        }
    }
}
