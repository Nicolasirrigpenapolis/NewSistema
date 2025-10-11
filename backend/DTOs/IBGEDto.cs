namespace Backend.Api.DTOs
{
    public class EstadoIBGE
    {
        public int Id { get; set; }
        public string Sigla { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
    }

    public class MunicipioIBGE
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string UF { get; set; } = string.Empty;
    }

    // EstadoDto removido - usando CommonDTOs.cs

    public class MunicipioIBGEDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string UF { get; set; } = string.Empty;
    }
}
