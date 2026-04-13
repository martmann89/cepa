

export function getGridCoords(rectW, rectH) {
  const spacing_hor = 200;  
  const spacing_ver = 200;
  const distEdge_x = 50;
  const distEdge_y = 50;
  
  const n_hor = Math.floor ( (rectH - 2*distEdge_x) / spacing_hor) + 1;
  const n_ver = Math.floor ( (rectW - 2*distEdge_y)  / spacing_ver) + 1;
  
  console.log(n_hor, n_ver)
  return createGrid2D(n_hor, n_ver, spacing_hor, spacing_ver, distEdge_x,distEdge_y);
}

export function createGrid2D(rows, cols, spacing_hor, spacing_ver, distEdge_x, distEdge_y) {
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({ x: (distEdge_x + (col * spacing_ver)), y: (distEdge_y + (row * spacing_hor)) }))
    );
}