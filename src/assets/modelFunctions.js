import makerjs from 'makerjs';
import { getGridCoords, refineGrid } from './functions';
import { mx_bilerp_0 } from 'three/src/nodes/materialx/lib/mx_noise.js';

export function buildModel({ rectW, rectH, cutW, cutH, cutX, cutY, nof_refinements, spacing_hor, spacing_ver, offset_x, offset_y }) {
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
  
  const grid = getGridCoords(rectW, rectH, spacing_hor, spacing_ver, offset_x, offset_y);
  
  const pipesMiddle = meander(grid);
  pipesMiddle.layer = "pipesMiddle";
  console.log(getTotalLength(pipesMiddle))
  const dxfModel = {models: {rect: combined, pipesMiddle: pipesMiddle}, units: makerjs.unitType.Millimeter};
  const svgModel = buildSvgModel(rectW, rectH, grid, nof_refinements, dxfModel);
  const pipesOuter = createPipes(dxfModel);
  dxfModel.models["pipesOutline"] = pipesOuter;
  svgModel.models["pipesOutline"] = pipesOuter;
  return {dxfModel, svgModel}
    

}

export function buildSvgModel (rectW, rectH, grid, nof_refinements, dxfModel) {
  const svgModel = structuredClone(dxfModel);
  
  const gridlines = constructGrid(grid, rectH, rectW, nof_refinements);
  svgModel.models["grid"] = gridlines;

  return svgModel;
  
}

export function constructGrid (grid, rectH, rectW, nof_refinements) {
    const verticals = []
    const horizontals = []
    console.log(grid)
    for (let i = 0; i < nof_refinements; i++){
        grid = (refineGrid(grid));
    }
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
    
    let segIndex = 0;

    //start top right
    let start_hor = points[0].length
    let start_ver = points.length
    const radius = (points[start_ver-1][0].y - points[start_ver-2][0].y)/2;
    
  for (let i = start_ver-1; i >= 0; i--) {
        dir++
        let p0;
        let p1;
        let p2;
        let centerX;
        let centerY;

    if (dir % 2 == 0){
        p0 = structuredClone(points[i][start_hor-1]);
        p1 = structuredClone(points[i][0]);
        p0.x = p0.x - radius;
        p1.x = p1.x + radius;
        if (i > 0){
            p2 = points[i-1][start_hor-1]
            centerX = p0.x;
            centerY = (p0.y + p2.y) / 2;
        }
        
    } else {
        p0 = structuredClone(points[i][start_hor-1]);
        p1 = structuredClone(points[i][0]);
        p0.x = p0.x - radius;
        p1.x = p1.x + radius;
        if (i > 0){
            p2 = points[i-1][1];
            centerX = p1.x;
            centerY = (p1.y + p2.y) / 2;
        }
    }
        
        //const dir = i % 2 === 0 ? direction : -direction;
    // Waagrechte Linie von p0 nach p1
    paths[`line_${segIndex++}`] = new makerjs.paths.Line(
      [p0.x, p0.y],
      [p1.x, p1.y]
    );

      // Mittelpunkt des Bogens liegt zwischen p1 und dem nächsten Punkt auf p2-Höhe
      // Der Bogen verbindet p1 (y = p1.y) mit p2 (y = p2.y) — beide x-Koordinaten gleich p1.x
       // Winkel: von p1 (oben oder unten) zum gegenüberliegenden Punkt
      // dir=1: Bogen geht nach rechts (0° bis 180° oder umgekehrt)
    if (i > 0){
        const startAngle = dir % 2 === 0 ? 270 : 90;  // von p1 aus
        const endAngle   = dir % 2 === 0 ? 90  : 270; // zu p2 hin

      paths[`arc_${segIndex++}`] = new makerjs.paths.Arc(
        [centerX, centerY], // Mittelpunkt
        radius,             // Radius = halber Abstand
        startAngle,
        endAngle
      );
    }
  }

  
  
  return { paths };
  
}

export function createPipes (model, außenD=16){
    
    const chains = makerjs.model.findChains(model, {
        byLayers: true
    });
    

    const konturModel = { models: {} };

    chains.pipesMiddle.forEach((chain, i) => {
  // Chain zurück in ein Model umwandeln
  const chainModel = makerjs.chain.toNewModel(chain);
  
  // Außenkontur mit Arc-Joints
  const kontur = makerjs.model.outline(chainModel, außenD / 2, 0, false);
  
  konturModel.models[`rohr_${i}`] = kontur;
});
return konturModel;
}

export function getTotalLength(model) {

  let totalLength = 0;

  makerjs.model.walk(model, {
    
    onPath: function(walkedPath) {
        if (walkedPath.modelContext.layer === "pipesMiddle"){
            totalLength += makerjs.measure.pathLength(walkedPath.pathContext);
        }
      
    }
  });

  return totalLength;
}