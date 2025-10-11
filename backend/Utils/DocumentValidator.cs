namespace Backend.Api.Utils
{
    public static class DocumentValidator
    {
        /// <summary>
        /// Valida CPF (Cadastro de Pessoa Física)
        /// </summary>
        public static bool ValidarCpf(string? cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf))
                return false;

            // Remove caracteres não numéricos
            cpf = new string(cpf.Where(char.IsDigit).ToArray());

            // CPF deve ter 11 dígitos
            if (cpf.Length != 11)
                return false;

            // CPFs conhecidos inválidos (todos os dígitos iguais)
            var cpfsInvalidos = new[]
            {
                "00000000000", "11111111111", "22222222222", "33333333333",
                "44444444444", "55555555555", "66666666666", "77777777777",
                "88888888888", "99999999999"
            };

            if (cpfsInvalidos.Contains(cpf))
                return false;

            // Validação do primeiro dígito verificador
            var soma = 0;
            for (int i = 0; i < 9; i++)
                soma += int.Parse(cpf[i].ToString()) * (10 - i);

            var resto = soma % 11;
            var digitoVerificador1 = resto < 2 ? 0 : 11 - resto;

            if (int.Parse(cpf[9].ToString()) != digitoVerificador1)
                return false;

            // Validação do segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++)
                soma += int.Parse(cpf[i].ToString()) * (11 - i);

            resto = soma % 11;
            var digitoVerificador2 = resto < 2 ? 0 : 11 - resto;

            if (int.Parse(cpf[10].ToString()) != digitoVerificador2)
                return false;

            return true;
        }

        /// <summary>
        /// Valida CNPJ (Cadastro Nacional de Pessoa Jurídica)
        /// </summary>
        public static bool ValidarCnpj(string? cnpj)
        {
            if (string.IsNullOrWhiteSpace(cnpj))
                return false;

            // Remove caracteres não numéricos
            cnpj = new string(cnpj.Where(char.IsDigit).ToArray());

            // CNPJ deve ter 14 dígitos
            if (cnpj.Length != 14)
                return false;

            // CNPJs conhecidos inválidos (todos os dígitos iguais)
            var cnpjsInvalidos = new[]
            {
                "00000000000000", "11111111111111", "22222222222222", "33333333333333",
                "44444444444444", "55555555555555", "66666666666666", "77777777777777",
                "88888888888888", "99999999999999"
            };

            if (cnpjsInvalidos.Contains(cnpj))
                return false;

            // Validação do primeiro dígito verificador
            var multiplicadores1 = new[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
            var soma = 0;
            for (int i = 0; i < 12; i++)
                soma += int.Parse(cnpj[i].ToString()) * multiplicadores1[i];

            var resto = soma % 11;
            var digitoVerificador1 = resto < 2 ? 0 : 11 - resto;

            if (int.Parse(cnpj[12].ToString()) != digitoVerificador1)
                return false;

            // Validação do segundo dígito verificador
            var multiplicadores2 = new[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
            soma = 0;
            for (int i = 0; i < 13; i++)
                soma += int.Parse(cnpj[i].ToString()) * multiplicadores2[i];

            resto = soma % 11;
            var digitoVerificador2 = resto < 2 ? 0 : 11 - resto;

            if (int.Parse(cnpj[13].ToString()) != digitoVerificador2)
                return false;

            return true;
        }

        /// <summary>
        /// Remove formatação de CPF/CNPJ (deixa apenas dígitos)
        /// </summary>
        public static string RemoverFormatacao(string? documento)
        {
            if (string.IsNullOrWhiteSpace(documento))
                return string.Empty;

            return new string(documento.Where(char.IsDigit).ToArray());
        }
    }
}
