using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.DTOs;
using Backend.Api.Utils;
using Microsoft.AspNetCore.Http;
using Backend.Api.Helpers;
using Backend.Api.Services;
using Backend.Api.Tenancia;
using Microsoft.AspNetCore.StaticFiles;

namespace Backend.Api.Controllers
{
    [Route("api/[controller]")]
    public class EmitentesController : BaseController<Emitente, EmitenteListDto, EmitenteResponseDto, EmitenteCreateDto, EmitenteUpdateDto>
    {
        private readonly IContextoEmpresa _contextoEmpresa;
        private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

        public EmitentesController(
            SistemaContext context,
            ILogger<EmitentesController> logger,
            ICacheService cacheService,
            IContextoEmpresa contextoEmpresa)
            : base(context, logger, cacheService)
        {
            _contextoEmpresa = contextoEmpresa;
        }

        protected override DbSet<Emitente> GetDbSet() => _context.Emitentes;

        protected override EmitenteListDto EntityToListDto(Emitente entity)
        {
            return new EmitenteListDto
            {
                Id = entity.Id,
                RazaoSocial = entity.RazaoSocial,
                NomeFantasia = entity.NomeFantasia,
                Cnpj = entity.Cnpj,
                Cpf = entity.Cpf,
                Ie = entity.Ie,
                Endereco = entity.Endereco,
                Numero = entity.Numero,
                Complemento = entity.Complemento,
                Bairro = entity.Bairro,
                CodMunicipio = entity.CodMunicipio,
                Municipio = entity.Municipio,
                Cep = entity.Cep,
                TipoEmitente = entity.TipoEmitente,
                Uf = entity.Uf,
                Ativo = entity.Ativo,
                CaminhoLogotipo = entity.CaminhoLogotipo,
                CaminhoCertificadoDigital = entity.CaminhoCertificadoDigital
            };
        }

        protected override EmitenteResponseDto EntityToDetailDto(Emitente entity)
        {
            return new EmitenteResponseDto
            {
                Id = entity.Id,
                Cnpj = entity.Cnpj,
                Cpf = entity.Cpf,
                Ie = entity.Ie,
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
                TipoEmitente = entity.TipoEmitente,
                CaminhoSalvarXml = entity.CaminhoSalvarXml,
                Rntrc = entity.Rntrc,
                CaminhoLogotipo = entity.CaminhoLogotipo,
                CaminhoCertificadoDigital = entity.CaminhoCertificadoDigital,
                SenhaCertificadoDigital = entity.SenhaCertificadoDigital,
                SerieInicial = entity.SerieInicial,
                TipoTransportador = entity.TipoTransportador,
                ModalTransporte = entity.ModalTransporte,
                DataCriacao = entity.DataCriacao,
                DataAtualizacao = entity.DataUltimaAlteracao
            };
        }

        protected override Emitente CreateDtoToEntity(EmitenteCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RazaoSocial)) throw new ArgumentException("RazaoSocial obrigatoria");
            if (string.IsNullOrWhiteSpace(dto.Endereco)) throw new ArgumentException("Endereco obrigatorio");
            if (string.IsNullOrWhiteSpace(dto.Bairro)) throw new ArgumentException("Bairro obrigatorio");
            if (string.IsNullOrWhiteSpace(dto.Municipio)) throw new ArgumentException("Municipio obrigatorio");
            if (string.IsNullOrWhiteSpace(dto.Cep)) throw new ArgumentException("Cep obrigatorio");
            if (string.IsNullOrWhiteSpace(dto.Uf)) throw new ArgumentException("Uf obrigatoria");

            var emitente = new Emitente
            {
                Cnpj = dto.Cnpj?.Trim(),
                Cpf = dto.Cpf?.Trim(),
                Ie = dto.Ie?.Trim(),
                RazaoSocial = dto.RazaoSocial.Trim(),
                NomeFantasia = dto.NomeFantasia?.Trim(),
                Endereco = dto.Endereco.Trim(),
                Numero = dto.Numero?.Trim(),
                Complemento = dto.Complemento?.Trim(),
                Bairro = dto.Bairro.Trim(),
                CodMunicipio = dto.CodMunicipio,
                Municipio = dto.Municipio.Trim(),
                Cep = dto.Cep.Trim(),
                Uf = dto.Uf.Trim(),
                Telefone = dto.Telefone?.Trim(),
                Email = dto.Email?.Trim(),
                TipoEmitente = dto.TipoEmitente?.Trim(),
                CaminhoSalvarXml = string.IsNullOrWhiteSpace(dto.CaminhoSalvarXml) ? null : dto.CaminhoSalvarXml.Trim(),
                Rntrc = dto.Rntrc?.Trim(),
                CaminhoLogotipo = dto.CaminhoLogotipo?.Trim(),
                CaminhoCertificadoDigital = string.IsNullOrWhiteSpace(dto.CaminhoCertificadoDigital) ? null : dto.CaminhoCertificadoDigital.Trim(),
                SenhaCertificadoDigital = dto.SenhaCertificadoDigital?.Trim(),
                SerieInicial = dto.SerieInicial,
                TipoTransportador = dto.TipoTransportador,
                ModalTransporte = dto.ModalTransporte,
                Ativo = dto.Ativo
            };

            // Aplicar limpeza automÃ¡tica de documentos
            DocumentUtils.LimparDocumentosEmitente(emitente);
            return emitente;
        }

        protected override void UpdateEntityFromDto(Emitente entity, EmitenteUpdateDto dto)
        {
            entity.Cnpj = dto.Cnpj?.Trim();
            entity.Cpf = dto.Cpf?.Trim();
            entity.Ie = dto.Ie?.Trim();
            if (!string.IsNullOrWhiteSpace(dto.RazaoSocial)) entity.RazaoSocial = dto.RazaoSocial.Trim();
            entity.NomeFantasia = dto.NomeFantasia?.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Endereco)) entity.Endereco = dto.Endereco.Trim();
            entity.Numero = dto.Numero?.Trim();
            entity.Complemento = dto.Complemento?.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Bairro)) entity.Bairro = dto.Bairro.Trim();
            entity.CodMunicipio = dto.CodMunicipio;
            if (!string.IsNullOrWhiteSpace(dto.Municipio)) entity.Municipio = dto.Municipio.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Cep)) entity.Cep = dto.Cep.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Uf)) entity.Uf = dto.Uf.Trim();
            entity.Telefone = dto.Telefone?.Trim();
            entity.Email = dto.Email?.Trim();
            entity.TipoEmitente = string.IsNullOrWhiteSpace(dto.TipoEmitente) ? entity.TipoEmitente : dto.TipoEmitente.Trim();
            entity.CaminhoSalvarXml = string.IsNullOrWhiteSpace(dto.CaminhoSalvarXml) ? null : dto.CaminhoSalvarXml.Trim();
            entity.Rntrc = dto.Rntrc?.Trim();
            entity.CaminhoLogotipo = string.IsNullOrWhiteSpace(dto.CaminhoLogotipo) ? entity.CaminhoLogotipo : dto.CaminhoLogotipo.Trim();
            entity.CaminhoCertificadoDigital = string.IsNullOrWhiteSpace(dto.CaminhoCertificadoDigital) ? entity.CaminhoCertificadoDigital : dto.CaminhoCertificadoDigital.Trim();
            entity.SenhaCertificadoDigital = dto.SenhaCertificadoDigital?.Trim();
            entity.SerieInicial = dto.SerieInicial;
            entity.TipoTransportador = dto.TipoTransportador;
            entity.ModalTransporte = dto.ModalTransporte;
            entity.Ativo = dto.Ativo; // Atualizar status ativo tambÃ©m

            // Aplicar limpeza automÃ¡tica de documentos
            DocumentUtils.LimparDocumentosEmitente(entity);
        }

        [HttpPost("logotipo")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> EnviarLogotipo([FromForm] IFormFile arquivo)
        {
            if (arquivo == null || arquivo.Length == 0)
            {
                return BadRequest(new { mensagem = "Selecione um arquivo de imagem válido." });
            }

            var extensao = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
            var formatosPermitidos = new[] { ".png", ".jpg", ".jpeg", ".svg" };
            if (!formatosPermitidos.Contains(extensao))
            {
                return BadRequest(new { mensagem = "Formato de imagem não suportado. Utilize PNG, JPG ou SVG." });
            }

            const long tamanhoMaximo = 5 * 1024 * 1024;
            if (arquivo.Length > tamanhoMaximo)
            {
                return BadRequest(new { mensagem = "O logotipo deve ter no máximo 5 MB." });
            }

            var emitente = await _context.Emitentes.FirstOrDefaultAsync();
            if (emitente == null)
            {
                return BadRequest(new { mensagem = "Configure o emitente antes de enviar o logotipo." });
            }

            var pastaLogos = Path.Combine(_contextoEmpresa.Armazenamento.CaminhoBase, _contextoEmpresa.Armazenamento.PastaLogos);
            Directory.CreateDirectory(pastaLogos);

            var nomeArquivo = $"{_contextoEmpresa.IdentificadorEmpresa}-logotipo{extensao}";
            var caminhoFisico = Path.Combine(pastaLogos, nomeArquivo);

            using (var stream = System.IO.File.Create(caminhoFisico))
            {
                await arquivo.CopyToAsync(stream);
            }

            emitente.CaminhoLogotipo = nomeArquivo;
            emitente.DataUltimaAlteracao = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _cacheService?.RemoveByPrefix(GetCacheKeyPrefix());

            return Ok(new { mensagem = "Logotipo atualizado com sucesso.", arquivo = nomeArquivo });
        }

        [HttpGet("logotipo")]
                [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Client)]
        public async Task<IActionResult> ObterLogotipo()
        {
            var nomeArquivo = await _context.Emitentes
                .AsNoTracking()
                .Select(e => e.CaminhoLogotipo)
                .FirstOrDefaultAsync();

            if (string.IsNullOrWhiteSpace(nomeArquivo))
            {
                return NotFound();
            }

            var pastaLogos = Path.Combine(_contextoEmpresa.Armazenamento.CaminhoBase, _contextoEmpresa.Armazenamento.PastaLogos);
            var caminhoFisico = Path.Combine(pastaLogos, nomeArquivo);

            if (!System.IO.File.Exists(caminhoFisico))
            {
                return NotFound();
            }

            if (!_contentTypeProvider.TryGetContentType(nomeArquivo, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            Response.Headers["Cache-Control"] = "public,max-age=300";
            Response.Headers["ETag"] = $"\"{nomeArquivo}-{System.IO.File.GetLastWriteTimeUtc(caminhoFisico).Ticks}\"";

            return PhysicalFile(caminhoFisico, contentType);
        }

        protected override IQueryable<Emitente> ApplySearchFilter(IQueryable<Emitente> query, string search)
        {
            var searchTerm = search.ToLower();
            return query.Where(e =>
                e.RazaoSocial.ToLower().Contains(searchTerm) ||
                (e.Cnpj != null && e.Cnpj.Contains(searchTerm)) ||
                (e.NomeFantasia != null && e.NomeFantasia.ToLower().Contains(searchTerm)) ||
                (e.Cpf != null && e.Cpf.Contains(searchTerm))
            );
        }

        protected override IQueryable<Emitente> ApplyOrdering(IQueryable<Emitente> query, string? sortBy, string? sortDirection)
        {
            var isDesc = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "cnpj" => isDesc ? query.OrderByDescending(e => e.Cnpj) : query.OrderBy(e => e.Cnpj),
                "cpf" => isDesc ? query.OrderByDescending(e => e.Cpf) : query.OrderBy(e => e.Cpf),
                "uf" => isDesc ? query.OrderByDescending(e => e.Uf) : query.OrderBy(e => e.Uf),
                "tipoemitente" => isDesc ? query.OrderByDescending(e => e.TipoEmitente) : query.OrderBy(e => e.TipoEmitente),
                "datacriacao" => isDesc ? query.OrderByDescending(e => e.DataCriacao) : query.OrderBy(e => e.DataCriacao),
                _ => isDesc ? query.OrderByDescending(e => e.RazaoSocial) : query.OrderBy(e => e.RazaoSocial)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Emitente entity)
        {
            var temMdfe = await _context.MDFes.AnyAsync(m => m.EmitenteId == entity.Id);
            if (temMdfe)
            {
                return (false, "NÃ£o Ã© possÃ­vel excluir emitente com MDF-e vinculados");
            }
            return (true, string.Empty);
        }


        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(EmitenteCreateDto dto)
        {
            if (await _context.Emitentes.AnyAsync())
            {
                return (false, "Já existe um emitente configurado para esta instalação. Utilize a edição do cadastro existente.");
            }

            if (string.IsNullOrEmpty(dto.Cnpj) && string.IsNullOrEmpty(dto.Cpf))
            {
                return (false, "CNPJ ou CPF ? obrigat??rio");
            }

            var emitenteTemp = new Emitente { Cnpj = dto.Cnpj?.Trim(), Cpf = dto.Cpf?.Trim() };
            DocumentUtils.LimparDocumentosEmitente(emitenteTemp);

            var existente = await _context.Emitentes
                .AnyAsync(e => (!string.IsNullOrEmpty(emitenteTemp.Cnpj) && e.Cnpj == emitenteTemp.Cnpj) ||
                              (!string.IsNullOrEmpty(emitenteTemp.Cpf) && e.Cpf == emitenteTemp.Cpf));

            if (existente)
            {
                return (false, "Jo existe um emitente cadastrado com este CNPJ/CPF");
            }

            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Emitente entity, EmitenteUpdateDto dto)
        {
            // Validar se CNPJ ou CPF Ã© obrigatÃ³rio
            if (string.IsNullOrEmpty(dto.Cnpj) && string.IsNullOrEmpty(dto.Cpf))
            {
                return (false, "CNPJ ou CPF Ã© obrigatÃ³rio");
            }

            var emitenteTemp = new Emitente { Cnpj = dto.Cnpj?.Trim(), Cpf = dto.Cpf?.Trim() };
            DocumentUtils.LimparDocumentosEmitente(emitenteTemp);

            // Verificar se jÃ¡ existe outro emitente com mesmo CNPJ ou CPF
            var existente = await _context.Emitentes
                .AnyAsync(e => e.Id != entity.Id &&
                              ((!string.IsNullOrEmpty(emitenteTemp.Cnpj) && e.Cnpj == emitenteTemp.Cnpj) ||
                               (!string.IsNullOrEmpty(emitenteTemp.Cpf) && e.Cpf == emitenteTemp.Cpf)));

            if (existente)
            {
                return (false, "JÃ¡ existe outro emitente cadastrado com este CNPJ/CPF");
            }

            return (true, string.Empty);
        }

    }
}

