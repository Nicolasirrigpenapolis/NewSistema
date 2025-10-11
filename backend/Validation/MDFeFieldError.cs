namespace Backend.Api.Validation
{
    public class MDFeFieldError
    {
        public string Secao { get; set; } = string.Empty;
        public string Campo { get; set; } = string.Empty;
        public string Regra { get; set; } = string.Empty;
        public string Mensagem { get; set; } = string.Empty;
        public string Severidade { get; set; } = "ERROR"; // ERROR | WARN
    }
}

