import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipos para jsPDF-autoTable
type Color = [number, number, number];

interface EmpresaInfo {
  nome: string;
  logoUrl: string | null;
}

/**
 * Converte uma imagem URL para Base64
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao converter imagem para base64:', error);
    return '';
  }
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Exporta dados para Excel com logo da empresa
 */
export async function exportToExcel(
  data: any[],
  columns: { header: string; key: string; width?: number }[],
  empresaInfo: EmpresaInfo,
  fileName: string = 'relatorio.xlsx'
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório', {
    properties: { tabColor: { argb: 'FF1F4788' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 6 }] // Congelar cabeçalhos
  });

  let currentRow = 1;

  // Adicionar logo se disponível
  if (empresaInfo.logoUrl) {
    try {
      const logoBase64 = await imageUrlToBase64(empresaInfo.logoUrl);
      if (logoBase64) {
        const imageId = workbook.addImage({
          base64: logoBase64,
          extension: 'png',
        });
        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 120, height: 40 }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar logo ao Excel:', error);
    }
  }

  // Linha 1-3: Espaço para logo e título
  worksheet.mergeCells(`A1:${String.fromCharCode(64 + columns.length)}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = empresaInfo.nome;
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1F4788' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 30;

  // Linha 2: Data de geração
  currentRow = 2;
  worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(64 + columns.length)}${currentRow}`);
  const dateCell = worksheet.getCell(`A${currentRow}`);
  dateCell.value = `Relatório gerado em ${formatDate(new Date())}`;
  dateCell.font = { name: 'Calibri', size: 10, italic: true };
  dateCell.alignment = { horizontal: 'center' };

  // Linha 3: Separador visual
  currentRow = 3;
  worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(64 + columns.length)}${currentRow}`);
  worksheet.getRow(currentRow).height = 5;
  worksheet.getRow(currentRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4788' }
  };

  // Linha 4: Espaçamento
  currentRow = 4;
  worksheet.getRow(currentRow).height = 8;

  // Linha 5-6: Cabeçalhos com estilo corporativo
  currentRow = 5;
  const headerRow = worksheet.getRow(currentRow);
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header.toUpperCase();
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4788' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF1F4788' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'medium', color: { argb: 'FF1F4788' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
    };
  });
  headerRow.height = 25;

  // Configurar largura das colunas
  columns.forEach((col, index) => {
    worksheet.getColumn(index + 1).width = col.width || 18;
  });

  // Adicionar dados com formatação profissional
  currentRow = 6;
  data.forEach((row, rowIndex) => {
    const values = columns.map(col => {
      const value = row[col.key];
      if (typeof value === 'number') {
        return value;
      }
      if (col.key.toLowerCase().includes('data') && value) {
        return formatDate(value);
      }
      return value || '-';
    });
    
    const dataRow = worksheet.addRow(values);
    dataRow.height = 20;

    // Estilizar células
    dataRow.eachCell((cell, colNumber) => {
      // Bordas sutis
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
      };

      // Alinhamento
      const col = columns[colNumber - 1];
      if (col?.key.toLowerCase().includes('valor')) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = 'R$ #,##0.00';
      } else if (col?.key.toLowerCase().includes('data')) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Fonte
      cell.font = { name: 'Calibri', size: 10 };
    });

    // Cor de fundo alternada (muito sutil)
    if (rowIndex % 2 === 0) {
      dataRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8F9FA' }
      };
    }
  });

  // Adicionar linha de rodapé
  const footerRow = worksheet.addRow([]);
  footerRow.height = 20;
  worksheet.mergeCells(`A${footerRow.number}:${String.fromCharCode(64 + columns.length)}${footerRow.number}`);
  const footerCell = worksheet.getCell(`A${footerRow.number}`);
  footerCell.value = `Total de registros: ${data.length}`;
  footerCell.font = { name: 'Calibri', size: 10, bold: true, italic: true };
  footerCell.alignment = { horizontal: 'right', vertical: 'middle' };
  footerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F0F0' }
  };

  // Configurações da planilha
  workbook.creator = empresaInfo.nome;
  workbook.created = new Date();
  workbook.modified = new Date();

  // Baixar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Exporta dados para PDF com logo da empresa - Design Moderno e Clean
 */
export async function exportToPDF(
  data: any[],
  columns: { header: string; dataKey: string }[],
  empresaInfo: EmpresaInfo,
  fileName: string = 'relatorio.pdf',
  title: string = 'Relatório'
) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Cores modernas e clean - Paleta profissional minimalista
  const primaryColor: [number, number, number] = [41, 98, 255]; // Azul moderno
  const textDark: [number, number, number] = [33, 33, 33]; // Texto escuro
  const textLight: [number, number, number] = [117, 117, 117]; // Texto secundário
  const borderColor: [number, number, number] = [224, 224, 224]; // Bordas sutis
  const bgLight: [number, number, number] = [249, 250, 251]; // Fundo alternado

  let yPosition = margin + 5;

  // ============= CABEÇALHO MINIMALISTA =============

  // Logo da empresa (se disponível) - pequeno e discreto
  if (empresaInfo.logoUrl) {
    try {
      const logoBase64 = await imageUrlToBase64(empresaInfo.logoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, yPosition, 30, 12);
      }
    } catch (error) {
      console.error('Erro ao adicionar logo ao PDF:', error);
    }
  }

  // Nome da empresa no topo (discreto)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textLight);
  doc.text(empresaInfo.nome, pageWidth - margin, yPosition + 4, { align: 'right' });

  yPosition += 18;

  // ============= TÍTULO CLEAN =============

  doc.setTextColor(...textDark);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPosition);

  yPosition += 3;

  // Linha sutil sob o título
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.line(margin, yPosition, margin + 40, yPosition);

  yPosition += 8;

  // ============= METADADOS DISCRETOS =============

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textLight);

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('pt-BR');
  const timeStr = currentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.text(`${dateStr} às ${timeStr}`, margin, yPosition);
  doc.text(`${data.length} registro${data.length !== 1 ? 's' : ''}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 8;

  // ============= TABELA MODERNA =============

  // Preparar dados da tabela
  const tableData = data.map(row =>
    columns.map(col => {
      const value = row[col.dataKey];
      if (typeof value === 'number' && col.dataKey.toLowerCase().includes('valor')) {
        return formatCurrency(value);
      }
      if (col.dataKey.toLowerCase().includes('data')) {
        return formatDate(value);
      }
      return value || '-';
    })
  );

  // Configurar tabela com design clean e moderno
  autoTable(doc, {
    startY: yPosition,
    head: [columns.map(col => col.header)],
    body: tableData,
    theme: 'plain',

    // Estilos do cabeçalho - Clean e minimalista
    headStyles: {
      fillColor: [248, 249, 250] as any, // Cinza muito claro
      textColor: textDark as Color,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      valign: 'middle',
      lineWidth: 0,
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 }
    },

    // Estilos gerais - Compacto e limpo
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      lineColor: borderColor as Color,
      lineWidth: 0.3,
      font: 'helvetica',
      textColor: textDark as Color,
      overflow: 'linebreak'
    },

    // Linhas alternadas muito sutis
    alternateRowStyles: {
      fillColor: [252, 252, 253] as any
    },

    // Estilos de coluna específicos
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.dataKey.toLowerCase().includes('valor')) {
        acc[index] = { halign: 'right', fontStyle: 'normal' };
      } else if (col.dataKey.toLowerCase().includes('data')) {
        acc[index] = { halign: 'center', cellWidth: 'auto' };
      } else {
        acc[index] = { halign: 'left' };
      }
      return acc;
    }, {} as any),

    margin: { top: 8, left: margin, right: margin, bottom: 25 },

    // Callbacks para customização
    didDrawPage: (data) => {
      // ============= RODAPÉ MINIMALISTA =============
      const footerY = pageHeight - 12;

      // Linha superior sutil
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

      // Informações do rodapé
      doc.setFontSize(7);
      doc.setTextColor(...textLight);
      doc.setFont('helvetica', 'normal');

      // Nome da empresa à esquerda (discreto)
      doc.text(empresaInfo.nome, margin, footerY);

      // Número da página centralizado
      const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.text(
        `${pageNumber}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      // Data à direita
      doc.text(
        dateStr,
        pageWidth - margin,
        footerY,
        { align: 'right' }
      );
    },

    // Callback após desenhar célula
    didDrawCell: (cellData) => {
      // Destacar valores negativos (sutil)
      if (cellData.section === 'body' && cellData.column.dataKey) {
        const colIndex = columns.findIndex(c => c.dataKey === cellData.column.dataKey);
        if (colIndex >= 0 && columns[colIndex].dataKey.toLowerCase().includes('valor')) {
          const cellValue = tableData[cellData.row.index][colIndex];
          if (cellValue && cellValue.includes('-')) {
            cellData.cell.styles.textColor = [239, 68, 68] as Color; // Vermelho moderno
          }
        }
      }

      // Adicionar linha sutil abaixo do cabeçalho
      if (cellData.section === 'head') {
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(
          cellData.cell.x,
          cellData.cell.y + cellData.cell.height,
          cellData.cell.x + cellData.cell.width,
          cellData.cell.y + cellData.cell.height
        );
      }
    }
  });

  // ============= RESUMO FINAL MINIMALISTA (se houver valores) =============

  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
  const hasValorColumn = columns.some(col => col.dataKey.toLowerCase().includes('valor'));

  if (hasValorColumn && data.length > 0) {
    let summaryY = finalY + 8;

    // Calcular totais
    const valorColumns = columns
      .map((col, index) => ({ col, index }))
      .filter(({ col }) => col.dataKey.toLowerCase().includes('valor'));

    if (valorColumns.length > 0) {
      // Linha sutil acima do resumo
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.line(pageWidth - 75, summaryY, pageWidth - margin, summaryY);
      summaryY += 6;

      valorColumns.forEach(({ col, index }) => {
        const total = data.reduce((sum, row) => {
          const val = row[col.dataKey];
          return sum + (typeof val === 'number' ? val : 0);
        }, 0);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textLight);
        doc.text(`Total ${col.header}:`, pageWidth - 75, summaryY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textDark);
        doc.text(formatCurrency(total), pageWidth - margin, summaryY, { align: 'right' });
        summaryY += 5;
      });
    }
  }

  // ============= ATUALIZAR RODAPÉ COM TOTAL DE PÁGINAS =============

  const totalPages = (doc as any).internal.getNumberOfPages();

  // Percorrer todas as páginas e atualizar o rodapé
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 12;

    // Apagar o texto anterior da página
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth / 2 - 25, footerY - 4, 50, 8, 'F');

    // Escrever o número atualizado (clean)
    doc.setFontSize(7);
    doc.setTextColor(...textLight);
    doc.text(
      `${i} de ${totalPages}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }

  // Salvar PDF
  doc.save(fileName);
}
