function tableToMatrix(table) {
  const rowEls = table.rows;
  const matrix = [];
  for (let i = 0, n = rowEls.length; i < n; i++) {
    const rowEl = rowEls[i];
    const cellEls = rowEl.querySelectorAll('td, th');
    let y = 0;
    for (let j = 0, m = cellEls.length; j < m; j++) {
      const cellEl = cellEls[j];
      const rowSpan = parseInt(cellEl.getAttribute('rowspan') || 1);
      const cellSpan = parseInt(cellEl.getAttribute('colspan') || 1);
      const val = cellEl.textContent.trim();
      let rowSpanIterator = rowSpan;
      while (rowSpanIterator--) {
        let cellSpanIterator = cellSpan;
        while (cellSpanIterator--) {
          const x = i + rowSpanIterator;
          matrix[x] = matrix[x] || [];
          matrix[x][y + cellSpanIterator] = val;
        }
      }
      y += cellSpan;
    }
  }
  return matrix;
}

module.exports = tableToMatrix;
