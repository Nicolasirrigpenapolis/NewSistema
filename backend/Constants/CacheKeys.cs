namespace Backend.Api.Constants
{
    /// <summary>
    /// Constantes para chaves de cache
    /// </summary>
    public static class CacheKeys
    {
        // Estados e Municípios
        public const string ESTADOS_ALL = "estados:all";
        public const string MUNICIPIOS_BY_UF = "municipios:uf:{0}";
        public const string MUNICIPIO_BY_CODE = "municipio:code:{0}";

        // Emitentes
        public const string EMITENTE_BY_ID = "emitente:id:{0}";
        public const string EMITENTES_ATIVOS = "emitentes:ativos";

        // Condutores
        public const string CONDUTORES_ATIVOS = "condutores:ativos";
        public const string CONDUTOR_BY_CPF = "condutor:cpf:{0}";

        // Veículos
        public const string VEICULOS_ATIVOS = "veiculos:ativos";
        public const string VEICULO_BY_PLACA = "veiculo:placa:{0}";

        // Seguradoras
        public const string SEGURADORAS_ATIVAS = "seguradoras:ativas";

        // Contratantes
        public const string CONTRATANTES_ATIVOS = "contratantes:ativos";

        // MDFe
        public const string MDFE_BY_ID = "mdfe:id:{0}";
        public const string MDFE_PROXIMO_NUMERO = "mdfe:proximo_numero:emitente:{0}";

        // Certificados
        public const string CERTIFICADOS_DISPONIVEIS = "certificados:disponiveis";

        // Cache patterns for invalidation
        public static class Patterns
        {
            public const string EMITENTES = @"emitente(s)?:.*";
            public const string CONDUTORES = @"condutor(es)?:.*";
            public const string VEICULOS = @"veiculo(s)?:.*";
            public const string MUNICIPIOS = @"municipi(o|os):.*";
            public const string SEGURADORAS = @"seguradora(s)?:.*";
            public const string CONTRATANTES = @"contratante(s)?:.*";
            public const string MDFE = @"mdfe:.*";
        }

        // Cache durations
        public static class Durations
        {
            public static readonly TimeSpan SHORT = TimeSpan.FromMinutes(5);
            public static readonly TimeSpan MEDIUM = TimeSpan.FromMinutes(30);
            public static readonly TimeSpan LONG = TimeSpan.FromHours(2);
            public static readonly TimeSpan EXTRA_LONG = TimeSpan.FromHours(24);
        }
    }
}
