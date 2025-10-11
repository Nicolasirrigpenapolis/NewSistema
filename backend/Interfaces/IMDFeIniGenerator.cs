using Backend.Api.Models;

namespace Backend.Api.Interfaces
{
    /// <summary>
    /// Interface para geração de arquivos INI do MDFe
    /// </summary>
    public interface IMDFeIniGenerator
    {
        /// <summary>
        /// Gera arquivo INI completo do MDFe
        /// </summary>
        /// <param name="mdfe">Modelo MDFe</param>
        /// <returns>Conteúdo do arquivo INI</returns>
        Task<string> GerarIniAsync(MDFe mdfe);

        /// <summary>
        /// Gera arquivo INI de evento (Cancelamento, Encerramento, etc)
        /// </summary>
        /// <param name="tipoEvento">Código do evento (ex: 110111=Cancelamento)</param>
        /// <param name="mdfe">Modelo MDFe</param>
        /// <param name="parametrosEvento">Parâmetros específicos do evento</param>
        /// <returns>Conteúdo do arquivo INI do evento</returns>
        string GerarIniEvento(string tipoEvento, MDFe mdfe, Dictionary<string, string> parametrosEvento);
    }
}

