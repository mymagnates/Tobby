import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { needsUnicodePrint } from '../utils/reportDocument.js'

export function createReportPdf(report) {
  if (needsUnicodePrint(report)) throw new Error('Use Print / Save PDF to preserve non-Latin text.')
  const doc = new jsPDF({
    orientation: report.landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })
  const width = doc.internal.pageSize.getWidth(),
    height = doc.internal.pageSize.getHeight()
  const margin = 16,
    usable = width - margin * 2
  const ink = [36, 56, 48],
    muted = [101, 117, 108],
    green = [37, 75, 57]
  let y = margin
  doc.setProperties({
    title: report.title,
    subject: report.reportTitle,
    author: report.companyName || 'Handout',
    creator: 'Handout',
  })
  const line = (text, size = 10, color = ink) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(String(text || ''), usable)
    const step = size * 0.48
    for (const value of lines) {
      if (y + step > height - 18) {
        doc.addPage()
        y = margin
      }
      doc.text(value, margin, y + step)
      y += step
    }
    y += 3
  }
  line(report.title, 20, green)
  line(report.reportTitle, 15)
  line(`${report.period} | USD`, 10, muted)
  line(report.scope.join('; '), 9, muted)
  autoTable(doc, {
    startY: y + 3,
    margin: { left: margin, right: margin, top: margin, bottom: 18 },
    head: [report.metrics.map((m) => m.label)],
    body: [report.metrics.map((m) => String(m.value))],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3, textColor: ink },
    headStyles: { fillColor: [238, 243, 235], textColor: green },
  })
  y = doc.lastAutoTable.finalY + 8
  const table = (columns, rows) => {
    autoTable(doc, {
      startY: y,
      head: [columns.map((c) => c.label)],
      body: rows,
      margin: { left: margin, right: margin, top: margin, bottom: 18 },
      theme: 'striped',
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
      styles: {
        font: 'helvetica',
        fontSize: report.landscape ? 8 : 9,
        cellPadding: 2.6,
        overflow: 'linebreak',
        textColor: ink,
      },
      headStyles: { fillColor: green, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 243] },
      columnStyles: Object.fromEntries(
        columns.map((col, i) => [i, { halign: col.align || 'left' }]),
      ),
    })
    y = doc.lastAutoTable.finalY + 8
  }
  table(report.columns, report.rows)
  if (report.propertyRows?.length) {
    line('Property totals', 13)
    table(report.propertyColumns, report.propertyRows)
  }
  line('About this report', 13)
  line(report.basis, 9, muted)
  for (const note of report.notes) line(note, 9, muted)
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(`Handout | Generated ${report.generatedAt}`, margin, height - 8)
    doc.text(`${page} / ${pages}`, width - margin, height - 8, { align: 'right' })
  }
  return doc
}
