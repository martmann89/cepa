import makerjs from 'makerjs';
import { getGridCoords } from './functions';

export function buildModel({ rectW, rectH, cutW, cutH, cutX, cutY }) {
  //const makerjs =makerjs;

  // Außenrechteck
  const outer = new makerjs.models.Rectangle(rectW, rectH, );
  outer.layer = "Wand"
  
  // Ausschnitt – maker.js Koordinaten: Ursprung links unten
  const cutout = new makerjs.models.Rectangle(cutW, cutH);
  cutout.layer = "Ausschnitt"
  makerjs.model.move(cutout, [cutX, cutY]);
  

  // Kombinieren via Subtraction (Boolean)
  //const combined = makerjs.model.combine(outer, cutout, false, true, true, false);
  const combined = makerjs.model.combineSubtraction(outer, cutout)
  combined.layer = "kombiniert"
  
  const grid = getGridCoords(rectW, rectH);
  const pipes = meander(grid)

  const dxfModel = {models: {rect: combined, pipes: pipes}, units: makerjs.unitType.Millimeter};
  const svgModel = buildSvgModel(rectW, rectH, grid, dxfModel);
 
  return {dxfModel, svgModel}
    

}

export function buildSvgModel (rectW, rectH, grid, dxfModel) {
  const svgModel = structuredClone(dxfModel);
  
  const gridlines = constructGrid(grid, rectH, rectW);
  svgModel.models["grid"] = gridlines;

  return svgModel;
  
}

export function constructGrid (grid, rectH, rectW) {
    const verticals = []
    const horizontals = []
    console.log(grid);
    grid[0].forEach( (row) => {
        horizontals.push(row.x)
    })
    grid.forEach( (col) => {
        verticals.push(col[0].y)
    })

    const pathObject = {};
    horizontals.forEach( (point,i) =>{
        pathObject[`v${i}`] = new makerjs.paths.Line([point , 0], [point, rectH]);
    })
    verticals.forEach( (point,i) =>{
        pathObject[`h${i}`] = new makerjs.paths.Line([0 , point], [rectW, point]);
    })
    const gridlines = {paths: pathObject};
    gridlines.layer = 'Gridlines'
    return gridlines;
}

export function meander (points, dir=0){
    const paths = {};
    const radius = 100;
    let segIndex = 0;

    //start top right
    let start_hor = points[0].length
    let start_ver = points.length
    
  for (let i = start_ver-1; i >= 1; i--) {
        dir++
        let p0;
        let p1;
        let p2;
        let centerX;
        let centerY;

    if (dir % 2 == 0){
        p0 = points[i][start_hor-1];
        p1 = points[i][0];
        p0.x = p0.x - radius;
        p1.x = p1.x + radius;
        p2 = points[i-1][start_hor-1]
        centerX = p0.x;
        centerY = (p0.y + p2.y) / 2;
    } else {
        p0 = points[i][start_hor-1];
        p1 = points[i][0];
        p0.x = p0.x - radius;
        p1.x = p1.x + radius;
        p2 = points[i-1][1];
        centerX = p1.x;
        centerY = (p1.y + p2.y) / 2;
    }
        
        //const dir = i % 2 === 0 ? direction : -direction;
    // Waagrechte Linie von p0 nach p1
    paths[`line_${segIndex++}`] = new makerjs.paths.Line(
      [p0.x, p0.y],
      [p1.x, p1.y]
    );

    

    // Halbkreis-Bogen am Ende (verbindet p1 mit dem nächsten Hinweg)
    // Nur wenn es noch einen nächsten Punkt gibt


      // Mittelpunkt des Bogens liegt zwischen p1 und dem nächsten Punkt auf p2-Höhe
      // Der Bogen verbindet p1 (y = p1.y) mit p2 (y = p2.y) — beide x-Koordinaten gleich p1.x
       // Winkel: von p1 (oben oder unten) zum gegenüberliegenden Punkt
      // dir=1: Bogen geht nach rechts (0° bis 180° oder umgekehrt)
      const startAngle = dir % 2 === 0 ? 270 : 90;  // von p1 aus
      const endAngle   = dir % 2 === 0 ? 90  : 270; // zu p2 hin

      paths[`arc_${segIndex++}`] = new makerjs.paths.Arc(
        [centerX, centerY], // Mittelpunkt
        radius,             // Radius = halber Abstand
        startAngle,
        endAngle
      );
    
  }
  
  return { paths };
}