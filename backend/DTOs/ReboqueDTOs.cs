using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class ReboqueCreateDto
    {
        [Required]
        [StringLength(8)]
        public string Placa { get; set; } = string.Empty;


        [Required]
        public int Tara { get; set; }


        [Required]
        [StringLength(50)]
        public string TipoRodado { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string TipoCarroceria { get; set; } = string.Empty;

        [Required]
        [StringLength(2)]
        public string Uf { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Rntrc { get; set; }
    }

    public class ReboqueUpdateDto : ReboqueCreateDto
    {
        // Herda todas as propriedades de ReboqueCreateDto
    }

    public class ReboqueListDto
    {
        public int Id { get; set; }
        public string Placa { get; set; } = string.Empty;
        public int Tara { get; set; }
        public string TipoRodado { get; set; } = string.Empty;
        public string TipoCarroceria { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public string? Rntrc { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class ReboqueResponseDto
    {
        public int Id { get; set; }
        public string Placa { get; set; } = string.Empty;
        public int Tara { get; set; }
        public string TipoRodado { get; set; } = string.Empty;
        public string TipoCarroceria { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public string? Rntrc { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? DataUltimaAlteracao { get; set; }
    }
}
