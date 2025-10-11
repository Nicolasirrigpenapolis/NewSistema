using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;

namespace Backend.Api.Utils
{
    public static class DocumentUtils
    {
        /// <summary>
        /// Remove acentos de uma string
        /// </summary>
        /// <param name="text">Texto com acentos (ex: José, João, Ação)</param>
        /// <returns>Texto sem acentos (ex: Jose, Joao, Acao)</returns>
        public static string? RemoverAcentos(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        /// <summary>
        /// Remove formatação do CNPJ, mantendo apenas números
        /// </summary>
        /// <param name="cnpj">CNPJ formatado (ex: 12.345.678/0001-90)</param>
        /// <returns>CNPJ limpo (ex: 12345678000190)</returns>
        public static string? LimparCnpj(string? cnpj)
        {
            if (string.IsNullOrWhiteSpace(cnpj))
                return null;

            // Remove tudo que não for dígito
            return Regex.Replace(cnpj, @"[^\d]", "");
        }

        /// <summary>
        /// Remove formatação do CPF, mantendo apenas números
        /// </summary>
        /// <param name="cpf">CPF formatado (ex: 123.456.789-10)</param>
        /// <returns>CPF limpo (ex: 12345678910)</returns>
        public static string? LimparCpf(string? cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf))
                return null;

            // Remove tudo que não for dígito
            return Regex.Replace(cpf, @"[^\d]", "");
        }

        /// <summary>
        /// Remove formatação do CEP, mantendo apenas números
        /// </summary>
        /// <param name="cep">CEP formatado (ex: 12345-678)</param>
        /// <returns>CEP limpo (ex: 12345678)</returns>
        public static string? LimparCep(string? cep)
        {
            if (string.IsNullOrWhiteSpace(cep))
                return null;

            // Remove tudo que não for dígito
            return Regex.Replace(cep, @"[^\d]", "");
        }

        /// <summary>
        /// Remove formatação do telefone, mantendo apenas números
        /// </summary>
        /// <param name="telefone">Telefone formatado (ex: (11) 99999-9999)</param>
        /// <returns>Telefone limpo (ex: 11999999999)</returns>
        public static string? LimparTelefone(string? telefone)
        {
            if (string.IsNullOrWhiteSpace(telefone))
                return null;

            // Remove tudo que não for dígito
            return Regex.Replace(telefone, @"[^\d]", "");
        }

        /// <summary>
        /// Valida se CNPJ tem 14 dígitos
        /// </summary>
        /// <param name="cnpj">CNPJ limpo</param>
        /// <returns>True se válido</returns>
        public static bool ValidarTamanhoCnpj(string? cnpj)
        {
            return !string.IsNullOrWhiteSpace(cnpj) && cnpj.Length == 14;
        }

        /// <summary>
        /// Valida se CPF tem 11 dígitos
        /// </summary>
        /// <param name="cpf">CPF limpo</param>
        /// <returns>True se válido</returns>
        public static bool ValidarTamanhoCpf(string? cpf)
        {
            return !string.IsNullOrWhiteSpace(cpf) && cpf.Length == 11;
        }

        /// <summary>
        /// Aplica limpeza em uma entidade Emitente
        /// </summary>
        /// <param name="emitente">Entidade Emitente</param>
        public static void LimparDocumentosEmitente(Models.Emitente emitente)
        {
            if (emitente == null) return;
            // Garante que propriedades não recebam null (evita CS8601)
            emitente.Cnpj = LimparCnpj(emitente.Cnpj) ?? emitente.Cnpj ?? string.Empty;
            emitente.Cpf = LimparCpf(emitente.Cpf) ?? emitente.Cpf ?? string.Empty;
            emitente.Cep = LimparCep(emitente.Cep) ?? emitente.Cep ?? string.Empty;
        }

        /// <summary>
        /// Aplica limpeza em uma entidade Condutor
        /// </summary>
        /// <param name="condutor">Entidade Condutor</param>
        public static void LimparDocumentosCondutor(Models.Condutor condutor)
        {
            if (condutor == null) return;
            condutor.Cpf = LimparCpf(condutor.Cpf) ?? condutor.Cpf ?? string.Empty;
        }

        /// <summary>
        /// Aplica limpeza em uma entidade Contratante
        /// </summary>
        /// <param name="contratante">Entidade Contratante</param>
        public static void LimparDocumentosContratante(Models.Contratante contratante)
        {
            if (contratante == null) return;
            contratante.Cnpj = LimparCnpj(contratante.Cnpj) ?? contratante.Cnpj ?? string.Empty;
            contratante.Cpf = LimparCpf(contratante.Cpf) ?? contratante.Cpf ?? string.Empty;
            contratante.Cep = LimparCep(contratante.Cep) ?? contratante.Cep ?? string.Empty;
        }

        /// <summary>
        /// Aplica limpeza em uma entidade Seguradora
        /// </summary>
        /// <param name="seguradora">Entidade Seguradora</param>
        public static void LimparDocumentosSeguradora(Models.Seguradora seguradora)
        {
            if (seguradora == null) return;
            seguradora.Cnpj = LimparCnpj(seguradora.Cnpj) ?? seguradora.Cnpj ?? string.Empty;
        }

        /// <summary>
        /// Remove formatação da placa, mantendo apenas letras e números
        /// </summary>
        /// <param name="placa">Placa formatada (ex: ABC-1234)</param>
        /// <returns>Placa limpa (ex: ABC1234)</returns>
        public static string? LimparPlaca(string? placa)
        {
            if (string.IsNullOrWhiteSpace(placa))
                return null;

            // Remove tudo que não for letra ou número e converte para maiúsculo
            return Regex.Replace(placa.ToUpper(), @"[^A-Z0-9]", "");
        }

        /// <summary>
        /// Aplica limpeza em uma entidade Veiculo
        /// </summary>
        /// <param name="veiculo">Entidade Veiculo</param>
        public static void LimparDocumentosVeiculo(Models.Veiculo veiculo)
        {
            if (veiculo == null) return;
            veiculo.Placa = LimparPlaca(veiculo.Placa) ?? veiculo.Placa ?? string.Empty;
        }

        /// <summary>
        /// Aplica limpeza em uma entidade Reboque
        /// </summary>
        /// <param name="reboque">Entidade Reboque</param>
        public static void LimparDocumentosReboque(Models.Reboque reboque)
        {
            if (reboque == null) return;
            reboque.Placa = LimparPlaca(reboque.Placa) ?? reboque.Placa ?? string.Empty;
        }
    }
}
