using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class ValidarIniRequestDto
    {
        [Required]
        public string IniConteudo { get; set; } = string.Empty;
    }
}

