using Microsoft.EntityFrameworkCore;
using Backend.Api.Models;

namespace Backend.Api.Data
{
    public class SistemaContext : DbContext
    {
        public SistemaContext(DbContextOptions<SistemaContext> options) : base(options)
        {
        }

        // DbSets das entidades
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Emitente> Emitentes { get; set; }
        public DbSet<Estado> Estados { get; set; }
        public DbSet<Municipio> Municipios { get; set; }
        public DbSet<Condutor> Condutores { get; set; }
        public DbSet<Veiculo> Veiculos { get; set; }
        public DbSet<Reboque> Reboques { get; set; }
        public DbSet<MDFe> MDFes { get; set; }
        public DbSet<MDFeReboque> MDFeReboques { get; set; }
        public DbSet<MDFeCte> MDFeCtes { get; set; }
        public DbSet<MDFeNfe> MDFeNfes { get; set; }
        public DbSet<MDFeMdfeTransp> MDFeMdfeTransps { get; set; }
        public DbSet<MDFeEvento> MDFeEventos { get; set; }
        public DbSet<MDFeUfPercurso> MDFeUfsPercurso { get; set; }
        public DbSet<MDFeLocalCarregamento> MDFeLocaisCarregamento { get; set; }
        public DbSet<MDFeLocalDescarregamento> MDFeLocaisDescarregamento { get; set; }
        public DbSet<MDFeCondutor> MDFeCondutores { get; set; }
        public DbSet<MDFeValePedagio> MDFeValesPedagio { get; set; }
        public DbSet<Contratante> Contratantes { get; set; }
        public DbSet<Seguradora> Seguradoras { get; set; }
        public DbSet<Cargo> Cargos { get; set; }
        public DbSet<Permissao> Permissoes { get; set; }
        public DbSet<CargoPermissao> CargoPermissoes { get; set; }

        public DbSet<MDFeUnidadeTransporte> MDFeUnidadesTransporte { get; set; }
        public DbSet<MDFeUnidadeCarga> MDFeUnidadesCarga { get; set; }
        public DbSet<MDFeLacreUnidadeTransporte> MDFeLacresUnidadeTransporte { get; set; }
        public DbSet<MDFeLacreUnidadeCarga> MDFeLacresUnidadeCarga { get; set; }
        public DbSet<MDFeLacreRodoviario> MDFeLacresRodoviarios { get; set; }
        public DbSet<MDFeProdutoPerigoso> MDFeProdutosPerigosos { get; set; }
        public DbSet<MDFeEntregaParcial> MDFeEntregasParciais { get; set; }
        public DbSet<MDFeNfePrestacaoParcial> MDFeNfesPrestacaoParcial { get; set; }
        public DbSet<MDFePagamento> MDFePagamentos { get; set; }
        public DbSet<MDFePagamentoComponente> MDFePagamentoComponentes { get; set; }
        public DbSet<MDFePagamentoPrazo> MDFePagamentoPrazos { get; set; }
        public DbSet<MDFePagamentoBanco> MDFePagamentoBancos { get; set; }
        public DbSet<MDFeAutorizacaoDownloadXml> MDFeAutorizacoesXml { get; set; }
        public DbSet<MDFeResponsavelTecnico> MDFeResponsaveisTecnicos { get; set; }

        // DbSets para os mÃƒÂ³dulos de relatÃƒÂ³rios
        public DbSet<Fornecedor> Fornecedores { get; set; }
        public DbSet<ManutencaoVeiculo> ManutencaoVeiculos { get; set; }
        public DbSet<ManutencaoPeca> ManutencaoPecas { get; set; }
        public DbSet<Viagem> Viagens { get; set; }
        public DbSet<DespesaViagem> DespesasViagem { get; set; }
        public DbSet<ReceitaViagem> ReceitasViagem { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // ConfiguraÃƒÂ§ÃƒÂ£o do Usuario
            builder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuarios");
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.UserName).IsUnique();
                
                // Índice na foreign key
                entity.HasIndex(u => u.CargoId);

                // Relacionamento com Cargo
                entity.HasOne(u => u.Cargo)
                    .WithMany(c => c.Usuarios)
                    .HasForeignKey(u => u.CargoId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // ConfiguraÃƒÂ§ÃƒÂ£o do Cargo
            builder.Entity<Cargo>(entity =>
            {
                entity.HasIndex(c => c.Nome).IsUnique();
            });

            // ConfiguraÃƒÂ§ÃƒÂ£o da Permissao
            builder.Entity<Permissao>(entity =>
            {
                entity.HasIndex(p => p.Codigo).IsUnique();
            });

            // ConfiguraÃƒÂ§ÃƒÂ£o do CargoPermissao
            builder.Entity<CargoPermissao>(entity =>
            {
                entity.HasKey(cp => cp.Id);

                // ÃƒÂndice ÃƒÂºnico composto para evitar duplicaÃƒÂ§ÃƒÂ£o
                entity.HasIndex(cp => new { cp.CargoId, cp.PermissaoId }).IsUnique();

                // Relacionamentos
                entity.HasOne(cp => cp.Cargo)
                    .WithMany(c => c.CargoPermissoes)
                    .HasForeignKey(cp => cp.CargoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(cp => cp.Permissao)
                    .WithMany(p => p.CargoPermissoes)
                    .HasForeignKey(cp => cp.PermissaoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ConfiguraÃƒÂ§ÃƒÂµes especÃƒÂ­ficas
            
            // Emitente - CNPJ ou CPF ÃƒÂ© obrigatÃƒÂ³rio
            builder.Entity<Emitente>(entity =>
            {
                entity.HasIndex(e => e.Cnpj).IsUnique().HasFilter("[Cnpj] IS NOT NULL");
                entity.HasIndex(e => e.Cpf).IsUnique().HasFilter("[Cpf] IS NOT NULL");
                entity.HasIndex(e => e.RazaoSocial); // Para buscas e filtros
            });

            // Municipio - CÃƒÂ³digo ÃƒÂºnico
            builder.Entity<Municipio>(entity =>
            {
                entity.HasIndex(e => e.Codigo).IsUnique();
            });

            // Condutor - CPF ÃƒÂºnico
            builder.Entity<Condutor>(entity =>
            {
                entity.HasIndex(e => e.Cpf).IsUnique();
                entity.HasIndex(e => e.Nome); // Para buscas e filtros
            });

            // Veiculo - Placa ÃƒÂºnica
            builder.Entity<Veiculo>(entity =>
            {
                entity.HasIndex(e => e.Placa).IsUnique();
            });

            // Reboque - Placa ÃƒÂºnica
            builder.Entity<Reboque>(entity =>
            {
                entity.HasIndex(e => e.Placa).IsUnique();
            });

            // MDFe - Chave de acesso ÃƒÂºnica se preenchida
            builder.Entity<MDFe>(entity =>
            {
                entity.HasIndex(e => e.ChaveAcesso).IsUnique().HasFilter("[ChaveAcesso] IS NOT NULL");
                
                // Série e número únicos por emitente
                entity.HasIndex(e => new { e.EmitenteId, e.Serie, e.NumeroMdfe }).IsUnique();
                
                // Índices nas foreign keys para performance
                entity.HasIndex(m => m.CondutorId);
                entity.HasIndex(m => m.VeiculoId);
                entity.HasIndex(m => m.MunicipioCarregamentoId);
                entity.HasIndex(m => m.ContratanteId);
                entity.HasIndex(m => m.SeguradoraId);
                
                // Índices para filtros por data e status
                entity.HasIndex(m => m.DataEmissao);
                entity.HasIndex(m => m.DataInicioViagem);
                entity.HasIndex(m => m.StatusSefaz);
                
                // ConfiguraÃƒÂ§ÃƒÂ£o de precisÃƒÂ£o para campos decimais
                entity.Property(e => e.PesoBrutoTotal)
                    .HasColumnType("decimal(18,3)");
                    
                entity.Property(e => e.ValorTotal)
                    .HasColumnType("decimal(18,2)");
                    

                // Relacionamentos
                entity.HasOne(m => m.Emitente)
                    .WithMany(e => e.MDFes)
                    .HasForeignKey(m => m.EmitenteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Condutor)
                    .WithMany(c => c.MDFes)
                    .HasForeignKey(m => m.CondutorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Veiculo)
                    .WithMany(v => v.MDFes)
                    .HasForeignKey(m => m.VeiculoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.MunicipioCarregamento)
                    .WithMany(mu => mu.MDFesCarregamento)
                    .HasForeignKey(m => m.MunicipioCarregamentoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Contratante)
                    .WithMany(c => c.MDFes)
                    .HasForeignKey(m => m.ContratanteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Seguradora)
                    .WithMany(s => s.MDFes)
                    .HasForeignKey(m => m.SeguradoraId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MDFeReboque - Chave composta
            builder.Entity<MDFeReboque>(entity =>
            {
                entity.HasKey(mr => new { mr.MDFeId, mr.ReboqueId });

                entity.HasOne(mr => mr.MDFe)
                    .WithMany(m => m.Reboques)
                    .HasForeignKey(mr => mr.MDFeId);

                entity.HasOne(mr => mr.Reboque)
                    .WithMany(r => r.MDFeReboques)
                    .HasForeignKey(mr => mr.ReboqueId);
            });

            // MDFeCte
            builder.Entity<MDFeCte>(entity =>
            {
                entity.HasIndex(mc => mc.ChaveCte).IsUnique();
                
                // Índices nas foreign keys
                entity.HasIndex(mc => mc.MDFeId);
                entity.HasIndex(mc => mc.MunicipioDescargaId);

                entity.HasOne(mc => mc.MDFe)
                    .WithMany(m => m.DocumentosCte)
                    .HasForeignKey(mc => mc.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(mc => mc.MunicipioDescarga)
                    .WithMany(mu => mu.MDFesCte)
                    .HasForeignKey(mc => mc.MunicipioDescargaId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MDFeNfe
            builder.Entity<MDFeNfe>(entity =>
            {
                entity.HasIndex(mn => mn.ChaveNfe).IsUnique();
                
                // Índices nas foreign keys
                entity.HasIndex(mn => mn.MDFeId);
                entity.HasIndex(mn => mn.MunicipioDescargaId);

                entity.HasOne(mn => mn.MDFe)
                    .WithMany(m => m.DocumentosNfe)
                    .HasForeignKey(mn => mn.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(mn => mn.MunicipioDescarga)
                    .WithMany(mu => mu.MDFesNfe)
                    .HasForeignKey(mn => mn.MunicipioDescargaId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MDFeEvento
            builder.Entity<MDFeEvento>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(me => me.MDFeId);
                
                entity.HasOne(me => me.MDFe)
                    .WithMany(m => m.Eventos)
                    .HasForeignKey(me => me.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // MDFeUfPercurso
            builder.Entity<MDFeUfPercurso>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(mup => mup.MDFeId);
                
                entity.HasOne(mup => mup.MDFe)
                    .WithMany(m => m.UfsPercurso)
                    .HasForeignKey(mup => mup.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // MDFeLocalCarregamento
            builder.Entity<MDFeLocalCarregamento>(entity =>
            {
                // Índices nas foreign keys
                entity.HasIndex(mlc => mlc.MDFeId);
                entity.HasIndex(mlc => mlc.MunicipioId);
                
                entity.HasOne(mlc => mlc.MDFe)
                    .WithMany(m => m.LocaisCarregamento)
                    .HasForeignKey(mlc => mlc.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(mlc => mlc.Municipio)
                    .WithMany(mu => mu.LocaisCarregamento)
                    .HasForeignKey(mlc => mlc.MunicipioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MDFeLocalDescarregamento
            builder.Entity<MDFeLocalDescarregamento>(entity =>
            {
                // Índices nas foreign keys
                entity.HasIndex(mld => mld.MDFeId);
                entity.HasIndex(mld => mld.MunicipioId);
                
                entity.HasOne(mld => mld.MDFe)
                    .WithMany(m => m.LocaisDescarregamento)
                    .HasForeignKey(mld => mld.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(mld => mld.Municipio)
                    .WithMany(mu => mu.LocaisDescarregamento)
                    .HasForeignKey(mld => mld.MunicipioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MDFeCondutor
            builder.Entity<MDFeCondutor>(entity =>
            {
                // Índices
                entity.HasIndex(mc => mc.MDFeId);
                entity.HasIndex(mc => mc.CpfCondutor);
                
                entity.HasOne(mc => mc.MDFe)
                    .WithMany(m => m.CondutoresAdicionais)
                    .HasForeignKey(mc => mc.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Contratante - CNPJ ou CPF ÃƒÂºnico
            builder.Entity<Contratante>(entity =>
            {
                entity.HasIndex(c => c.Cnpj).IsUnique().HasFilter("[Cnpj] IS NOT NULL");
                entity.HasIndex(c => c.Cpf).IsUnique().HasFilter("[Cpf] IS NOT NULL");
                entity.HasIndex(c => c.RazaoSocial); // Para buscas e filtros
            });

            // Seguradora - CNPJ único
            builder.Entity<Seguradora>(entity =>
            {
                entity.HasIndex(s => s.Cnpj).IsUnique();
                entity.HasIndex(s => s.RazaoSocial); // Para buscas e filtros
            });

            // MDFeValePedagio
            builder.Entity<MDFeValePedagio>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(mv => mv.MDFeId);
                
                entity.HasOne(mv => mv.MDFe)
                    .WithMany(m => m.ValesPedagio)
                    .HasForeignKey(mv => mv.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<MDFePagamento>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(p => p.MDFeId);
                
                entity.HasOne(p => p.MDFe)
                    .WithMany(m => m.Pagamentos)
                    .HasForeignKey(p => p.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(p => p.ValorContrato).HasColumnType("decimal(18,2)");
                entity.Property(p => p.IndicadorPagamento).HasMaxLength(1);
                entity.Property(p => p.TipoPagamento).HasMaxLength(1);
            });

            builder.Entity<MDFePagamentoComponente>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(c => c.PagamentoId);
                
                entity.HasOne(c => c.Pagamento)
                    .WithMany(p => p.Componentes)
                    .HasForeignKey(c => c.PagamentoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(c => c.Valor).HasColumnType("decimal(18,2)");
            });

            builder.Entity<MDFePagamentoPrazo>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(p => p.PagamentoId);
                
                entity.HasOne(p => p.Pagamento)
                    .WithMany(pag => pag.Prazos)
                    .HasForeignKey(p => p.PagamentoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(p => p.ValorParcela).HasColumnType("decimal(18,2)");
            });

            builder.Entity<MDFePagamentoBanco>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(b => b.PagamentoId);
                
                entity.HasOne(b => b.Pagamento)
                    .WithMany(p => p.DadosBancarios)
                    .HasForeignKey(b => b.PagamentoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<MDFeAutorizacaoDownloadXml>(entity =>
            {
                entity.HasOne(a => a.MDFe)
                    .WithMany(m => m.AutorizacoesXml)
                    .HasForeignKey(a => a.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(a => new { a.MDFeId, a.Documento }).IsUnique();
            });

            builder.Entity<MDFeResponsavelTecnico>(entity =>
            {
                entity.HasOne(r => r.MDFe)
                    .WithOne(m => m.ResponsavelTecnico)
                    .HasForeignKey<MDFeResponsavelTecnico>(r => r.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(r => r.MDFeId).IsUnique();
            });

            builder.Entity<MDFeUnidadeTransporte>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(ut => ut.MDFeId);
                
                entity.HasOne(ut => ut.MDFe)
                    .WithMany(m => m.UnidadesTransporte)
                    .HasForeignKey(ut => ut.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(ut => ut.UnidadesCarga)
                    .WithOne(uc => uc.UnidadeTransporte)
                    .HasForeignKey(uc => uc.MDFeUnidadeTransporteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(ut => ut.Lacres)
                    .WithOne(l => l.UnidadeTransporte)
                    .HasForeignKey(l => l.MDFeUnidadeTransporteId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<MDFeUnidadeCarga>(entity =>
            {
                // Índices nas foreign keys
                entity.HasIndex(uc => uc.MDFeId);
                entity.HasIndex(uc => uc.MDFeUnidadeTransporteId);
                
                entity.HasOne(uc => uc.MDFe)
                    .WithMany(m => m.UnidadesCarga)
                    .HasForeignKey(uc => uc.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(uc => uc.LacresUnidadeCarga)
                    .WithOne(l => l.UnidadeCarga)
                    .HasForeignKey(l => l.UnidadeCargaId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<MDFeLacreUnidadeTransporte>(entity =>
            {
                // Índice na foreign key
                entity.HasIndex(l => l.MDFeUnidadeTransporteId);
                
                entity.HasOne(l => l.UnidadeTransporte)
                    .WithMany(ut => ut.Lacres)
                    .HasForeignKey(l => l.MDFeUnidadeTransporteId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MDFeMdfeTransp
            builder.Entity<MDFeMdfeTransp>(entity =>
            {
                entity.HasIndex(mmt => mmt.ChaveMdfeTransp).IsUnique();
                
                // Índices nas foreign keys
                entity.HasIndex(mmt => mmt.MDFeId);
                entity.HasIndex(mmt => mmt.MunicipioDescargaId);

                entity.HasOne(mmt => mmt.MDFe)
                    .WithMany(m => m.DocumentosMdfeTransp)
                    .HasForeignKey(mmt => mmt.MDFeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(mmt => mmt.MunicipioDescarga)
                    .WithMany(mu => mu.MDFesMdfeTransp)
                    .HasForeignKey(mmt => mmt.MunicipioDescargaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(mmt => mmt.QuantidadeRateada)
                    .HasColumnType("decimal(18,3)");
            });

            // ConfiguraÃƒÂ§ÃƒÂµes para os mÃƒÂ³dulos de relatÃƒÂ³rios

            // Fornecedor - CNPJ ou CPF ÃƒÂºnico
            builder.Entity<Fornecedor>(entity =>
            {
                entity.HasIndex(f => f.Cnpj).IsUnique().HasFilter("[Cnpj] IS NOT NULL");
                entity.HasIndex(f => f.Cpf).IsUnique().HasFilter("[Cpf] IS NOT NULL");
                entity.HasIndex(f => f.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
                entity.HasIndex(f => f.Nome); // Para buscas e filtros
            });

            // ManutencaoVeiculo
            builder.Entity<ManutencaoVeiculo>(entity =>
            {
                entity.Property(m => m.ValorMaoObra)
                    .HasColumnType("decimal(18,2)");
                
                // Índices nas foreign keys
                entity.HasIndex(m => m.VeiculoId);
                entity.HasIndex(m => m.FornecedorId);
                
                // Índice para filtros por data
                entity.HasIndex(m => m.DataManutencao);

                entity.HasOne(m => m.Veiculo)
                    .WithMany()
                    .HasForeignKey(m => m.VeiculoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Fornecedor)
                    .WithMany(f => f.Manutencoes)
                    .HasForeignKey(m => m.FornecedorId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // ManutencaoPeca
            builder.Entity<ManutencaoPeca>(entity =>
            {
                entity.Property(p => p.Quantidade)
                    .HasColumnType("decimal(18,3)");

                entity.Property(p => p.ValorUnitario)
                    .HasColumnType("decimal(18,2)");
                
                // Índice na foreign key
                entity.HasIndex(p => p.ManutencaoId);

                entity.HasOne(p => p.Manutencao)
                    .WithMany(m => m.Pecas)
                    .HasForeignKey(p => p.ManutencaoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Viagem
            builder.Entity<Viagem>(entity =>
            {
                // Índices nas foreign keys
                entity.HasIndex(v => v.VeiculoId);
                entity.HasIndex(v => v.CondutorId);
                
                // Índices para filtros e ordenação
                entity.HasIndex(v => v.DataInicio);
                entity.HasIndex(v => v.DataFim);
                
                entity.HasOne(v => v.Veiculo)
                    .WithMany()
                    .HasForeignKey(v => v.VeiculoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // DespesaViagem
            builder.Entity<DespesaViagem>(entity =>
            {
                entity.Property(d => d.Valor)
                    .HasColumnType("decimal(18,2)");

                // Índice na foreign key para melhor performance
                entity.HasIndex(d => d.ViagemId);

                entity.HasOne(d => d.Viagem)
                    .WithMany(v => v.Despesas)
                    .HasForeignKey(d => d.ViagemId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ReceitaViagem
            builder.Entity<ReceitaViagem>(entity =>
            {
                entity.Property(r => r.Valor)
                    .HasColumnType("decimal(18,2)");

                // Índice na foreign key para melhor performance
                entity.HasIndex(r => r.ViagemId);

                entity.HasOne(r => r.Viagem)
                    .WithMany(v => v.Receitas)
                    .HasForeignKey(r => r.ViagemId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // === FILTROS GLOBAIS PARA SOFT DELETE ===
            // Apenas registros ativos são retornados por padrão
            builder.Entity<Veiculo>().HasQueryFilter(v => v.Ativo);
            builder.Entity<Condutor>().HasQueryFilter(c => c.Ativo);
            builder.Entity<Contratante>().HasQueryFilter(c => c.Ativo);
            builder.Entity<Seguradora>().HasQueryFilter(s => s.Ativo);
            builder.Entity<Fornecedor>().HasQueryFilter(f => f.Ativo);
            builder.Entity<Reboque>().HasQueryFilter(r => r.Ativo);
            builder.Entity<Emitente>().HasQueryFilter(e => e.Ativo);
            builder.Entity<Usuario>().HasQueryFilter(u => u.Ativo);
            builder.Entity<Cargo>().HasQueryFilter(c => c.Ativo);

        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Fallback se nÃƒÂ£o configurado via DI
                optionsBuilder.UseSqlServer("Server=localhost\\SQLEXPRESS02;Database=SistemaDesenvolvimento;Trusted_Connection=true;TrustServerCertificate=true;");
            }
        }
    }
}

