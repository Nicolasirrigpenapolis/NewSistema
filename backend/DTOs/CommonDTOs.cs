namespace Backend.Api.DTOs
{
    /// <summary>
    /// DTOs comuns compartilhados entre controllers
    /// </summary>

    public class EstadoDto
    {
        public int Id { get; set; }
        public string Sigla { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
    }

    public class CodigoMunicipioDto
    {
        public int Codigo { get; set; }
        public string Municipio { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
    }
}
