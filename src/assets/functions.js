

export function getGridCoords(rectW, rectH, spacing_hor, spacing_ver, offset_x, offset_y) {
  
  const n_hor = Math.floor ( (rectH - 2*offset_x) / spacing_hor) + 1;
  const n_ver = Math.floor ( (rectW - 2*offset_y)  / spacing_ver) + 1;
  
  console.log(n_hor, n_ver)
  return createGrid2D(n_hor, n_ver, spacing_hor, spacing_ver, offset_x, offset_y);
}

export function createGrid2D(rows, cols, spacing_hor, spacing_ver, distEdge_x, distEdge_y) {
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({ x: (distEdge_x + (col * spacing_ver)), y: (distEdge_y + (row * spacing_hor)) }))
    );
}

export function refineGrid(grid) {
  const refined = []

  for (let row = 0; row < grid.length - 1; row++) {
    const currRow = grid[row]
    const nextRow = grid[row + 1]

    const refinedRowTop = []
    const refinedRowMid = []

    for (let col = 0; col < currRow.length - 1; col++) {
      const tl = currRow[col]           // top-left
      const tr = currRow[col + 1]       // top-right
      const bl = nextRow[col]           // bottom-left
      const br = nextRow[col + 1]       // bottom-right

      // Obere Zeile: original + Zwischenpunkt
      refinedRowTop.push(tl)
      refinedRowTop.push({ x: (tl.x + tr.x) / 2, y: tl.y })

      // Mittlere Zeile: vertikal interpoliert
      refinedRowMid.push({ x: tl.x, y: (tl.y + bl.y) / 2 })
      refinedRowMid.push({ x: (tl.x + tr.x) / 2, y: (tl.y + bl.y) / 2 })
    }

    // Letzten Punkt der Zeile noch anhängen
    refinedRowTop.push(currRow[currRow.length - 1])
    refinedRowMid.push({
      x: currRow[currRow.length - 1].x,
      y: (currRow[currRow.length - 1].y + nextRow[nextRow.length - 1].y) / 2
    })

    refined.push(refinedRowTop)
    refined.push(refinedRowMid)
  }

  // Letzte Originalzeile noch anhängen
  const lastRow = grid[grid.length - 1]
  const refinedLastRow = []
  for (let col = 0; col < lastRow.length - 1; col++) {
    refinedLastRow.push(lastRow[col])
    refinedLastRow.push({ x: (lastRow[col].x + lastRow[col + 1].x) / 2, y: lastRow[col].y })
  }
  refinedLastRow.push(lastRow[lastRow.length - 1])
  refined.push(refinedLastRow)

  return refined
}

