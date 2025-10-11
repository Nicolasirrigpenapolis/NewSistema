using Backend.Api.Utils;

namespace Backend.Api.DTOs.Extensions
{
    public static class MDFeDtoExtensions
    {
        /// <summary>
        /// Limpa e valida os dados do DTO antes do processamento
        /// </summary>
        public static void LimparDados(this MDFeCreateDto dto)
        {
            dto.UfIni = dto.UfIni?.Trim().ToUpper() ?? string.Empty;
            dto.UfFim = dto.UfFim?.Trim().ToUpper() ?? string.Empty;
            dto.MunicipioIni = dto.MunicipioIni?.Trim() ?? string.Empty;
            dto.MunicipioFim = dto.MunicipioFim?.Trim() ?? string.Empty;
            dto.InfoAdicional = string.IsNullOrWhiteSpace(dto.InfoAdicional) ? null : dto.InfoAdicional.Trim();

            LimparVales(dto.ValesPedagio);
            dto.Pagamento = LimparPagamento(dto.Pagamento);
            dto.AutorizadosXml = LimparDocumentos(dto.AutorizadosXml);
            dto.ResponsavelTecnico = LimparResponsavel(dto.ResponsavelTecnico);
            dto.UnidadesTransporte = LimparUnidadesTransporte(dto.UnidadesTransporte);
            dto.UnidadesCarga = LimparUnidadesCarga(dto.UnidadesCarga);
            dto.ProdutosPerigosos = LimparProdutos(dto.ProdutosPerigosos);
        }

        /// <summary>
        /// Limpa e valida os dados do DTO de atualização
        /// </summary>
        public static void LimparDados(this MDFeUpdateDto dto)
        {
            // MDFeUpdateDto herda de MDFeCreateDto, então podemos usar o mesmo método
            ((MDFeCreateDto)dto).LimparDados();
        }

        /// <summary>
        /// Limpa dados do DTO de geração de INI
        /// </summary>
        public static void LimparDados(this MDFeGerarINIDto dto)
        {
            // UfInicio não existe mais - removido na padronização
            dto.UfFim = dto.UfFim?.Trim().ToUpper() ?? string.Empty;
            dto.MunicipioCarregamento = dto.MunicipioCarregamento?.Trim() ?? string.Empty;
            dto.MunicipioDescarregamento = dto.MunicipioDescarregamento?.Trim() ?? string.Empty;
            dto.InfoAdicional = string.IsNullOrWhiteSpace(dto.InfoAdicional) ? string.Empty : dto.InfoAdicional.Trim();
            dto.UnidadeMedida = dto.UnidadeMedida?.Trim() ?? "01";
        }

        /// <summary>
        /// Validações específicas que complementam as validações de atributos
        /// </summary>
        public static List<string> ValidarConsistencia(this MDFeCreateDto dto)
        {
            var erros = new List<string>();

            // Validar se UF início é diferente de UF fim (se necessário)
            if (!string.IsNullOrEmpty(dto.UfIni) && !string.IsNullOrEmpty(dto.UfFim))
            {
                if (dto.UfIni == dto.UfFim && dto.MunicipioIni == dto.MunicipioFim)
                {
                    erros.Add("Origem e destino não podem ser iguais");
                }
            }

            // Validar datas
            if (dto.DataInicioViagem < dto.DataEmissao)
            {
                erros.Add("Data de início da viagem não pode ser anterior à data de emissão");
            }

            if (dto.DataEmissao > DateTime.Now.AddDays(1))
            {
                erros.Add("Data de emissão não pode ser superior a um dia no futuro");
            }

            return erros;

        }





        private static List<ValePedagioDto>? LimparVales(List<ValePedagioDto>? vales)

        {

            if (vales == null)

            {

                return null;

            }



            vales.RemoveAll(v => v == null);



            foreach (var vale in vales)

            {

                vale.CnpjFornecedor = ApenasDigitos(vale.CnpjFornecedor);

                vale.CnpjPagador = ApenasDigitos(vale.CnpjPagador);

                vale.NumeroCompra = LimparTexto(vale.NumeroCompra);

                vale.TipoVale = LimparTexto(vale.TipoVale);

                vale.NomeFornecedor = LimparTexto(vale.NomeFornecedor);

            }



            vales = vales

                .Where(v => !string.IsNullOrEmpty(v.CnpjFornecedor) && !string.IsNullOrEmpty(v.NumeroCompra))

                .ToList();



            return vales.Count == 0 ? null : vales;

        }



        private static PagamentoInfoDto? LimparPagamento(PagamentoInfoDto? pagamento)

        {

            if (pagamento == null)

            {

                return null;

            }



            pagamento.CnpjCpf = ApenasDigitos(pagamento.CnpjCpf);

            pagamento.IdEstrangeiro = LimparTexto(pagamento.IdEstrangeiro);

            pagamento.Nome = LimparTexto(pagamento.Nome);

            pagamento.IndicadorPagamento = LimparTexto(pagamento.IndicadorPagamento);

            pagamento.TipoPagamento = LimparTexto(pagamento.TipoPagamento);

            pagamento.Observacoes = LimparTexto(pagamento.Observacoes);



            if (pagamento.Componentes != null)

            {

                pagamento.Componentes.RemoveAll(c => c == null);

                foreach (var componente in pagamento.Componentes)

                {

                    componente.TipoComponente = LimparTexto(componente.TipoComponente) ?? string.Empty;

                    componente.Descricao = LimparTexto(componente.Descricao);

                }

            }



            if (pagamento.Prazos != null)

            {

                pagamento.Prazos.RemoveAll(p => p == null);

                foreach (var prazo in pagamento.Prazos)

                {

                    prazo.NumeroParcela = LimparTexto(prazo.NumeroParcela);

                }

            }



            if (pagamento.Banco != null)

            {

                pagamento.Banco.CodigoBanco = LimparTexto(pagamento.Banco.CodigoBanco);

                pagamento.Banco.CodigoAgencia = LimparTexto(pagamento.Banco.CodigoAgencia);

                pagamento.Banco.CnpjIpef = ApenasDigitos(pagamento.Banco.CnpjIpef);

                pagamento.Banco.NumeroContaPagamento = LimparTexto(pagamento.Banco.NumeroContaPagamento);

            }



            return pagamento;

        }



        private static List<string>? LimparDocumentos(IEnumerable<string>? documentos)
        {
            if (documentos == null)
            {
                return null;
            }

            var itens = documentos
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(ApenasDigitos)
                .Where(s => !string.IsNullOrEmpty(s))
                .Select(s => s!)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            return itens.Count == 0 ? null : itens;
        }


        private static ResponsavelTecnicoDto? LimparResponsavel(ResponsavelTecnicoDto? responsavel)

        {

            if (responsavel == null)

            {

                return null;

            }



            responsavel.Cnpj = ApenasDigitos(responsavel.Cnpj);

            responsavel.NomeContato = LimparTexto(responsavel.NomeContato);

            responsavel.Email = LimparTexto(responsavel.Email)?.ToLowerInvariant();

            responsavel.Telefone = ApenasDigitos(responsavel.Telefone);

            responsavel.IdCsrt = LimparTexto(responsavel.IdCsrt);

            responsavel.HashCsrt = LimparTexto(responsavel.HashCsrt);



            return responsavel;

        }



        private static List<UnidadeTransporteDto>? LimparUnidadesTransporte(List<UnidadeTransporteDto>? unidades)

        {

            if (unidades == null)

            {

                return null;

            }



            unidades.RemoveAll(u => u == null);



            foreach (var unidade in unidades)

            {

                unidade.TipoUnidadeTransporte = LimparTexto(unidade.TipoUnidadeTransporte) ?? string.Empty;

                unidade.CodigoInterno = LimparTexto(unidade.CodigoInterno);

                unidade.Placa = LimparTexto(unidade.Placa)?.ToUpperInvariant();

                unidade.TipoRodado = LimparTexto(unidade.TipoRodado);

                unidade.TipoCarroceria = LimparTexto(unidade.TipoCarroceria);

                unidade.Uf = LimparTexto(unidade.Uf)?.ToUpperInvariant();

                unidade.Lacres = LimparLacres(unidade.Lacres);

                unidade.UnidadesCarga = LimparUnidadesCarga(unidade.UnidadesCarga);

            }



            unidades = unidades

                .Where(u => !string.IsNullOrEmpty(u.TipoUnidadeTransporte))

                .ToList();



            return unidades.Count == 0 ? null : unidades;

        }



        private static List<UnidadeCargaDto>? LimparUnidadesCarga(List<UnidadeCargaDto>? unidades)

        {

            if (unidades == null)

            {

                return null;

            }



            unidades.RemoveAll(u => u == null);



            foreach (var unidade in unidades)

            {

                unidade.TipoUnidadeCarga = LimparTexto(unidade.TipoUnidadeCarga) ?? string.Empty;

                unidade.IdUnidadeCarga = LimparTexto(unidade.IdUnidadeCarga);

                unidade.Lacres = LimparLacres(unidade.Lacres);

            }



            unidades = unidades

                .Where(u => !string.IsNullOrEmpty(u.TipoUnidadeCarga))

                .ToList();



            return unidades.Count == 0 ? null : unidades;

        }



        private static List<LacreDto>? LimparLacres(List<LacreDto>? lacres)

        {

            if (lacres == null)

            {

                return null;

            }



            lacres.RemoveAll(l => l == null);



            var resultado = lacres

                .Where(l => !string.IsNullOrWhiteSpace(l.NumeroLacre))

                .Select(l =>

                {

                    l.NumeroLacre = LimparTexto(l.NumeroLacre);

                    return l;

                })

                .Where(l => !string.IsNullOrEmpty(l.NumeroLacre))

                .GroupBy(l => l.NumeroLacre, StringComparer.OrdinalIgnoreCase)

                .Select(g => g.First())

                .ToList();



            return resultado.Count == 0 ? null : resultado;

        }



        private static List<ProdutoPerigosoDto>? LimparProdutos(List<ProdutoPerigosoDto>? produtos)

        {

            if (produtos == null)

            {

                return null;

            }



            produtos.RemoveAll(p => p == null);



            foreach (var produto in produtos)

            {

                produto.NumeroOnu = LimparTexto(produto.NumeroOnu);

                produto.NomeEmbarque = LimparTexto(produto.NomeEmbarque);

                produto.ClasseRisco = LimparTexto(produto.ClasseRisco);

                produto.GrupoEmbalagem = LimparTexto(produto.GrupoEmbalagem);

                produto.UnidadeMedida = LimparTexto(produto.UnidadeMedida);

                produto.Observacoes = LimparTexto(produto.Observacoes);

            }



            produtos = produtos

                .Where(p => !string.IsNullOrEmpty(p.NumeroOnu))

                .ToList();



            return produtos.Count == 0 ? null : produtos;

        }



        private static string? LimparTexto(string? valor)

        {

            return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

        }



        private static string? ApenasDigitos(string? valor)

        {

            if (string.IsNullOrWhiteSpace(valor))

            {

                return null;

            }



            var digits = new string(valor.Where(char.IsDigit).ToArray());

            return string.IsNullOrEmpty(digits) ? null : digits;

        }



    }

}



