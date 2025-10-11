using System.Text.RegularExpressions;
using Backend.Api.Models;
using Backend.Api.Validation;

namespace Backend.Api.Validation
{
    public class MDFeFieldValidator : IMDFeFieldValidator
    {
        public List<MDFeFieldError> Validar(MDFe mdfe)
        {
            var erros = new List<MDFeFieldError>();

            ValidarIde(mdfe, erros);
            ValidarEmit(mdfe, erros);
            ValidarVeicTracao(mdfe, erros);
            ValidarCondutores(mdfe, erros);
            ValidarTotais(mdfe, erros);
            ValidarProdPred(mdfe, erros);

            return erros;
        }

        private void ValidarIde(MDFe mdfe, List<MDFeFieldError> erros)
        {
            void Add(string campo, string regra, string msg) => erros.Add(new MDFeFieldError { Secao = "ide", Campo = campo, Regra = regra, Mensagem = msg });

            if (string.IsNullOrWhiteSpace(mdfe.EmitenteUf)) Add("cUF", "Obrigatorio", "UF do emitente ausente");
            if (mdfe.Serie <= 0) Add("serie", ">0", "Serie deve ser maior que zero");
            if (mdfe.NumeroMdfe <= 0) Add("nMDF", ">0", "Número do MDF-e deve ser maior que zero");
            var nMdfFormat = mdfe.NumeroMdfe.ToString("D5");
            if (nMdfFormat.Length != 5) Add("nMDF", "Formato D5", "nMDF deve ter 5 dígitos");
            if (string.IsNullOrWhiteSpace(mdfe.CodigoMDF) || mdfe.CodigoMDF!.Length != 8 || !mdfe.CodigoMDF.All(char.IsDigit))
                Add("cMDF", "8 digitos", "cMDF precisa ter 8 dígitos numéricos");
            if (mdfe.Modal <= 0) Add("modal", "Obrigatorio", "Modal deve ser definido");
            if (string.IsNullOrWhiteSpace(mdfe.UfIni)) Add("UFIni", "Obrigatorio", "UFIni ausente");
            if (string.IsNullOrWhiteSpace(mdfe.UfFim)) Add("UFFim", "Obrigatorio", "UFFim ausente");
        }

        private void ValidarEmit(MDFe mdfe, List<MDFeFieldError> erros)
        {
            void Add(string campo, string regra, string msg) => erros.Add(new MDFeFieldError { Secao = "emit", Campo = campo, Regra = regra, Mensagem = msg });

            if (string.IsNullOrWhiteSpace(mdfe.EmitenteCnpj) && string.IsNullOrWhiteSpace(mdfe.EmitenteCpf))
                Add("CNPJCPF", "Obrigatorio", "CNPJ ou CPF do emitente requerido");
            if (string.IsNullOrWhiteSpace(mdfe.EmitenteIe))
                Add("IE", "Obrigatorio", "Inscrição Estadual obrigatória");
            if (string.IsNullOrWhiteSpace(mdfe.EmitenteRazaoSocial))
                Add("xNome", "Obrigatorio", "Razão social obrigatória");
            if (mdfe.EmitenteCodMunicipio <= 0)
                Add("cMun", ">0", "Código IBGE do município inválido");
            if (string.IsNullOrWhiteSpace(mdfe.EmitenteMunicipio))
                Add("xMun", "Obrigatorio", "Município emitente obrigatório");
            if (string.IsNullOrWhiteSpace(mdfe.EmitenteUf) || mdfe.EmitenteUf.Length != 2)
                Add("UF", "UF 2", "UF deve possuir 2 caracteres");
            if (string.IsNullOrWhiteSpace(mdfe.EmitenteCep) || !Regex.IsMatch(mdfe.EmitenteCep, "^\n?\r?[0-9]{8}$".Replace("\\","")))
                Add("CEP", "CEP8", "CEP deve ter 8 dígitos");
        }

        private void ValidarVeicTracao(MDFe mdfe, List<MDFeFieldError> erros)
        {
            void Add(string campo, string regra, string msg) => erros.Add(new MDFeFieldError { Secao = "veicTracao", Campo = campo, Regra = regra, Mensagem = msg });
            if (string.IsNullOrWhiteSpace(mdfe.VeiculoPlaca))
                Add("placa", "Obrigatorio", "Placa do veículo obrigatória");
            if (string.IsNullOrWhiteSpace(mdfe.VeiculoUf) || mdfe.VeiculoUf.Length != 2)
                Add("UF", "UF 2", "UF do veículo deve ter 2 caracteres");
        }

        private void ValidarCondutores(MDFe mdfe, List<MDFeFieldError> erros)
        {
            if (!string.IsNullOrWhiteSpace(mdfe.CondutorNome) && string.IsNullOrWhiteSpace(mdfe.CondutorCpf))
            {
                erros.Add(new MDFeFieldError { Secao = "moto001", Campo = "CPF", Regra = "Obrigatorio", Mensagem = "CPF do condutor principal obrigatório quando nome informado" });
            }
            if (!string.IsNullOrWhiteSpace(mdfe.CondutorCpf) && mdfe.CondutorCpf!.Length != 11)
            {
                erros.Add(new MDFeFieldError { Secao = "moto001", Campo = "CPF", Regra = "11 digitos", Mensagem = "CPF do condutor deve ter 11 dígitos" });
            }
        }

        private void ValidarTotais(MDFe mdfe, List<MDFeFieldError> erros)
        {
            void Add(string campo, string regra, string msg) => erros.Add(new MDFeFieldError { Secao = "tot", Campo = campo, Regra = regra, Mensagem = msg });
            if (!mdfe.ValorTotal.HasValue || mdfe.ValorTotal <= 0)
                Add("vCarga", ">0", "Valor total da carga deve ser maior que zero");
            if (!mdfe.PesoBrutoTotal.HasValue || mdfe.PesoBrutoTotal <= 0)
                Add("qCarga", ">0", "Peso total (qCarga) deve ser maior que zero");
        }

        private void ValidarProdPred(MDFe mdfe, List<MDFeFieldError> erros)
        {
            void Add(string campo, string regra, string msg) => erros.Add(new MDFeFieldError { Secao = "prodPred", Campo = campo, Regra = regra, Mensagem = msg });
            if (string.IsNullOrWhiteSpace(mdfe.TipoCarga))
                Add("tpCarga", "Obrigatorio", "Tipo de carga predominante obrigatório");
            if (string.IsNullOrWhiteSpace(mdfe.DescricaoProduto) && string.IsNullOrWhiteSpace(mdfe.ProdutoPredominante))
                Add("xProd", "Obrigatorio", "Descrição do produto predominante obrigatória");
        }
    }
}

