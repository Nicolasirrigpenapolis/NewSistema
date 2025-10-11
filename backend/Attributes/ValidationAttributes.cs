using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Backend.Api.Attributes
{
    /// <summary>
    /// Valida formato de CNPJ (apenas números, 14 dígitos)
    /// </summary>
    public class CnpjAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return true; // Validação de obrigatório deve ser feita com [Required]

            var cnpj = value.ToString()!.Replace(".", "").Replace("/", "").Replace("-", "");

            if (cnpj.Length != 14)
                return false;

            if (!Regex.IsMatch(cnpj, @"^\d{14}$"))
                return false;

            return ValidarCnpj(cnpj);
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} deve ser um CNPJ válido";
        }

        private bool ValidarCnpj(string cnpj)
        {
            // Verifica se não é uma sequência de números iguais
            if (cnpj.All(c => c == cnpj[0]))
                return false;

            // Algoritmo de validação do CNPJ
            int[] multiplicador1 = { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
            int[] multiplicador2 = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };

            string tempCnpj = cnpj.Substring(0, 12);
            int soma = 0;

            for (int i = 0; i < 12; i++)
                soma += int.Parse(tempCnpj[i].ToString()) * multiplicador1[i];

            int resto = (soma % 11);
            if (resto < 2)
                resto = 0;
            else
                resto = 11 - resto;

            string digito = resto.ToString();
            tempCnpj = tempCnpj + digito;
            soma = 0;

            for (int i = 0; i < 13; i++)
                soma += int.Parse(tempCnpj[i].ToString()) * multiplicador2[i];

            resto = (soma % 11);
            if (resto < 2)
                resto = 0;
            else
                resto = 11 - resto;

            digito = digito + resto.ToString();

            return cnpj.EndsWith(digito);
        }
    }

    /// <summary>
    /// Valida formato de CPF (apenas números, 11 dígitos)
    /// </summary>
    public class CpfAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return true; // Validação de obrigatório deve ser feita com [Required]

            var cpf = value.ToString()!.Replace(".", "").Replace("-", "");

            if (cpf.Length != 11)
                return false;

            if (!Regex.IsMatch(cpf, @"^\d{11}$"))
                return false;

            return ValidarCpf(cpf);
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} deve ser um CPF válido";
        }

        private bool ValidarCpf(string cpf)
        {
            // Verifica se não é uma sequência de números iguais
            if (cpf.All(c => c == cpf[0]))
                return false;

            // Algoritmo de validação do CPF
            int[] multiplicador1 = { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
            int[] multiplicador2 = { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

            string tempCpf = cpf.Substring(0, 9);
            int soma = 0;

            for (int i = 0; i < 9; i++)
                soma += int.Parse(tempCpf[i].ToString()) * multiplicador1[i];

            int resto = soma % 11;
            if (resto < 2)
                resto = 0;
            else
                resto = 11 - resto;

            string digito = resto.ToString();
            tempCpf = tempCpf + digito;
            soma = 0;

            for (int i = 0; i < 10; i++)
                soma += int.Parse(tempCpf[i].ToString()) * multiplicador2[i];

            resto = soma % 11;
            if (resto < 2)
                resto = 0;
            else
                resto = 11 - resto;

            digito = digito + resto.ToString();

            return cpf.EndsWith(digito);
        }
    }

    /// <summary>
    /// Valida formato de placa de veículo (padrão brasileiro e Mercosul)
    /// </summary>
    public class PlacaVeiculoAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return true;

            var placa = value.ToString()!.ToUpper().Replace("-", "").Replace(" ", "");

            // Formato antigo: AAA9999
            var formatoAntigo = Regex.IsMatch(placa, @"^[A-Z]{3}[0-9]{4}$");

            // Formato Mercosul: AAA9A99
            var formatoMercosul = Regex.IsMatch(placa, @"^[A-Z]{3}[0-9][A-Z][0-9]{2}$");

            return formatoAntigo || formatoMercosul;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} deve estar no formato ABC1234 ou ABC1A23 (Mercosul)";
        }
    }

    /// <summary>
    /// Valida se a data não é futura (para datas que não devem estar no futuro)
    /// </summary>
    public class DataNaoFuturaAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null)
                return true;

            if (value is DateTime data)
            {
                return data <= DateTime.Now;
            }

            return false;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} não pode ser uma data futura";
        }
    }

    /// <summary>
    /// Valida chave de CTe ou NFe (44 dígitos)
    /// </summary>
    public class ChaveDocumentoFiscalAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return true;

            var chave = value.ToString()!.Replace(" ", "");

            return Regex.IsMatch(chave, @"^\d{44}$");
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} deve conter exatamente 44 dígitos numéricos";
        }
    }

    /// <summary>
    /// Valida código IBGE de município (7 dígitos)
    /// </summary>
    public class CodigoMunicipioAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null)
                return true;

            if (value is int codigo)
            {
                return codigo >= 1100000 && codigo <= 5300000; // Faixa válida dos códigos IBGE
            }

            return false;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} deve ser um código IBGE válido";
        }
    }
}
