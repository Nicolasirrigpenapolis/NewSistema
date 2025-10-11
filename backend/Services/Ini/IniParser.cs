using System;
using System.Collections.Generic;
using System.IO;

namespace Backend.Api.Services.Ini
{
    /// <summary>
    /// Parser simples de arquivos INI que preserva a ordem das secoes.
    /// </summary>
    public sealed class IniParser
    {
        private readonly IEqualityComparer<string> _keyComparer = StringComparer.OrdinalIgnoreCase;

        public IniDocument Parse(string iniContent)
        {
            if (string.IsNullOrWhiteSpace(iniContent))
            {
                throw new ArgumentException("Conteudo INI vazio", nameof(iniContent));
            }

            using var reader = new StringReader(iniContent);
            var orderedSections = new List<(string Name, Dictionary<string, string> Values)>();
            Dictionary<string, string>? currentSectionValues = null;

            string? rawLine;
            while ((rawLine = reader.ReadLine()) != null)
            {
                var line = rawLine.Trim();

                if (string.IsNullOrEmpty(line) || line.StartsWith(";"))
                {
                    continue;
                }

                if (line.StartsWith("[") && line.EndsWith("]"))
                {
                    var currentSectionName = line.Substring(1, line.Length - 2).Trim();
                    currentSectionValues = new Dictionary<string, string>(_keyComparer);
                    orderedSections.Add((currentSectionName, currentSectionValues));
                    continue;
                }

                if (currentSectionValues == null)
                {
                    throw new FormatException($"Linha fora de secao detectada: '{line}'");
                }

                var separatorIndex = line.IndexOf('=');
                if (separatorIndex < 0)
                {
                    continue;
                }

                var key = line[..separatorIndex].Trim();
                var valueSegment = line[(separatorIndex + 1)..];
                var value = RemoverComentarios(valueSegment).Trim();

                currentSectionValues[key] = value;
            }

            var sections = new List<IniSection>(orderedSections.Count);
            foreach (var section in orderedSections)
            {
                sections.Add(new IniSection(section.Name, section.Values));
            }

            return new IniDocument(sections);
        }

        private static string RemoverComentarios(string valueSegment)
        {
            var index = valueSegment.IndexOf(';');
            if (index >= 0)
            {
                return valueSegment[..index];
            }

            return valueSegment;
        }
    }
}


