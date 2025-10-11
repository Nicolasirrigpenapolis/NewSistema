namespace Backend.Api.DTOs
{
    public class CargoCreateRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
    }

    public class CargoUpdateRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; } = true;
    }

    public class CargoResponse
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? DataUltimaAlteracao { get; set; }
        public int QuantidadeUsuarios { get; set; }
    }
}
