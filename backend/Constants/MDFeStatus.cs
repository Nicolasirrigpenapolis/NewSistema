namespace Backend.Api.Constants
{
    public static class MDFeStatus
    {
        public const string Rascunho = "RASCUNHO";
        public const string EmEdicao = "EDICAO";
        public const string Assinada = "ASSINADA";
        public const string Transmitida = "TRANSMITIDA";
        public const string XmlGerado = "XML_GERADO";
        public const string Autorizada = "AUTORIZADO";
        public const string Denegada = "DENEGADA";
        public const string Rejeitada = "REJEITADA";
        public const string Cancelada = "CANCELADO";
        public const string Encerrada = "ENCERRADO";
        public const string ErroTransmissao = "ERRO_TRANSMISSAO";

        public static bool EhStatusFinal(string status)
        {
            return status switch
            {
                Autorizada => true,
                Denegada => true,
                Rejeitada => true,
                Cancelada => true,
                Encerrada => true,
                _ => false
            };
        }
    }
}

