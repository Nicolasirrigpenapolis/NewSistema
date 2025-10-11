using System.Linq;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.DTOs;
using Backend.Api.Utils;
using Backend.Api.Constants;
using System.Text.Json;
using Backend.Api.Interfaces;

namespace Backend.Api.Services
{
    public class MDFeBusinessService : IMDFeBusinessService
    {
        private readonly SistemaContext _context;
        private readonly ILogger<MDFeBusinessService> _logger;

        public MDFeBusinessService(SistemaContext context, ILogger<MDFeBusinessService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<MDFeResponseDto>> GetMDFesAsync(int? emitenteId, int pagina, int tamanhoPagina)
        {
            // Para cen�rio simples (apenas filtro de emitente) usamos compiled query base
            IQueryable<MDFe> query;
            if (!emitenteId.HasValue)
            {
                query = _context.MDFes
                    .Include(m => m.Emitente)
                    .Include(m => m.Veiculo)
                    .Include(m => m.Condutor);
            }
            else
            {
                // Usar compiled (stream) e materializar somente p�gina
                var lista = new List<MDFe>();
                await foreach (var m in Data.CompiledQueries.MDFeCompiledQueries.MDFesBase(_context, emitenteId))
                {
                    lista.Add(m);
                }
                query = lista.AsQueryable();
            }

            var totalItens = await query.CountAsync();

            var itens = await query
                .OrderByDescending(m => m.DataEmissao)
                .Skip((pagina - 1) * tamanhoPagina)
                .Take(tamanhoPagina)
                .Select(m => new MDFeResponseDto
                {
                    Id = m.Id,
                    NumeroMdfe = m.NumeroMdfe,
                    Serie = m.Serie,
                    DataEmissao = m.DataEmissao,
                    DataInicioViagem = m.DataInicioViagem,
                    UfIni = m.UfIni ?? null,
                    UfFim = m.UfFim ?? null,
                    MunicipioIni = m.MunicipioIni ?? "",
                    MunicipioFim = m.MunicipioFim ?? "",
                    StatusSefaz = m.StatusSefaz ?? MDFeStatus.Rascunho,
                    ChaveAcesso = m.ChaveAcesso,
                    ValorTotal = m.ValorTotal,
                    PesoBrutoTotal = m.PesoBrutoTotal,
                    InfoAdicional = m.InfoAdicional,
                    Protocolo = m.Protocolo,
                    DataAutorizacao = m.DataAutorizacao,

                    // === CAMPOS CRÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂTICOS PARA CONFORMIDADE MODELOINI.INI ===
                    DhInicioViagem = m.DhInicioViagem,
                    CodigoMunicipioCarregamento = m.CodigoMunicipioCarregamento,
                    NomeMunicipioCarregamento = m.NomeMunicipioCarregamento,
                    CodigoMunicipioDescarregamento = m.CodigoMunicipioDescarregamento,
                    NomeMunicipioDescarregamento = m.NomeMunicipioDescarregamento,
                    CodigoMDF = m.CodigoMDF,

                    // Dados do Emitente (snapshot)
                    EmitenteRazaoSocial = m.EmitenteRazaoSocial ?? (m.Emitente != null ? m.Emitente.RazaoSocial : ""),
                    EmitenteCnpj = m.EmitenteCnpj ?? m.Emitente!.Cnpj,
                    EmitenteUf = m.EmitenteUf ?? m.Emitente!.Uf,

                    // Dados do VeÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­culo (snapshot)
                    VeiculoPlaca = m.VeiculoPlaca ?? (m.Veiculo != null ? m.Veiculo.Placa : null),
                    VeiculoTara = m.VeiculoTara != null ? m.VeiculoTara : (m.Veiculo != null ? m.Veiculo.Tara : (int?)null),
                    VeiculoUf = m.VeiculoUf ?? (m.Veiculo != null ? m.Veiculo.UfLicenciamento : null),

                    // Dados do Condutor (snapshot)
                    CondutorNome = m.CondutorNome ?? (m.Condutor != null ? m.Condutor.Nome : null),
                    CondutorCpf = m.CondutorCpf ?? (m.Condutor != null ? m.Condutor.Cpf : null),

                    // IDs das entidades relacionadas
                    EmitenteId = m.EmitenteId,
                    VeiculoId = m.VeiculoId,
                    CondutorId = m.CondutorId,
                    ContratanteId = m.ContratanteId,
                    SeguradoraId = m.SeguradoraId,

                    // Controle
                    Transmitido = m.Transmitido,
                    Autorizado = m.Autorizado,
                    Encerrado = m.Encerrado,
                    Cancelado = m.Cancelado,
                    DataCriacao = m.DataCriacao,
                    DataUltimaAlteracao = m.DataUltimaAlteracao
                })
                .ToListAsync();

            return new PagedResult<MDFeResponseDto>
            {
                Items = itens,
                TotalItems = totalItens,
                Page = pagina,
                PageSize = tamanhoPagina,
                TotalPages = (int)Math.Ceiling((double)totalItens / tamanhoPagina),
                HasNextPage = pagina * tamanhoPagina < totalItens,
                HasPreviousPage = pagina > 1
            };
        }

        public async Task<MDFe?> GetMDFeByIdAsync(int id)
        {
            return await _context.MDFes
                .Include(m => m.Emitente)
                .Include(m => m.Veiculo)
                .Include(m => m.Condutor)
                .Include(m => m.Contratante)
                .Include(m => m.Seguradora)
                .Include(m => m.Reboques)
                    .ThenInclude(r => r.Reboque)
                .Include(m => m.LocaisCarregamento)
                    .ThenInclude(l => l.Municipio)
                .Include(m => m.LocaisDescarregamento)
                    .ThenInclude(l => l.Municipio)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<bool> DeleteMDFeAsync(int id)
        {
            var mdfe = await _context.MDFes.FindAsync(id);
            if (mdfe == null)
                return false;

            _context.MDFes.Remove(mdfe);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetProximoNumeroAsync(string? emitenteCnpj = null)
        {
            var query = _context.MDFes.AsQueryable();

            if (!string.IsNullOrEmpty(emitenteCnpj))
            {
                query = query.Include(m => m.Emitente)
                    .Where(m => m.Emitente != null && m.Emitente.Cnpj == emitenteCnpj);
            }

            var ultimoNumero = await query
                .OrderByDescending(m => m.NumeroMdfe)
                .Select(m => m.NumeroMdfe)
                .FirstOrDefaultAsync();

            return ultimoNumero + 1;
        }

        public async Task<MDFe> CreateMDFeAsync(MDFeCreateDto mdfeDto)
        {
            if (mdfeDto == null)
                throw new ArgumentException("Dados do MDFe nao foram informados");

            if (!mdfeDto.VeiculoId.HasValue || mdfeDto.VeiculoId.Value <= 0)
                throw new ArgumentException("Veiculo e obrigatorio para salvar o MDFe.");

            if (!mdfeDto.CondutorId.HasValue || mdfeDto.CondutorId.Value <= 0)
                throw new ArgumentException("Condutor e obrigatorio para salvar o MDFe.");

            var emitente = await _context.Emitentes.FindAsync(mdfeDto.EmitenteId)
                ?? throw new ArgumentException("Emitente nao encontrado");

            var condutor = await _context.Condutores.FindAsync(mdfeDto.CondutorId.Value)
                ?? throw new ArgumentException("Condutor nao encontrado");

            var veiculo = await _context.Veiculos.FindAsync(mdfeDto.VeiculoId.Value)
                ?? throw new ArgumentException("Veiculo nao encontrado");

            Contratante? contratante = null;
            if (mdfeDto.ContratanteId.HasValue)
            {
                contratante = await _context.Contratantes.FindAsync(mdfeDto.ContratanteId.Value)
                    ?? throw new ArgumentException("Contratante nao encontrado");
            }

            Seguradora? seguradora = null;
            if (mdfeDto.SeguradoraId.HasValue)
            {
                seguradora = await _context.Seguradoras.FindAsync(mdfeDto.SeguradoraId.Value)
                    ?? throw new ArgumentException("Seguradora nao encontrada");
            }

            var serie = mdfeDto.Serie.HasValue && mdfeDto.Serie.Value > 0
                ? mdfeDto.Serie.Value
                : emitente.SerieInicial;

            var mdfesExistentes = await _context.MDFes
                .Where(m => m.EmitenteId == mdfeDto.EmitenteId && m.Serie == serie)
                .ToListAsync();

            var numeroMdfe = mdfeDto.NumeroMdfe.HasValue && mdfeDto.NumeroMdfe.Value > 0
                ? mdfeDto.NumeroMdfe.Value
                : MDFe.GerarProximoNumero(mdfesExistentes, mdfeDto.EmitenteId, serie);

            var ufIni = !string.IsNullOrWhiteSpace(mdfeDto.UfIni)
                ? mdfeDto.UfIni!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            var ufFim = !string.IsNullOrWhiteSpace(mdfeDto.UfFim)
                ? mdfeDto.UfFim!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            var municipioIni = !string.IsNullOrWhiteSpace(mdfeDto.MunicipioIni)
                ? mdfeDto.MunicipioIni!.Trim()
                : emitente.Municipio;
            var municipioFim = !string.IsNullOrWhiteSpace(mdfeDto.MunicipioFim)
                ? mdfeDto.MunicipioFim!.Trim()
                : emitente.Municipio;

            var mdfe = new MDFe
            {
                NumeroMdfe = numeroMdfe,
                Serie = serie,
                EmitenteId = mdfeDto.EmitenteId,
                CondutorId = mdfeDto.CondutorId,
                VeiculoId = mdfeDto.VeiculoId,
                ContratanteId = mdfeDto.ContratanteId,
                SeguradoraId = mdfeDto.SeguradoraId,
                DataEmissao = mdfeDto.DataEmissao ?? DateTime.Now,
                DataInicioViagem = mdfeDto.DataInicioViagem,
                UfIni = ufIni,
                UfFim = ufFim,
                MunicipioIni = municipioIni,
                MunicipioFim = municipioFim,
                Modal = mdfeDto.Modal ?? emitente.ModalTransporte,
                TipoTransportador = mdfeDto.TipoTransportador ?? emitente.TipoTransportador,
                UnidadeMedida = "01",
                ValorTotal = mdfeDto.ValorTotal ?? 0,
                PesoBrutoTotal = mdfeDto.PesoBrutoTotal ?? 0,
                InfoAdicional = mdfeDto.InfoAdicional,
                TipoCarga = mdfeDto.TipoCarga,
                DescricaoProduto = mdfeDto.DescricaoProduto,
                CepCarregamento = mdfeDto.CepCarregamento,
                CepDescarregamento = mdfeDto.CepDescarregamento,
                DhInicioViagem = mdfeDto.DhInicioViagem ?? mdfeDto.DataInicioViagem ?? DateTime.Now,
                CodigoMunicipioCarregamento = mdfeDto.CodigoMunicipioCarregamento ?? emitente.CodMunicipio,
                NomeMunicipioCarregamento = mdfeDto.NomeMunicipioCarregamento ?? emitente.Municipio,
                CodigoMunicipioDescarregamento = mdfeDto.CodigoMunicipioDescarregamento ?? emitente.CodMunicipio,
                NomeMunicipioDescarregamento = mdfeDto.NomeMunicipioDescarregamento ?? emitente.Municipio,
                CodigoMDF = mdfeDto.CodigoMDF,
                DataCriacao = DateTime.Now,
                Emitente = emitente,
                Condutor = condutor,
                Veiculo = veiculo,
                Contratante = contratante,
                Seguradora = seguradora
            };

            mdfe.DocumentosCTeJson = SerializarStrings(mdfeDto.DocumentosCTe, out var quantidadeCte);
            mdfe.QuantidadeCTe = quantidadeCte;
            mdfe.DocumentosNFeJson = SerializarStrings(mdfeDto.DocumentosNFe, out var quantidadeNfe);
            mdfe.QuantidadeNFe = quantidadeNfe;
            mdfe.LocalidadesCarregamentoJson = SerializarObjetos(mdfeDto.LocalidadesCarregamento);
            mdfe.LocalidadesDescarregamentoJson = SerializarObjetos(mdfeDto.LocalidadesDescarregamento);
            mdfe.RotaPercursoJson = SerializarStrings(mdfeDto.RotaPercurso);
            AtualizarLocalidadesPrincipais(mdfe);

            AplicarValesPedagio(mdfe, mdfeDto.ValesPedagio, mdfeDto.SemValePedagio);
            AplicarPagamento(mdfe, mdfeDto.Pagamento);
            AplicarAutorizadosXml(mdfe, mdfeDto.AutorizadosXml);
            AplicarResponsavelTecnico(mdfe, mdfeDto.ResponsavelTecnico);
            AplicarUnidades(mdfe, mdfeDto.UnidadesTransporte, mdfeDto.UnidadesCarga);
            AplicarProdutosPerigosos(mdfe, mdfeDto.ProdutosPerigosos);

            mdfe.CriarSnapshotsEntidades();
            mdfe.RegistrarStatus(MDFeStatus.Rascunho, "Criacao de MDFe");
            mdfe.GerarChaveAcesso();

            if (mdfeDto.ReboquesIds != null && mdfeDto.ReboquesIds.Count > 0)
            {
                var reboques = await MapearReboquesAsync(mdfeDto.ReboquesIds);
                foreach (var reboque in reboques)
                {
                    reboque.MDFe = mdfe;
                    mdfe.Reboques.Add(reboque);
                }
            }

            _context.MDFes.Add(mdfe);
            await _context.SaveChangesAsync();

            _logger.LogInformation("MDFe {NumeroMdfe} criado com sucesso para emitente {EmitenteId}.", mdfe.NumeroMdfe, mdfe.EmitenteId);

            return mdfe;
        }


        public async Task<MDFe?> UpdateMDFeAsync(int id, MDFeCreateDto mdfeDto)
        {
            var mdfe = await _context.MDFes
                .Include(m => m.Reboques)
                .Include(m => m.LocaisCarregamento)
                .Include(m => m.LocaisDescarregamento)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mdfe == null)
                return null;

            if (!mdfeDto.VeiculoId.HasValue || mdfeDto.VeiculoId.Value <= 0)
                throw new ArgumentException("Veiculo e obrigatorio para salvar o MDFe.");

            if (!mdfeDto.CondutorId.HasValue || mdfeDto.CondutorId.Value <= 0)
                throw new ArgumentException("Condutor e obrigatorio para salvar o MDFe.");

            var emitente = await _context.Emitentes.FindAsync(mdfeDto.EmitenteId)
                ?? throw new ArgumentException("Emitente nao encontrado");

            var condutor = await _context.Condutores.FindAsync(mdfeDto.CondutorId.Value)
                ?? throw new ArgumentException("Condutor nao encontrado");

            var veiculo = await _context.Veiculos.FindAsync(mdfeDto.VeiculoId.Value)
                ?? throw new ArgumentException("Veiculo nao encontrado");

            Contratante? contratante = null;
            if (mdfeDto.ContratanteId.HasValue)
            {
                contratante = await _context.Contratantes.FindAsync(mdfeDto.ContratanteId.Value)
                    ?? throw new ArgumentException("Contratante nao encontrado");
            }

            Seguradora? seguradora = null;
            if (mdfeDto.SeguradoraId.HasValue)
            {
                seguradora = await _context.Seguradoras.FindAsync(mdfeDto.SeguradoraId.Value)
                    ?? throw new ArgumentException("Seguradora nao encontrada");
            }

            var ufIni = !string.IsNullOrWhiteSpace(mdfeDto.UfIni)
                ? mdfeDto.UfIni!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            var ufFim = !string.IsNullOrWhiteSpace(mdfeDto.UfFim)
                ? mdfeDto.UfFim!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            var municipioIni = !string.IsNullOrWhiteSpace(mdfeDto.MunicipioIni)
                ? mdfeDto.MunicipioIni!.Trim()
                : emitente.Municipio;
            var municipioFim = !string.IsNullOrWhiteSpace(mdfeDto.MunicipioFim)
                ? mdfeDto.MunicipioFim!.Trim()
                : emitente.Municipio;

            mdfe.EmitenteId = mdfeDto.EmitenteId;
            mdfe.CondutorId = mdfeDto.CondutorId;
            mdfe.VeiculoId = mdfeDto.VeiculoId;
            mdfe.ContratanteId = mdfeDto.ContratanteId;
            mdfe.SeguradoraId = mdfeDto.SeguradoraId;
            if (mdfeDto.Serie.HasValue && mdfeDto.Serie.Value > 0)
                mdfe.Serie = mdfeDto.Serie.Value;
            if (mdfeDto.NumeroMdfe.HasValue && mdfeDto.NumeroMdfe.Value > 0)
                mdfe.NumeroMdfe = mdfeDto.NumeroMdfe.Value;

            mdfe.UfIni = ufIni;
            mdfe.UfFim = ufFim;
            mdfe.MunicipioIni = municipioIni;
            mdfe.MunicipioFim = municipioFim;
            mdfe.DataEmissao = mdfeDto.DataEmissao ?? mdfe.DataEmissao;
            mdfe.DataInicioViagem = mdfeDto.DataInicioViagem ?? mdfe.DataInicioViagem;
            mdfe.Modal = mdfeDto.Modal ?? emitente.ModalTransporte;
            mdfe.TipoTransportador = mdfeDto.TipoTransportador ?? emitente.TipoTransportador;
            mdfe.ValorTotal = mdfeDto.ValorTotal ?? mdfe.ValorTotal;
            mdfe.PesoBrutoTotal = mdfeDto.PesoBrutoTotal ?? mdfe.PesoBrutoTotal;
            mdfe.InfoAdicional = mdfeDto.InfoAdicional;
            mdfe.TipoCarga = mdfeDto.TipoCarga;
            mdfe.DescricaoProduto = mdfeDto.DescricaoProduto;
            mdfe.CepCarregamento = mdfeDto.CepCarregamento;
            mdfe.CepDescarregamento = mdfeDto.CepDescarregamento;
            mdfe.DhInicioViagem = mdfeDto.DhInicioViagem ?? mdfeDto.DataInicioViagem ?? mdfe.DhInicioViagem;
            mdfe.CodigoMunicipioCarregamento = mdfeDto.CodigoMunicipioCarregamento ?? mdfe.CodigoMunicipioCarregamento ?? emitente.CodMunicipio;
            mdfe.NomeMunicipioCarregamento = mdfeDto.NomeMunicipioCarregamento ?? mdfe.NomeMunicipioCarregamento ?? emitente.Municipio;
            mdfe.CodigoMunicipioDescarregamento = mdfeDto.CodigoMunicipioDescarregamento ?? mdfe.CodigoMunicipioDescarregamento ?? emitente.CodMunicipio;
            mdfe.NomeMunicipioDescarregamento = mdfeDto.NomeMunicipioDescarregamento ?? mdfe.NomeMunicipioDescarregamento ?? emitente.Municipio;
            mdfe.CodigoMDF = mdfeDto.CodigoMDF ?? mdfe.CodigoMDF;

            mdfe.DocumentosCTeJson = SerializarStrings(mdfeDto.DocumentosCTe, out var quantidadeCte);
            mdfe.QuantidadeCTe = quantidadeCte;
            mdfe.DocumentosNFeJson = SerializarStrings(mdfeDto.DocumentosNFe, out var quantidadeNfe);
            mdfe.QuantidadeNFe = quantidadeNfe;
            mdfe.LocalidadesCarregamentoJson = SerializarObjetos(mdfeDto.LocalidadesCarregamento);
            mdfe.LocalidadesDescarregamentoJson = SerializarObjetos(mdfeDto.LocalidadesDescarregamento);
            AplicarValesPedagio(mdfe, mdfeDto.ValesPedagio, mdfeDto.SemValePedagio);

            AplicarPagamento(mdfe, mdfeDto.Pagamento);

            AplicarAutorizadosXml(mdfe, mdfeDto.AutorizadosXml);

            AplicarResponsavelTecnico(mdfe, mdfeDto.ResponsavelTecnico);

            AplicarUnidades(mdfe, mdfeDto.UnidadesTransporte, mdfeDto.UnidadesCarga);

            AplicarProdutosPerigosos(mdfe, mdfeDto.ProdutosPerigosos);



            mdfe.RotaPercursoJson = SerializarStrings(mdfeDto.RotaPercurso);
            AtualizarLocalidadesPrincipais(mdfe);

            mdfe.Emitente = emitente;
            mdfe.Condutor = condutor;
            mdfe.Veiculo = veiculo;
            mdfe.Contratante = contratante;
            mdfe.Seguradora = seguradora;

            mdfe.CriarSnapshotsEntidades();
            await AtualizarReboquesAsync(mdfe, mdfeDto.ReboquesIds);
            await AtualizarLocalidadesAsync(mdfe, mdfeDto.LocalidadesCarregamento, mdfeDto.LocalidadesDescarregamento);

            mdfe.DataUltimaAlteracao = DateTime.Now;

            await _context.SaveChangesAsync();

            _logger.LogInformation("MDFe {NumeroMdfe} atualizado com sucesso", mdfe.NumeroMdfe);

            return mdfe;
        }


        public async Task<MDFe> SalvarRascunhoAsync(SalvarRascunhoDto rascunhoDto)
        {
            if (rascunhoDto.Id.HasValue && rascunhoDto.Id > 0)
            {
                // UPDATE - Rascunho existente
                return await UpdateRascunhoAsync(rascunhoDto.Id.Value, rascunhoDto);
            }
            else
            {
                // CREATE - Novo rascunho
                return await CreateRascunhoAsync(rascunhoDto);
            }
        }

        private async Task<MDFe> CreateRascunhoAsync(SalvarRascunhoDto rascunhoDto)
        {
            var emitente = await _context.Emitentes.FindAsync(rascunhoDto.EmitenteId)
                ?? throw new ArgumentException("Emitente nao encontrado");

            Models.Condutor? condutor = null;
            if (rascunhoDto.CondutorId.HasValue)
            {
                condutor = await _context.Condutores.FindAsync(rascunhoDto.CondutorId.Value);
            }

            Models.Veiculo? veiculo = null;
            if (rascunhoDto.VeiculoId.HasValue)
            {
                veiculo = await _context.Veiculos.FindAsync(rascunhoDto.VeiculoId.Value);
            }

            Models.Contratante? contratante = null;
            if (rascunhoDto.ContratanteId.HasValue)
            {
                contratante = await _context.Contratantes.FindAsync(rascunhoDto.ContratanteId.Value);
            }

            Models.Seguradora? seguradora = null;
            if (rascunhoDto.SeguradoraId.HasValue)
            {
                seguradora = await _context.Seguradoras.FindAsync(rascunhoDto.SeguradoraId.Value);
            }

            var serie = rascunhoDto.Serie.HasValue && rascunhoDto.Serie.Value > 0
                ? rascunhoDto.Serie.Value
                : emitente.SerieInicial;

            var mdfesExistentes = await _context.MDFes
                .Where(m => m.EmitenteId == rascunhoDto.EmitenteId && m.Serie == serie)
                .ToListAsync();
            var numeroMdfe = rascunhoDto.NumeroMdfe.HasValue && rascunhoDto.NumeroMdfe.Value > 0
                ? rascunhoDto.NumeroMdfe.Value
                : MDFe.GerarProximoNumero(mdfesExistentes, rascunhoDto.EmitenteId, serie);

            var ufIni = !string.IsNullOrWhiteSpace(rascunhoDto.UfIni)
                ? rascunhoDto.UfIni!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            var ufFim = !string.IsNullOrWhiteSpace(rascunhoDto.UfFim)
                ? rascunhoDto.UfFim!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            var municipioIni = !string.IsNullOrWhiteSpace(rascunhoDto.MunicipioIni)
                ? rascunhoDto.MunicipioIni!.Trim()
                : emitente.Municipio;
            var municipioFim = !string.IsNullOrWhiteSpace(rascunhoDto.MunicipioFim)
                ? rascunhoDto.MunicipioFim!.Trim()
                : emitente.Municipio;

            var mdfe = new MDFe
            {
                NumeroMdfe = numeroMdfe,
                Serie = serie,
                EmitenteId = rascunhoDto.EmitenteId,
                CondutorId = rascunhoDto.CondutorId,
                VeiculoId = rascunhoDto.VeiculoId,
                ContratanteId = rascunhoDto.ContratanteId,
                SeguradoraId = rascunhoDto.SeguradoraId,
                DataEmissao = rascunhoDto.DataEmissao ?? DateTime.Now,
                DataInicioViagem = rascunhoDto.DataInicioViagem,
                DataCriacao = DateTime.Now,
                UfIni = ufIni,
                UfFim = ufFim,
                MunicipioIni = municipioIni,
                MunicipioFim = municipioFim,
                Modal = emitente.ModalTransporte,
                TipoTransportador = emitente.TipoTransportador,
                UnidadeMedida = "01",
                ValorTotal = rascunhoDto.ValorTotal ?? 0,
                PesoBrutoTotal = rascunhoDto.PesoBrutoTotal ?? 0,
                InfoAdicional = rascunhoDto.InfoAdicional,
                TipoCarga = rascunhoDto.TipoCarga,
                DescricaoProduto = rascunhoDto.DescricaoProduto,
                CepCarregamento = rascunhoDto.CepCarregamento,
                CepDescarregamento = rascunhoDto.CepDescarregamento,
                DhInicioViagem = rascunhoDto.DhInicioViagem ?? rascunhoDto.DataInicioViagem,
                CodigoMunicipioCarregamento = rascunhoDto.CodigoMunicipioCarregamento ?? emitente.CodMunicipio,
                NomeMunicipioCarregamento = rascunhoDto.NomeMunicipioCarregamento ?? emitente.Municipio,
                CodigoMunicipioDescarregamento = rascunhoDto.CodigoMunicipioDescarregamento ?? emitente.CodMunicipio,
                NomeMunicipioDescarregamento = rascunhoDto.NomeMunicipioDescarregamento ?? emitente.Municipio,
                CodigoMDF = rascunhoDto.CodigoMDF,
                Emitente = emitente,
                Condutor = condutor,
                Veiculo = veiculo,
                Contratante = contratante,
                Seguradora = seguradora
            };

            mdfe.DocumentosCTeJson = SerializarStrings(rascunhoDto.DocumentosCTe, out var quantidadeCteRascunho);
            mdfe.QuantidadeCTe = quantidadeCteRascunho;
            mdfe.DocumentosNFeJson = SerializarStrings(rascunhoDto.DocumentosNFe, out var quantidadeNfeRascunho);
            mdfe.QuantidadeNFe = quantidadeNfeRascunho;
            mdfe.LocalidadesCarregamentoJson = SerializarObjetos(rascunhoDto.LocalidadesCarregamento);
            mdfe.LocalidadesDescarregamentoJson = SerializarObjetos(rascunhoDto.LocalidadesDescarregamento);
            mdfe.RotaPercursoJson = SerializarStrings(rascunhoDto.RotaPercurso);
            AtualizarLocalidadesPrincipais(mdfe);

            mdfe.CriarSnapshotsEntidades();
            mdfe.GerarChaveAcesso();
            mdfe.RegistrarStatus(MDFeStatus.Rascunho, "Criacao de rascunho");

            if (rascunhoDto.ReboquesIds != null && rascunhoDto.ReboquesIds.Count > 0)
            {
                var reboques = await MapearReboquesAsync(rascunhoDto.ReboquesIds);
                foreach (var reboque in reboques)
                {
                    reboque.MDFe = mdfe;
                    mdfe.Reboques.Add(reboque);
                }
            }

            _context.MDFes.Add(mdfe);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Rascunho MDFe {NumeroMdfe} criado com sucesso para emitente {EmitenteId}.", mdfe.NumeroMdfe, mdfe.EmitenteId);

            return mdfe;
        }


        private async Task<MDFe> UpdateRascunhoAsync(int id, SalvarRascunhoDto rascunhoDto)
        {
            var mdfe = await _context.MDFes
                .Include(m => m.Reboques)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mdfe == null)
                throw new ArgumentException("Rascunho nao encontrado");

            if (mdfe.StatusSefaz != MDFeStatus.Rascunho)
                throw new InvalidOperationException("Apenas MDFe em rascunho podem ser editados");

            var emitente = await _context.Emitentes.FindAsync(rascunhoDto.EmitenteId)
                ?? throw new ArgumentException("Emitente nao encontrado");

            Models.Condutor? condutor = null;
            if (rascunhoDto.CondutorId.HasValue)
            {
                condutor = await _context.Condutores.FindAsync(rascunhoDto.CondutorId.Value);
            }

            Models.Veiculo? veiculo = null;
            if (rascunhoDto.VeiculoId.HasValue)
            {
                veiculo = await _context.Veiculos.FindAsync(rascunhoDto.VeiculoId.Value);
            }

            Models.Contratante? contratante = null;
            if (rascunhoDto.ContratanteId.HasValue)
            {
                contratante = await _context.Contratantes.FindAsync(rascunhoDto.ContratanteId.Value);
            }

            Models.Seguradora? seguradora = null;
            if (rascunhoDto.SeguradoraId.HasValue)
            {
                seguradora = await _context.Seguradoras.FindAsync(rascunhoDto.SeguradoraId.Value);
            }

            mdfe.EmitenteId = rascunhoDto.EmitenteId;
            mdfe.CondutorId = rascunhoDto.CondutorId;
            mdfe.VeiculoId = rascunhoDto.VeiculoId;
            mdfe.ContratanteId = rascunhoDto.ContratanteId;
            mdfe.SeguradoraId = rascunhoDto.SeguradoraId;

            if (rascunhoDto.Serie.HasValue && rascunhoDto.Serie.Value > 0)
                mdfe.Serie = rascunhoDto.Serie.Value;
            if (rascunhoDto.NumeroMdfe.HasValue && rascunhoDto.NumeroMdfe.Value > 0)
                mdfe.NumeroMdfe = rascunhoDto.NumeroMdfe.Value;

            mdfe.DataEmissao = rascunhoDto.DataEmissao ?? mdfe.DataEmissao;
            mdfe.DataInicioViagem = rascunhoDto.DataInicioViagem ?? mdfe.DataInicioViagem;
            mdfe.ValorTotal = rascunhoDto.ValorTotal ?? mdfe.ValorTotal;
            mdfe.PesoBrutoTotal = rascunhoDto.PesoBrutoTotal ?? mdfe.PesoBrutoTotal;
            mdfe.InfoAdicional = rascunhoDto.InfoAdicional;

            mdfe.UfIni = !string.IsNullOrWhiteSpace(rascunhoDto.UfIni)
                ? rascunhoDto.UfIni!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            mdfe.UfFim = !string.IsNullOrWhiteSpace(rascunhoDto.UfFim)
                ? rascunhoDto.UfFim!.Trim().ToUpper()
                : null; // N�o definir valor padr�o - deixar null se n�o informado
            mdfe.MunicipioIni = !string.IsNullOrWhiteSpace(rascunhoDto.MunicipioIni)
                ? rascunhoDto.MunicipioIni!.Trim()
                : emitente.Municipio;
            mdfe.MunicipioFim = !string.IsNullOrWhiteSpace(rascunhoDto.MunicipioFim)
                ? rascunhoDto.MunicipioFim!.Trim()
                : emitente.Municipio;

            mdfe.DhInicioViagem = rascunhoDto.DhInicioViagem ?? rascunhoDto.DataInicioViagem ?? mdfe.DhInicioViagem;
            mdfe.CodigoMunicipioCarregamento = rascunhoDto.CodigoMunicipioCarregamento ?? mdfe.CodigoMunicipioCarregamento ?? emitente.CodMunicipio;
            mdfe.NomeMunicipioCarregamento = rascunhoDto.NomeMunicipioCarregamento ?? mdfe.NomeMunicipioCarregamento ?? emitente.Municipio;
            mdfe.CodigoMunicipioDescarregamento = rascunhoDto.CodigoMunicipioDescarregamento ?? mdfe.CodigoMunicipioDescarregamento ?? emitente.CodMunicipio;
            mdfe.NomeMunicipioDescarregamento = rascunhoDto.NomeMunicipioDescarregamento ?? mdfe.NomeMunicipioDescarregamento ?? emitente.Municipio;
            mdfe.CodigoMDF = rascunhoDto.CodigoMDF ?? mdfe.CodigoMDF;

            mdfe.TipoCarga = rascunhoDto.TipoCarga;
            mdfe.DescricaoProduto = rascunhoDto.DescricaoProduto;
            mdfe.CepCarregamento = rascunhoDto.CepCarregamento;
            mdfe.CepDescarregamento = rascunhoDto.CepDescarregamento;

            mdfe.DocumentosCTeJson = SerializarStrings(rascunhoDto.DocumentosCTe, out var quantidadeCteRascunho);
            mdfe.QuantidadeCTe = quantidadeCteRascunho;
            mdfe.DocumentosNFeJson = SerializarStrings(rascunhoDto.DocumentosNFe, out var quantidadeNfeRascunho);
            mdfe.QuantidadeNFe = quantidadeNfeRascunho;
            mdfe.LocalidadesCarregamentoJson = SerializarObjetos(rascunhoDto.LocalidadesCarregamento);
            mdfe.LocalidadesDescarregamentoJson = SerializarObjetos(rascunhoDto.LocalidadesDescarregamento);
            AplicarValesPedagio(mdfe, rascunhoDto.ValesPedagio, rascunhoDto.SemValePedagio);

            AplicarPagamento(mdfe, rascunhoDto.Pagamento);

            AplicarAutorizadosXml(mdfe, rascunhoDto.AutorizadosXml);

            AplicarResponsavelTecnico(mdfe, rascunhoDto.ResponsavelTecnico);

            AplicarUnidades(mdfe, rascunhoDto.UnidadesTransporte, rascunhoDto.UnidadesCarga);

            AplicarProdutosPerigosos(mdfe, rascunhoDto.ProdutosPerigosos);



            mdfe.RotaPercursoJson = SerializarStrings(rascunhoDto.RotaPercurso);
            AtualizarLocalidadesPrincipais(mdfe);

            mdfe.Emitente = emitente;
            mdfe.Condutor = condutor;
            mdfe.Veiculo = veiculo;
            mdfe.Contratante = contratante;
            mdfe.Seguradora = seguradora;

            mdfe.CriarSnapshotsEntidades();
            mdfe.RegistrarStatus(MDFeStatus.EmEdicao, "Atualizacao de rascunho");
            await AtualizarReboquesAsync(mdfe, rascunhoDto.ReboquesIds);

            mdfe.DataUltimaAlteracao = DateTime.Now;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Rascunho MDFe {NumeroMdfe} atualizado com sucesso", mdfe.NumeroMdfe);

            return mdfe;
        }

        private void AplicarValesPedagio(MDFe mdfe, List<ValePedagioDto>? valesDto, bool semVale)
        {
            mdfe.SemValePedagio = semVale;

            if (mdfe.ValesPedagio.Count > 0)
            {
                _context.MDFeValesPedagio.RemoveRange(mdfe.ValesPedagio);
                mdfe.ValesPedagio.Clear();
            }

            if (valesDto == null || valesDto.Count == 0)
            {
                mdfe.ValesPedagioJson = null;
                return;
            }

            var lista = valesDto
                .Where(v => v != null)
                .Select((v, index) => new MDFeValePedagio
                {
                    CnpjFornecedor = SanitizeDocumento(v!.CnpjFornecedor),
                    CnpjPagador = SanitizeDocumento(string.IsNullOrWhiteSpace(v.CnpjPagador) ? mdfe.ContratanteCnpj ?? mdfe.EmitenteCnpj : v.CnpjPagador),
                    NumeroCompra = LimparTexto(v.NumeroCompra) ?? string.Empty,
                    ValorVale = v.ValorVale ?? 0m,
                    TipoVale = LimparTexto(v.TipoVale) ?? "01",
                    NomeFornecedor = LimparTexto(v.NomeFornecedor),
                    Ordem = index + 1
                })
                .Where(v => !string.IsNullOrEmpty(v.CnpjFornecedor) && !string.IsNullOrEmpty(v.NumeroCompra))
                .ToList();

            foreach (var vale in lista)
            {
                mdfe.ValesPedagio.Add(vale);
            }

            mdfe.ValesPedagioJson = lista.Count == 0
                ? null
                : JsonSerializer.Serialize(lista.Select(v => new
                {
                    v.CnpjFornecedor,
                    v.CnpjPagador,
                    v.NumeroCompra,
                    v.ValorVale,
                    v.TipoVale,
                    v.NomeFornecedor
                }));
        }

        private void AplicarPagamento(MDFe mdfe, PagamentoInfoDto? pagamentoDto)
        {
            if (mdfe.Pagamentos.Count > 0)
            {
                var componentes = mdfe.Pagamentos.SelectMany(p => p.Componentes).ToList();
                if (componentes.Count > 0)
                {
                    _context.MDFePagamentoComponentes.RemoveRange(componentes);
                }

                var prazos = mdfe.Pagamentos.SelectMany(p => p.Prazos).ToList();
                if (prazos.Count > 0)
                {
                    _context.MDFePagamentoPrazos.RemoveRange(prazos);
                }

                var bancos = mdfe.Pagamentos.SelectMany(p => p.DadosBancarios).ToList();
                if (bancos.Count > 0)
                {
                    _context.MDFePagamentoBancos.RemoveRange(bancos);
                }

                _context.MDFePagamentos.RemoveRange(mdfe.Pagamentos);
                mdfe.Pagamentos.Clear();
            }

            if (pagamentoDto == null)
            {
                mdfe.TipoPagamento = null;
                mdfe.ValorTotalContrato = null;
                mdfe.ComponentesPagamentoJson = null;
                return;
            }

            var pagamento = new MDFePagamento
            {
                CnpjCpf = SanitizeDocumento(pagamentoDto.CnpjCpf),
                IdEstrangeiro = LimparTexto(pagamentoDto.IdEstrangeiro),
                Nome = LimparTexto(pagamentoDto.Nome),
                ValorContrato = pagamentoDto.ValorContrato,
                IndicadorPagamento = LimparTexto(pagamentoDto.IndicadorPagamento) ?? "0",
                TipoPagamento = LimparTexto(pagamentoDto.TipoPagamento) ?? "0",
                Observacoes = LimparTexto(pagamentoDto.Observacoes),
                Ordem = 1
            };

            if (pagamentoDto.Componentes != null)
            {
                var ordem = 1;
                foreach (var componenteDto in pagamentoDto.Componentes.Where(c => c != null))
                {
                    var componente = new MDFePagamentoComponente
                    {
                        TipoComponente = LimparTexto(componenteDto.TipoComponente) ?? "01",
                        Valor = componenteDto.Valor,
                        Descricao = LimparTexto(componenteDto.Descricao),
                        Ordem = ordem++
                    };
                    pagamento.Componentes.Add(componente);
                }
            }

            if (pagamentoDto.Prazos != null)
            {
                var ordem = 1;
                foreach (var prazoDto in pagamentoDto.Prazos.Where(p => p != null))
                {
                    pagamento.Prazos.Add(new MDFePagamentoPrazo
                    {
                        NumeroParcela = LimparTexto(prazoDto.NumeroParcela),
                        ValorParcela = prazoDto.ValorParcela,
                        DataVencimento = prazoDto.DataVencimento,
                        Ordem = ordem++
                    });
                }
            }

            if (pagamentoDto.Banco != null && (!string.IsNullOrWhiteSpace(pagamentoDto.Banco.CodigoBanco) || !string.IsNullOrWhiteSpace(pagamentoDto.Banco.CnpjIpef)))
            {
                pagamento.DadosBancarios.Add(new MDFePagamentoBanco
                {
                    CodigoBanco = LimparTexto(pagamentoDto.Banco.CodigoBanco),
                    CodigoAgencia = LimparTexto(pagamentoDto.Banco.CodigoAgencia),
                    CnpjIpef = SanitizeDocumento(pagamentoDto.Banco.CnpjIpef),
                    NumeroContaPagamento = LimparTexto(pagamentoDto.Banco.NumeroContaPagamento),
                    Ordem = 1
                });
            }

            mdfe.Pagamentos.Add(pagamento);
            mdfe.TipoPagamento = pagamento.TipoPagamento;
            mdfe.ValorTotalContrato = pagamento.ValorContrato;
            mdfe.ComponentesPagamentoJson = pagamento.Componentes.Count == 0
                ? null
                : JsonSerializer.Serialize(pagamento.Componentes.Select(c => new
                {
                    c.TipoComponente,
                    c.Valor,
                    c.Descricao
                }));
        }

        private void AplicarAutorizadosXml(MDFe mdfe, IEnumerable<string>? autorizados)
        {
            if (mdfe.AutorizacoesXml.Count > 0)
            {
                _context.MDFeAutorizacoesXml.RemoveRange(mdfe.AutorizacoesXml);
                mdfe.AutorizacoesXml.Clear();
            }

            if (autorizados == null)
            {
                return;
            }

            var ordem = 1;
            foreach (var documento in autorizados
                .Where(a => !string.IsNullOrWhiteSpace(a))
                .Select(SanitizeDocumento)
                .Where(a => !string.IsNullOrEmpty(a))
                .Distinct(StringComparer.OrdinalIgnoreCase))
            {
                mdfe.AutorizacoesXml.Add(new MDFeAutorizacaoDownloadXml
                {
                    Documento = documento!,
                    Ordem = ordem++
                });
            }
        }

        private void AplicarResponsavelTecnico(MDFe mdfe, ResponsavelTecnicoDto? responsavelDto)
        {
            // Sempre aplicar dados fixos do Respons�vel T�cnico da empresa
            var responsavel = mdfe.ResponsavelTecnico ?? new MDFeResponsavelTecnico();

            // Dados fixos da empresa
            responsavel.Cnpj = "02781892000130";
            responsavel.NomeContato = "Nicolas Portie";
            responsavel.Email = "nicolas@irrigacaopenapolis.com.br";
            responsavel.Telefone = "1836542248";
            responsavel.IdCsrt = null; // N�o obrigat�rio
            responsavel.HashCsrt = null; // N�o obrigat�rio

            if (mdfe.ResponsavelTecnico == null)
            {
                mdfe.ResponsavelTecnico = responsavel;
            }
        }

        private void AplicarUnidades(MDFe mdfe, List<UnidadeTransporteDto>? unidadesTransporteDto, List<UnidadeCargaDto>? unidadesCargaDto)
        {
            if (mdfe.UnidadesTransporte.Count > 0)
            {
                foreach (var unidade in mdfe.UnidadesTransporte)
                {
                    if (unidade.UnidadesCarga != null && unidade.UnidadesCarga.Count > 0)
                    {
                        _context.MDFeUnidadesCarga.RemoveRange(unidade.UnidadesCarga);
                    }

                    if (unidade.Lacres != null && unidade.Lacres.Count > 0)
                    {
                        _context.MDFeLacresUnidadeTransporte.RemoveRange(unidade.Lacres);
                    }
                }

                _context.MDFeUnidadesTransporte.RemoveRange(mdfe.UnidadesTransporte);
                mdfe.UnidadesTransporte.Clear();
            }

            if (mdfe.UnidadesCarga.Count > 0)
            {
                foreach (var unidade in mdfe.UnidadesCarga)
                {
                    if (unidade.LacresUnidadeCarga != null && unidade.LacresUnidadeCarga.Count > 0)
                    {
                        _context.MDFeLacresUnidadeCarga.RemoveRange(unidade.LacresUnidadeCarga);
                    }
                }

                _context.MDFeUnidadesCarga.RemoveRange(mdfe.UnidadesCarga);
                mdfe.UnidadesCarga.Clear();
            }

            if (unidadesTransporteDto != null)
            {
                var ordemTransporte = 1;
                foreach (var dto in unidadesTransporteDto.Where(u => u != null && !string.IsNullOrWhiteSpace(u.TipoUnidadeTransporte)))
                {
                    var unidadeTransporte = new MDFeUnidadeTransporte
                    {
                        TipoUnidadeTransporte = LimparTexto(dto.TipoUnidadeTransporte) ?? "1",
                        CodigoInterno = LimparTexto(dto.CodigoInterno),
                        Placa = LimparTexto(dto.Placa)?.ToUpperInvariant(),
                        Tara = dto.Tara,
                        CapacidadeKg = dto.CapacidadeKg,
                        CapacidadeM3 = dto.CapacidadeM3,
                        TipoRodado = LimparTexto(dto.TipoRodado),
                        TipoCarroceria = LimparTexto(dto.TipoCarroceria),
                        Uf = LimparTexto(dto.Uf)?.ToUpperInvariant(),
                        QuantidadeRateada = dto.QuantidadeRateada,
                        Ordem = ordemTransporte++
                    };

                    if (dto.Lacres != null)
                    {
                        var ordemLacre = 1;
                        foreach (var lacreDto in dto.Lacres.Where(l => l != null && !string.IsNullOrWhiteSpace(l.NumeroLacre)))
                        {
                            unidadeTransporte.Lacres ??= new List<MDFeLacreUnidadeTransporte>();
                            unidadeTransporte.Lacres.Add(new MDFeLacreUnidadeTransporte
                            {
                                NumeroLacre = LimparTexto(lacreDto.NumeroLacre) ?? string.Empty,
                                Ordem = ordemLacre++
                            });
                        }
                    }

                    if (dto.UnidadesCarga != null)
                    {
                        var ordemCarga = 1;
                        foreach (var cargaDto in dto.UnidadesCarga.Where(c => c != null && !string.IsNullOrWhiteSpace(c.TipoUnidadeCarga)))
                        {
                            var unidadeCarga = new MDFeUnidadeCarga
                            {
                                TipoUnidadeCarga = LimparTexto(cargaDto.TipoUnidadeCarga) ?? "1",
                                IdUnidadeCarga = LimparTexto(cargaDto.IdUnidadeCarga),
                                QtdRat = cargaDto.QtdRat,
                                Ordem = ordemCarga++
                            };

                            if (cargaDto.Lacres != null)
                            {
                                var ordemLacre = 1;
                                foreach (var lacreDto in cargaDto.Lacres.Where(l => l != null && !string.IsNullOrWhiteSpace(l.NumeroLacre)))
                                {
                                    unidadeCarga.LacresUnidadeCarga.Add(new MDFeLacreUnidadeCarga
                                    {
                                        NumeroLacre = LimparTexto(lacreDto.NumeroLacre) ?? string.Empty,
                                        Ordem = ordemLacre++
                                    });
                                }
                            }

                            unidadeTransporte.UnidadesCarga ??= new List<MDFeUnidadeCarga>();
                            unidadeTransporte.UnidadesCarga.Add(unidadeCarga);
                        }
                    }

                    mdfe.UnidadesTransporte.Add(unidadeTransporte);
                }
            }

            if (unidadesCargaDto != null)
            {
                var ordemCarga = 1;
                foreach (var cargaDto in unidadesCargaDto.Where(c => c != null && !string.IsNullOrWhiteSpace(c.TipoUnidadeCarga)))
                {
                    var unidadeCarga = new MDFeUnidadeCarga
                    {
                        TipoUnidadeCarga = LimparTexto(cargaDto.TipoUnidadeCarga) ?? "1",
                        IdUnidadeCarga = LimparTexto(cargaDto.IdUnidadeCarga),
                        QtdRat = cargaDto.QtdRat,
                        Ordem = ordemCarga++
                    };

                    if (cargaDto.Lacres != null)
                    {
                        var ordemLacre = 1;
                        foreach (var lacreDto in cargaDto.Lacres.Where(l => l != null && !string.IsNullOrWhiteSpace(l.NumeroLacre)))
                        {
                            unidadeCarga.LacresUnidadeCarga.Add(new MDFeLacreUnidadeCarga
                            {
                                NumeroLacre = LimparTexto(lacreDto.NumeroLacre) ?? string.Empty,
                                Ordem = ordemLacre++
                            });
                        }
                    }

                    mdfe.UnidadesCarga.Add(unidadeCarga);
                }
            }
        }

        private void AplicarProdutosPerigosos(MDFe mdfe, List<ProdutoPerigosoDto>? produtosDto)
        {
            if (mdfe.ProdutosPerigosos.Count > 0)
            {
                _context.MDFeProdutosPerigosos.RemoveRange(mdfe.ProdutosPerigosos);
                mdfe.ProdutosPerigosos.Clear();
            }

            if (produtosDto == null)
            {
                return;
            }

            var ordem = 1;
            foreach (var produtoDto in produtosDto.Where(p => p != null && !string.IsNullOrWhiteSpace(p.NumeroOnu)))
            {
                mdfe.ProdutosPerigosos.Add(new MDFeProdutoPerigoso
                {
                    NumeroONU = LimparTexto(produtoDto.NumeroOnu) ?? string.Empty,
                    NomeEmbarque = LimparTexto(produtoDto.NomeEmbarque) ?? string.Empty,
                    ClasseRisco = LimparTexto(produtoDto.ClasseRisco) ?? string.Empty,
                    GrupoEmbalagem = LimparTexto(produtoDto.GrupoEmbalagem),
                    QuantidadeTotal = produtoDto.QuantidadeTotal ?? 0m,
                    UnidadeMedida = LimparTexto(produtoDto.UnidadeMedida) ?? "01",
                    Observacoes = LimparTexto(produtoDto.Observacoes),
                    Ordem = ordem++
                });
            }
        }

        private static string? LimparTexto(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
        }

        private static string? SanitizeDocumento(string? valor)
        {
            if (string.IsNullOrWhiteSpace(valor))
            {
                return null;
            }

            var digits = new string(valor.Where(char.IsDigit).ToArray());
            return string.IsNullOrEmpty(digits) ? null : digits;
        }

        private static string? SerializarStrings(IEnumerable<string>? valores, out int quantidade)
        {
            var lista = (valores ?? Enumerable.Empty<string>())
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .Select(v => v.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            quantidade = lista.Count;
            return quantidade == 0 ? null : JsonSerializer.Serialize(lista);
        }

        private static string? SerializarStrings(IEnumerable<string>? valores)
        {
            return SerializarStrings(valores, out _);
        }

        private static string? SerializarObjetos<T>(IEnumerable<T>? valores)
        {
            if (valores == null)
                return null;

            var lista = valores.ToList();
            return lista.Count == 0 ? null : JsonSerializer.Serialize(lista);
        }

        private void AtualizarLocalidadesPrincipais(MDFe mdfe)
        {
            var locaisCarregamento = DesserializarLocalidades(mdfe.LocalidadesCarregamentoJson);
            var principalCarga = locaisCarregamento.FirstOrDefault();
            if (principalCarga != null)
            {
                if (!mdfe.CodigoMunicipioCarregamento.HasValue)
                    mdfe.CodigoMunicipioCarregamento = principalCarga.CodigoIBGE;
                if (string.IsNullOrWhiteSpace(mdfe.NomeMunicipioCarregamento))
                    mdfe.NomeMunicipioCarregamento = principalCarga.Municipio;
                // N�o definir UfIni automaticamente - deixar para o usu�rio informar
                if (string.IsNullOrWhiteSpace(mdfe.MunicipioIni))
                    mdfe.MunicipioIni = principalCarga.Municipio ?? mdfe.MunicipioIni;
            }

            var locaisDescarregamento = DesserializarLocalidades(mdfe.LocalidadesDescarregamentoJson);
            var principalDescarga = locaisDescarregamento.FirstOrDefault();
            if (principalDescarga != null)
            {
                if (!mdfe.CodigoMunicipioDescarregamento.HasValue)
                    mdfe.CodigoMunicipioDescarregamento = principalDescarga.CodigoIBGE;
                if (string.IsNullOrWhiteSpace(mdfe.NomeMunicipioDescarregamento))
                    mdfe.NomeMunicipioDescarregamento = principalDescarga.Municipio;
                // N�o definir UfFim automaticamente - deixar para o usu�rio informar
                if (string.IsNullOrWhiteSpace(mdfe.MunicipioFim))
                    mdfe.MunicipioFim = principalDescarga.Municipio ?? mdfe.MunicipioFim;
            }
        }

        private List<LocalidadeInterna> DesserializarLocalidades(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<LocalidadeInterna>();
            }

            try
            {
                return JsonSerializer.Deserialize<List<LocalidadeInterna>>(json) ?? new List<LocalidadeInterna>();
            }
            catch
            {
                return new List<LocalidadeInterna>();
            }
        }

        private async Task<List<MDFeReboque>> MapearReboquesAsync(IEnumerable<int>? reboquesIds)
        {
            if (reboquesIds == null)
                return new List<MDFeReboque>();

            var ids = reboquesIds
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (ids.Count == 0)
                return new List<MDFeReboque>();

            var existentes = await _context.Reboques
                .Where(r => ids.Contains(r.Id))
                .Select(r => r.Id)
                .ToListAsync();

            var faltantes = ids.Except(existentes).ToList();
            if (faltantes.Count > 0)
            {
                _logger.LogWarning("Reboques nao encontrados: {Reboques}", string.Join(",", faltantes));
            }

            var ordem = 1;
            return existentes
                .Select(id => new MDFeReboque
                {
                    ReboqueId = id,
                    Ordem = ordem++
                })
                .ToList();
        }

        private async Task AtualizarReboquesAsync(MDFe mdfe, List<int>? reboquesIds)
        {
            await _context.Entry(mdfe).Collection(m => m.Reboques).LoadAsync();

            var novos = await MapearReboquesAsync(reboquesIds);

            mdfe.Reboques.Clear();
            foreach (var reboque in novos)
            {
                reboque.MDFe = mdfe;
                mdfe.Reboques.Add(reboque);
            }
        }

        private async Task AtualizarLocalidadesAsync(MDFe mdfe, List<LocalidadeDto>? localidadesCarregamento, List<LocalidadeDto>? localidadesDescarregamento)
        {
            // Carregar as collections se necess�rio (s� se n�o estiverem carregadas)
            if (!_context.Entry(mdfe).Collection(m => m.LocaisCarregamento).IsLoaded)
            {
                await _context.Entry(mdfe).Collection(m => m.LocaisCarregamento).LoadAsync();
            }
            if (!_context.Entry(mdfe).Collection(m => m.LocaisDescarregamento).IsLoaded)
            {
                await _context.Entry(mdfe).Collection(m => m.LocaisDescarregamento).LoadAsync();
            }

            // Limpar localidades existentes
            mdfe.LocaisCarregamento.Clear();
            mdfe.LocaisDescarregamento.Clear();

            // Adicionar localidades de carregamento
            if (localidadesCarregamento != null && localidadesCarregamento.Count > 0)
            {
                var ordem = 1;
                foreach (var localidadeDto in localidadesCarregamento)
                {
                    var municipio = await _context.Municipios
                        .FirstOrDefaultAsync(m => m.Codigo == localidadeDto.CodigoIBGE);

                    // S� adicionar se o munic�pio for encontrado
                    if (municipio != null)
                    {
                        var localCarregamento = new MDFeLocalCarregamento
                        {
                            MDFeId = mdfe.Id,
                            MDFe = mdfe,
                            MunicipioId = municipio.Id,
                            Municipio = municipio,
                            DescricaoMunicipio = localidadeDto.Municipio,
                            Ordem = ordem++
                        };

                        mdfe.LocaisCarregamento.Add(localCarregamento);
                    }
                }
            }

            // Adicionar localidades de descarregamento
            if (localidadesDescarregamento != null && localidadesDescarregamento.Count > 0)
            {
                var ordem = 1;
                foreach (var localidadeDto in localidadesDescarregamento)
                {
                    var municipio = await _context.Municipios
                        .FirstOrDefaultAsync(m => m.Codigo == localidadeDto.CodigoIBGE);

                    // S� adicionar se o munic�pio for encontrado
                    if (municipio != null)
                    {
                        var localDescarregamento = new MDFeLocalDescarregamento
                        {
                            MDFeId = mdfe.Id,
                            MDFe = mdfe,
                            MunicipioId = municipio.Id,
                            Municipio = municipio,
                            DescricaoMunicipio = localidadeDto.Municipio,
                            Ordem = ordem++
                        };

                        mdfe.LocaisDescarregamento.Add(localDescarregamento);
                    }
                }
            }
        }

        private sealed class LocalidadeInterna
        {
            public string? Uf { get; set; }
            public string? Municipio { get; set; }
            public int? CodigoIBGE { get; set; }
        }

    }
}


