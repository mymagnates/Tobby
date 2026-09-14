export function reportDocumentTitle(companyName, propertyNames, allAccount = false) {
  const company = String(companyName || '').trim()
  const names = [...new Set(propertyNames.map((name) => String(name || '').trim()).filter(Boolean))]
  const scope =
    names.length === 1
      ? names[0]
      : allAccount
        ? 'All account properties'
        : `Property portfolio (${names.length})`
  return [company, scope].filter(Boolean).join(' | ')
}

export function reportFilename(type, from, to) {
  return `${String(type).replace(/[^a-z0-9_-]/gi, '_')}_${String(from).replace(/[^0-9-]/g, '')}_${String(to).replace(/[^0-9-]/g, '')}.pdf`
}

// Built-in PDF fonts cannot represent arbitrary Unicode. Never silently corrupt financial text.
export function needsUnicodePrint(document) {
  return [...JSON.stringify(document)].some((char) => char.codePointAt(0) > 255)
}

const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  )
export function reportPrintHtml(document) {
  const table = (columns, rows) =>
    `<table><thead><tr>${columns.map((c) => `<th>${escape(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, i) => `<td class="${columns[i]?.align === 'right' ? 'amount' : ''}">${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(document.title)}</title><style>
  @page{size:A4 ${document.landscape ? 'landscape' : 'portrait'};margin:16mm}body{font:10pt 'Avenir Next',sans-serif;color:#243830}h1{font-size:21pt;margin:0 0 8pt;overflow-wrap:anywhere}h2{font-size:15pt}p{line-height:1.5;overflow-wrap:anywhere}.muted{color:#65756c}.metrics{display:flex;gap:24pt;margin:18pt 0}.metrics div{flex:1}.metrics strong{display:block;font-size:16pt;margin-top:6pt}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:9pt;margin:16pt 0}th{text-align:left;background:#eef3eb;color:#254b39}th,td{padding:7pt;border-bottom:1px solid #e0e6df;overflow-wrap:anywhere;white-space:pre-wrap}thead{display:table-header-group}tr{break-inside:avoid}.amount{text-align:right}li{margin:6pt 0;overflow-wrap:anywhere}footer{margin-top:20pt;font-size:8pt;color:#65756c}</style></head><body>
  <h1>${escape(document.title)}</h1><h2>${escape(document.reportTitle)}</h2><p class="muted">${escape(document.period)} | USD</p><p>${escape(document.scope.join('; '))}</p>
  <div class="metrics">${document.metrics.map((m) => `<div>${escape(m.label)}<strong>${escape(m.value)}</strong></div>`).join('')}</div>
  ${table(document.columns, document.rows)}
  ${document.propertyRows?.length ? `<h2>Property totals</h2>${table(document.propertyColumns, document.propertyRows)}` : ''}
  <h2>About this report</h2><p>${escape(document.basis)}</p><ul>${document.notes.map((n) => `<li>${escape(n)}</li>`).join('')}</ul><footer>Handout | Generated ${escape(document.generatedAt)}</footer></body></html>`
}

export function printReportDocument(document) {
  const frame = window.document.createElement('iframe')
  frame.title = 'Printable report'
  frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0'
  frame.setAttribute('sandbox', 'allow-same-origin allow-modals')
  frame.onload = async () => {
    await frame.contentDocument?.fonts?.ready
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
  }
  frame.srcdoc = reportPrintHtml(document)
  window.document.body.appendChild(frame)
  const remove = () => frame.remove()
  frame.contentWindow?.addEventListener('afterprint', remove, { once: true })
  // Some mobile browsers do not dispatch afterprint; retain the frame while the dialog is open.
  setTimeout(remove, 300000)
}
