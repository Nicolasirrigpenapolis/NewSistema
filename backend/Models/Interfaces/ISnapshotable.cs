namespace Backend.Api.Models.Interfaces
{
    /// <summary>
    /// Interface para entidades transacionais que capturam snapshots de dados relacionados
    /// </summary>
    public interface ISnapshotable
    {
        void CapturarSnapshots();
        string? ObterSnapshotJson();
    }
}
