using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Backend.Api.Services.Ini
{
    public sealed class IniDocument
    {
        public IniDocument(IEnumerable<IniSection> sections)
        {
            if (sections == null)
            {
                throw new ArgumentNullException(nameof(sections));
            }

            var sectionList = sections.ToList();
            Sections = new ReadOnlyCollection<IniSection>(sectionList);
            SectionsByName = BuildIndex(sectionList);
        }

        public IReadOnlyList<IniSection> Sections { get; }

        public IReadOnlyDictionary<string, IReadOnlyList<IniSection>> SectionsByName { get; }

        public IReadOnlyList<IniSection> GetSections(string sectionName)
        {
            if (SectionsByName.TryGetValue(sectionName, out var list))
            {
                return list;
            }

            return Array.Empty<IniSection>();
        }

        private static IReadOnlyDictionary<string, IReadOnlyList<IniSection>> BuildIndex(IReadOnlyList<IniSection> sections)
        {
            var index = new Dictionary<string, List<IniSection>>(StringComparer.OrdinalIgnoreCase);

            foreach (var section in sections)
            {
                if (!index.TryGetValue(section.Name, out var list))
                {
                    list = new List<IniSection>();
                    index[section.Name] = list;
                }

                list.Add(section);
            }

            var readOnlyIndex = new Dictionary<string, IReadOnlyList<IniSection>>(StringComparer.OrdinalIgnoreCase);
            foreach (var kvp in index)
            {
                readOnlyIndex[kvp.Key] = new ReadOnlyCollection<IniSection>(kvp.Value);
            }

            return new ReadOnlyDictionary<string, IReadOnlyList<IniSection>>(readOnlyIndex);
        }
    }
}

