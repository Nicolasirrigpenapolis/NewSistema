using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;
using Backend.Api.Utils;
using Backend.Api.Services;

namespace Backend.Api.Controllers
{
    [Route("api/[controller]")]
    public class ContratantesController : BaseController<Contratante, ContratanteListDto, ContratanteDetailDto, ContratanteCreateDto, ContratanteUpdateDto>
    {
        public ContratantesController(
            SistemaContext context,
            ILogger<ContratantesController> logger,
            ICacheService cacheService)
            : base(context, logger, cacheService)
        {
        }

        protected override DbSet<Contratante> GetDbSet() => _context.Contratantes;

        protected override ContratanteListDto EntityToListDto(Contratante entity)
        {
            return new ContratanteListDto
            {
                Id = entity.Id,
                Cnpj = entity.Cnpj,
                Cpf = entity.Cpf,
                RazaoSocial = entity.RazaoSocial,
                NomeFantasia = entity.NomeFantasia,
                Endereco = entity.Endereco,
                Numero = entity.Numero,
                Complemento = entity.Complemento,
                Bairro = entity.Bairro,
                CodMunicipio = entity.CodMunicipio,
                Municipio = entity.Municipio,
                Cep = entity.Cep,
                Uf = entity.Uf,
                Telefone = entity.Telefone,
                Email = entity.Email,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override ContratanteDetailDto EntityToDetailDto(Contratante entity)
        {
            return new ContratanteDetailDto
            {
                Id = entity.Id,
                Cnpj = entity.Cnpj,
                Cpf = entity.Cpf,
                RazaoSocial = entity.RazaoSocial,
                NomeFantasia = entity.NomeFantasia,
                Endereco = entity.Endereco,
                Numero = entity.Numero,
                Complemento = entity.Complemento,
                Bairro = entity.Bairro,
                CodMunicipio = entity.CodMunicipio,
                Municipio = entity.Municipio,
                Cep = entity.Cep,
                Uf = entity.Uf,
                Telefone = entity.Telefone,
                Email = entity.Email,
                Ativo = entity.Ativo,
                DataCriacao = entity.DataCriacao,
                DataUltimaAlteracao = entity.DataUltimaAlteracao
            };
        }

        protected override Contratante CreateDtoToEntity(ContratanteCreateDto dto)
        {
            var contratante = new Contratante
            {
                Cnpj = dto.Cnpj?.Trim() ?? string.Empty,
                Cpf = dto.Cpf?.Trim() ?? string.Empty,
                RazaoSocial = dto.RazaoSocial?.Trim() ?? string.Empty,
                NomeFantasia = dto.NomeFantasia?.Trim() ?? string.Empty,
                Endereco = dto.Endereco?.Trim() ?? string.Empty,
                Numero = dto.Numero?.Trim() ?? string.Empty,
                Complemento = dto.Complemento?.Trim() ?? string.Empty,
                Bairro = dto.Bairro?.Trim() ?? string.Empty,
                CodMunicipio = dto.CodMunicipio,
                Municipio = dto.Municipio?.Trim() ?? string.Empty,
                Cep = dto.Cep?.Trim() ?? string.Empty,
                Uf = dto.Uf?.Trim() ?? string.Empty,
                Telefone = dto.Telefone?.Trim() ?? string.Empty,
                Email = dto.Email?.Trim() ?? string.Empty
            };

            DocumentUtils.LimparDocumentosContratante(contratante);
            return contratante;
        }

        protected override void UpdateEntityFromDto(Contratante entity, ContratanteUpdateDto dto)
        {
            entity.Cnpj = dto.Cnpj?.Trim() ?? string.Empty;
            entity.Cpf = dto.Cpf?.Trim() ?? string.Empty;
            entity.RazaoSocial = dto.RazaoSocial?.Trim() ?? string.Empty;
            entity.NomeFantasia = dto.NomeFantasia?.Trim() ?? string.Empty;
            entity.Endereco = dto.Endereco?.Trim() ?? string.Empty;
            entity.Numero = dto.Numero?.Trim() ?? string.Empty;
            entity.Complemento = dto.Complemento?.Trim() ?? string.Empty;
            entity.Bairro = dto.Bairro?.Trim() ?? string.Empty;
            entity.CodMunicipio = dto.CodMunicipio;
            entity.Municipio = dto.Municipio?.Trim() ?? string.Empty;
            entity.Cep = dto.Cep?.Trim() ?? string.Empty;
            entity.Uf = dto.Uf?.Trim() ?? string.Empty;
            entity.Telefone = dto.Telefone?.Trim() ?? string.Empty;
            entity.Email = dto.Email?.Trim() ?? string.Empty;

            DocumentUtils.LimparDocumentosContratante(entity);
        }

        protected override IQueryable<Contratante> ApplySearchFilter(IQueryable<Contratante> query, string search)
        {
            return query.Where(c =>
                c.RazaoSocial.Contains(search) ||
                (c.NomeFantasia != null && c.NomeFantasia.Contains(search)) ||
                (c.Cnpj != null && c.Cnpj.Contains(search)) ||
                (c.Cpf != null && c.Cpf.Contains(search))
            );
        }

        protected override IQueryable<Contratante> ApplyOrdering(IQueryable<Contratante> query, string? sortBy, string? sortDirection)
        {
            var isDesc = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "cnpj" => isDesc ? query.OrderByDescending(c => c.Cnpj) : query.OrderBy(c => c.Cnpj),
                "cpf" => isDesc ? query.OrderByDescending(c => c.Cpf) : query.OrderBy(c => c.Cpf),
                "uf" => isDesc ? query.OrderByDescending(c => c.Uf) : query.OrderBy(c => c.Uf),
                "datacriacao" => isDesc ? query.OrderByDescending(c => c.DataCriacao) : query.OrderBy(c => c.DataCriacao),
                _ => isDesc ? query.OrderByDescending(c => c.RazaoSocial) : query.OrderBy(c => c.RazaoSocial)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Contratante entity)
        {
            var temMdfeVinculado = await _context.MDFes.AnyAsync(m => m.ContratanteId == entity.Id);
            if (temMdfeVinculado)
            {
                return (false, "Não é possível excluir contratante com MDF-e vinculados");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(ContratanteCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Cnpj) && string.IsNullOrEmpty(dto.Cpf))
            {
                return (false, "CNPJ ou CPF é obrigatório");
            }

            var contratanteTemp = new Contratante { Cnpj = dto.Cnpj?.Trim(), Cpf = dto.Cpf?.Trim() };
            DocumentUtils.LimparDocumentosContratante(contratanteTemp);

            var existenteCpfCnpj = await _context.Contratantes
                .AnyAsync(c => (!string.IsNullOrEmpty(contratanteTemp.Cnpj) && c.Cnpj == contratanteTemp.Cnpj) ||
                              (!string.IsNullOrEmpty(contratanteTemp.Cpf) && c.Cpf == contratanteTemp.Cpf));

            if (existenteCpfCnpj)
            {
                return (false, "Já existe um contratante cadastrado com este CNPJ/CPF");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Contratante entity, ContratanteUpdateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Cnpj) && string.IsNullOrEmpty(dto.Cpf))
            {
                return (false, "CNPJ ou CPF é obrigatório");
            }

            var contratanteTemp = new Contratante { Cnpj = dto.Cnpj?.Trim(), Cpf = dto.Cpf?.Trim() };
            DocumentUtils.LimparDocumentosContratante(contratanteTemp);

            var existenteCpfCnpj = await _context.Contratantes
                .AnyAsync(c => c.Id != entity.Id &&
                              ((!string.IsNullOrEmpty(contratanteTemp.Cnpj) && c.Cnpj == contratanteTemp.Cnpj) ||
                               (!string.IsNullOrEmpty(contratanteTemp.Cpf) && c.Cpf == contratanteTemp.Cpf)));

            if (existenteCpfCnpj)
            {
                return (false, "Já existe outro contratante cadastrado com este CNPJ/CPF");
            }
            return (true, string.Empty);
        }
    }
}
