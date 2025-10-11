using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class MunicipioListDto
    {
        public int Id { get; set; }
        public int Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }

    public class MunicipioDetailDto
    {
        public int Id { get; set; }
        public int Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }

    public class MunicipioDto
    {
        public int Id { get; set; }
        public int Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }

    public class MunicipioCreateDto
    {
        [Required]
        public int Codigo { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(2)]
        public string Uf { get; set; } = string.Empty;
    }

    public class MunicipioUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(2)]
        public string Uf { get; set; } = string.Empty;

        public bool Ativo { get; set; } = true;
    }

    public class ImportResultDto
    {
        public int TotalInseridos { get; set; }
        public int TotalAtualizados { get; set; }
        public int TotalIgnorados { get; set; }
        public int TotalEstados { get; set; }
        public List<string> Erros { get; set; } = new List<string>();
        public TimeSpan TempoProcessamento { get; set; }
        public bool Sucesso { get; set; }
    }
}
