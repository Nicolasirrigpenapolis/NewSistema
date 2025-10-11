using Backend.Api.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Backend.Api.Services.Ini
{
    public sealed class MdfeIniValidator : IMdfeIniValidator
    {
        private readonly IniParser _parser;
        private readonly MdfeIniTemplateProvider _templateProvider;

        public MdfeIniValidator(IniParser parser, MdfeIniTemplateProvider templateProvider)
        {
            _parser = parser;
            _templateProvider = templateProvider;
        }

        public IniComparisonResult CompareWithTemplate(string iniContent)
        {
            if (string.IsNullOrWhiteSpace(iniContent))
            {
                throw new ArgumentException("Conteudo INI vazio.", nameof(iniContent));
            }

            var comparison = new IniComparisonResult();

            IniDocument template;
            IniDocument atual;

            try
            {
                template = _templateProvider.GetTemplateDocument();
                atual = _parser.Parse(iniContent);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Falha ao comparar INI com modelo: {ex.Message}", ex);
            }

            var templateSections = BuildTemplateSections(template.Sections);

            foreach (var atualSection in atual.Sections)
            {
                if (templateSections.ExactSections.TryGetValue(atualSection.Name, out var queue) && queue.Count > 0)
                {
                    var templateSection = queue.Dequeue();
                    CompareSection(templateSection.KeyValues, atualSection.KeyValues, atualSection.Name, comparison);
                    continue;
                }

                SectionPattern? matchedPattern = null;
                foreach (var pattern in templateSections.PatternSections)
                {
                    if (pattern.IsMatch(atualSection.Name))
                    {
                        matchedPattern = pattern;
                        break;
                    }
                }

                if (matchedPattern != null)
                {
                    matchedPattern.RegisterMatch();
                    CompareSection(matchedPattern.TemplateKeys, atualSection.KeyValues, atualSection.Name, comparison);
                }
                else
                {
                    AddUnique(comparison.ExtraSections, atualSection.Name);
                }
            }

            foreach (var kvp in templateSections.ExactSections)
            {
                foreach (var remaining in kvp.Value)
                {
                    AddUnique(comparison.MissingSections, remaining.Name);
                }
            }

            foreach (var pattern in templateSections.PatternSections)
            {
                if (pattern.IsMandatory && !pattern.HasMatch)
                {
                    AddUnique(comparison.MissingSections, pattern.TemplateName);
                }
            }

            comparison.ComputeIsMatch();
            return comparison;
        }

        public IniDocument Parse(string iniContent) => _parser.Parse(iniContent);

        public string GetTemplateContent() => _templateProvider.GetTemplateContent();

        private static void CompareSection(
            IReadOnlyDictionary<string, string> templateKeys,
            IReadOnlyDictionary<string, string> atualKeys,
            string sectionName,
            IniComparisonResult comparison)
        {
            foreach (var templateKey in templateKeys.Keys)
            {
                if (!atualKeys.TryGetValue(templateKey, out var value))
                {
                    AddToDictionaryList(comparison.MissingKeys, sectionName, templateKey);
                    continue;
                }

                if (string.IsNullOrWhiteSpace(value))
                {
                    AddToDictionaryList(comparison.EmptyValues, sectionName, templateKey);
                }
                else if (ContainsPlaceholderValue(value))
                {
                    AddToDictionaryList(comparison.PlaceholderValues, sectionName, templateKey);
                }
            }

            foreach (var key in atualKeys.Keys)
            {
                if (!templateKeys.ContainsKey(key))
                {
                    AddToDictionaryList(comparison.ExtraKeys, sectionName, key);
                }
            }
        }

        private static bool ContainsPlaceholderValue(string value) => value.Contains('<') && value.Contains('>');

        private static void AddToDictionaryList(IDictionary<string, List<string>> dictionary, string section, string key)
        {
            if (!dictionary.TryGetValue(section, out var list))
            {
                list = new List<string>();
                dictionary[section] = list;
            }

            if (!list.Contains(key, StringComparer.OrdinalIgnoreCase))
            {
                list.Add(key);
            }
        }

        private static void AddUnique(ICollection<string> collection, string value)
        {
            if (!collection.Contains(value, StringComparer.OrdinalIgnoreCase))
            {
                collection.Add(value);
            }
        }

        private static TemplateSections BuildTemplateSections(IReadOnlyList<IniSection> sections)
        {
            var result = new TemplateSections();

            foreach (var section in sections)
            {
                if (ContainsPlaceholderToken(section.Name))
                {
                    result.PatternSections.Add(new SectionPattern(section));
                }
                else
                {
                    if (!result.ExactSections.TryGetValue(section.Name, out var queue))
                    {
                        queue = new Queue<IniSection>();
                        result.ExactSections[section.Name] = queue;
                    }

                    queue.Enqueue(section);
                }
            }

            return result;
        }

        private static bool ContainsPlaceholderToken(string sectionName)
        {
            if (string.IsNullOrWhiteSpace(sectionName))
            {
                return false;
            }

            var lower = sectionName.ToLowerInvariant();
            return lower.Contains("xxx") || lower.Contains("yyy") || lower.Contains("zzz");
        }

        private sealed class TemplateSections
        {
            public Dictionary<string, Queue<IniSection>> ExactSections { get; } = new(StringComparer.OrdinalIgnoreCase);
            public List<SectionPattern> PatternSections { get; } = new();
        }

        private sealed class SectionPattern
        {
            private readonly Regex _regex;
            private int _matchCount;

            public SectionPattern(IniSection templateSection)
            {
                TemplateName = templateSection.Name;
                TemplateKeys = templateSection.KeyValues;
                _regex = BuildRegex(templateSection.Name);
            }

            public string TemplateName { get; }
            public IReadOnlyDictionary<string, string> TemplateKeys { get; }
            public bool HasMatch => _matchCount > 0;
            public bool IsMandatory => false;

            public bool IsMatch(string sectionName) => _regex.IsMatch(sectionName);

            public void RegisterMatch() => _matchCount++;

            private static Regex BuildRegex(string templateName)
            {
                var pattern = new System.Text.StringBuilder();
                pattern.Append('^');

                for (var index = 0; index < templateName.Length;)
                {
                    var current = templateName[index];
                    var lower = char.ToLowerInvariant(current);

                    if (lower == 'x' || lower == 'y' || lower == 'z')
                    {
                        var count = CountConsecutive(templateName, index, lower);
                        if (count >= 3)
                        {
                            pattern.Append("\\d{" + count + "}");
                            index += count;
                            continue;
                        }
                    }

                    pattern.Append(Regex.Escape(current.ToString()));
                    index++;
                }

                pattern.Append('$');
                return new Regex(pattern.ToString(), RegexOptions.Compiled | RegexOptions.IgnoreCase);
            }

            private static int CountConsecutive(string source, int startIndex, char target)
            {
                var count = 0;
                for (var i = startIndex; i < source.Length; i++)
                {
                    if (char.ToLowerInvariant(source[i]) == target)
                    {
                        count++;
                    }
                    else
                    {
                        break;
                    }
                }

                return count;
            }
        }
    }
}

