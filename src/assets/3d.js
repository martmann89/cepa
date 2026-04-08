import * as THREE from 'three'

export default function draw (canvas) {

  // ─── SCENE ───
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe5e6e3);
  scene.fog = new THREE.FogExp2(0xe5e6e3, 0.012);

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);

  camera.position.set(12, 8, 14);
  camera.lookAt(0, 2, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  canvas.appendChild(renderer.domElement);

  // ─── LIGHTS ───
  scene.add(new THREE.AmbientLight(0x334466, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffeedd, 0.9);
  dirLight.position.set(10, 15, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  scene.add(dirLight);
  const fill = new THREE.DirectionalLight(0x5eead4, 0.15);
  fill.position.set(-8, 5, -5);
  scene.add(fill);

  // ─── GRID ───
  const gridGroup = new THREE.Group();
  const mainGrid = new THREE.GridHelper(20, 20, 0x1e293b, 0x111827);
  mainGrid.material.opacity = 0.6;
  mainGrid.material.transparent = true;
  gridGroup.add(mainGrid);
  const subGrid = new THREE.GridHelper(20, 100, 0x111827, 0x0d1117);
  subGrid.material.opacity = 0.3;
  subGrid.material.transparent = true;
  subGrid.position.y = -0.001;
  gridGroup.add(subGrid);
  scene.add(gridGroup);

  // ─── AXES ───
  (function() {
    const g = new THREE.Group(), len = 12;
    const cols = { x: 0xef4444, y: 0x22c55e, z: 0x3b82f6 };
    function ax(dir, c) {
      const pts = [new THREE.Vector3(), dir.clone().multiplyScalar(len)];
      g.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: c, linewidth: 2 })
      ));
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.25, 8),
        new THREE.MeshBasicMaterial({ color: c })
      );
      cone.position.copy(dir.clone().multiplyScalar(len));
      if (dir.x === 1) cone.rotation.z = -Math.PI / 2;
      else if (dir.z === 1) cone.rotation.x = Math.PI / 2;
      g.add(cone);
      for (let i = 1; i < len; i++) {
        const p = dir.clone().multiplyScalar(i);
        const p1 = new THREE.Vector3(), p2 = new THREE.Vector3();
        if (dir.x === 1) { p1.set(0, 0.08, 0); p2.set(0, -0.08, 0); }
        else if (dir.y === 1) { p1.set(0.08, 0, 0); p2.set(-0.08, 0, 0); }
        else { p1.set(0, 0.08, 0); p2.set(0, -0.08, 0); }
        g.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([p.clone().add(p1), p.clone().add(p2)]),
          new THREE.LineBasicMaterial({ color: c, opacity: 0.5, transparent: true })
        ));
      }
    }
    ax(new THREE.Vector3(1, 0, 0), cols.x);
    ax(new THREE.Vector3(0, 1, 0), cols.y);
    ax(new THREE.Vector3(0, 0, 1), cols.z);
    scene.add(g);
  })();

  // ─── INTERACTIVE REGISTRY ───
  const interactiveObjects = [];

  const tooltipData = {
    wall: {
      title: 'Außenwand',
      icon: '#a8967a',
      rows: [
        ['Typ', 'Mauerwerk / tragend'],
        ['Breite', '8.00 m'],
        ['Höhe', '5.00 m'],
        ['Stärke', '0.30 m'],
        ['U-Wert', '0.24 W/(m²·K)']
      ],
      desc: 'Tragende Außenwand aus Kalksandstein mit Wärmedämmverbundsystem (WDVS). Entspricht den Anforderungen nach GEG 2024.'
    },
    door: {
      title: 'Haustür',
      icon: '#b85c1a',
      rows: [
        ['Typ', 'Eingangstür / einflügelig'],
        ['Breite', '1.00 m'],
        ['Höhe', '2.20 m'],
        ['Material', 'Eiche massiv'],
        ['U-Wert', '1.30 W/(m²·K)'],
        ['Schallschutz', 'Rw 38 dB']
      ],
      desc: 'DIN-konforme Hauseingangstür mit Mehrfachverriegelung, Edelstahl-Drückergarnitur und umlaufender Dichtung. Schwellenlos nach DIN 18040-2.'
    },
    doorFrame: {
      title: 'Türzarge',
      icon: '#8a8279',
      rows: [
        ['Typ', 'Stahlzarge / Umfassungszarge'],
        ['Maulweite', '300 mm'],
        ['Material', 'Stahl pulverbeschichtet']
      ],
      desc: 'Umlaufende Stahlzarge mit verdeckten Bändern. Einbau nach VOB/C DIN 18111.'
    },
    doorHandle: {
      title: 'Türgriff',
      icon: '#d4d4d8',
      rows: [
        ['Typ', 'Knauf / feststehend'],
        ['Material', 'Edelstahl V2A'],
        ['Montagehöhe', '1.05 m']
      ],
      desc: 'Außenseitiger Edelstahl-Knauf. Innenseite mit Drückergarnitur nach DIN EN 1906.'
    },
    windowL: {
      title: 'Fenster Links',
      icon: '#6bb8d4',
      rows: [
        ['Typ', 'Dreh-Kipp-Fenster'],
        ['Breite', '1.40 m'],
        ['Höhe', '1.20 m'],
        ['Brüstung', '1.80 m (OK FFB)'],
        ['Verglasung', '3-fach WSG'],
        ['Uw-Wert', '0.95 W/(m²·K)']
      ],
      desc: 'Kunststofffenster mit 3-fach-Wärmeschutzverglasung und Kreuzsprossen. Pilzkopfverriegelung RC2. Fensterbank innen Marmor, außen Aluminium.'
    },
    windowR: {
      title: 'Fenster Rechts',
      icon: '#6bb8d4',
      rows: [
        ['Typ', 'Dreh-Kipp-Fenster'],
        ['Breite', '1.40 m'],
        ['Höhe', '1.20 m'],
        ['Brüstung', '1.80 m (OK FFB)'],
        ['Verglasung', '3-fach WSG'],
        ['Uw-Wert', '0.95 W/(m²·K)']
      ],
      desc: 'Kunststofffenster mit 3-fach-Wärmeschutzverglasung und Kreuzsprossen. Pilzkopfverriegelung RC2. Fensterbank innen Marmor, außen Aluminium.'
    },
    slab: {
      title: 'Bodenplatte / Fundament',
      icon: '#4b5563',
      rows: [
        ['Typ', 'Stahlbeton C25/30'],
        ['Sichtbare Stärke', '80 mm'],
        ['Breite', '8.60 m']
      ],
      desc: 'Frostschürze als Streifenfundament mit Abdichtung nach DIN 18533 gegen Bodenfeuchte.'
    },
  };

  // ─── WALL ───
  function createWall() {
    const group = new THREE.Group();
    const wallW = 8, wallH = 5, wallD = 0.3;
    const doorW = 1.0, doorH = 2.2, doorX = 3.5;
    const winW = 1.4, winH = 1.2, winSillY = 1.8, win1X = 1.2, win2X = 5.8;

    // Wall shape with cutout holes
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(wallW, 0);
    shape.lineTo(wallW, wallH);
    shape.lineTo(0, wallH);
    shape.lineTo(0, 0);

    function hole(cx, cy, w, h) {
      const p = new THREE.Path();
      p.moveTo(cx - w / 2, cy);
      p.lineTo(cx + w / 2, cy);
      p.lineTo(cx + w / 2, cy + h);
      p.lineTo(cx - w / 2, cy + h);
      p.lineTo(cx - w / 2, cy);
      shape.holes.push(p);
    }
    hole(doorX, 0, doorW, doorH);
    hole(win1X, winSillY, winW, winH);
    hole(win2X, winSillY, winW, winH);

    // Extruded wall mesh
    const wallGeo = new THREE.ExtrudeGeometry(shape, { depth: wallD, bevelEnabled: false });
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xd4c5a9, roughness: 0.85, metalness: 0.02, side: THREE.DoubleSide
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallMesh.userData = { tooltipKey: 'wall' };
    interactiveObjects.push(wallMesh);
    group.add(wallMesh);

    // Wireframe overlay
    group.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(wallGeo, 1),
      new THREE.LineBasicMaterial({ color: 0x5eead4, opacity: 0.4, transparent: true })
    ));

    // Windows (glass + cross bars)
    const glassMat = () => new THREE.MeshStandardMaterial({
      color: 0x88ccee, transparent: true, opacity: 0.15,
      roughness: 0.05, metalness: 0.3, side: THREE.DoubleSide
    });
    const barMat = () => new THREE.MeshStandardMaterial({
      color: 0x94a3b8, roughness: 0.5, metalness: 0.3
    });
    const winKeys = ['windowL', 'windowR'];

    [[win1X, winSillY], [win2X, winSillY]].forEach(([cx, sy], idx) => {
      const key = winKeys[idx];

      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(winW - 0.05, winH - 0.05), glassMat()
      );
      glass.position.set(cx, sy + winH / 2, wallD / 2);
      glass.userData = { tooltipKey: key, isGlass: true };
      interactiveObjects.push(glass);
      group.add(glass);

      const hBar = new THREE.Mesh(
        new THREE.BoxGeometry(winW - 0.05, 0.03, 0.04), barMat()
      );
      hBar.position.set(cx, sy + winH / 2, wallD / 2);
      hBar.userData = { tooltipKey: key };
      interactiveObjects.push(hBar);
      group.add(hBar);

      const vBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, winH - 0.05, 0.04), barMat()
      );
      vBar.position.set(cx, sy + winH / 2, wallD / 2);
      vBar.userData = { tooltipKey: key };
      interactiveObjects.push(vBar);
      group.add(vBar);
    });

    // Door frame (left, right, top)
    const fMat = () => new THREE.MeshStandardMaterial({
      color: 0x78716c, roughness: 0.6, metalness: 0.1
    });
    const fw = 0.06;

    [[doorX - doorW / 2, doorH / 2], [doorX + doorW / 2, doorH / 2]].forEach(([x, y]) => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(fw, doorH, wallD + 0.02), fMat());
      f.position.set(x, y, wallD / 2);
      f.userData = { tooltipKey: 'doorFrame' };
      interactiveObjects.push(f);
      group.add(f);
    });

    const topF = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + fw, fw, wallD + 0.02), fMat()
    );
    topF.position.set(doorX, doorH, wallD / 2);
    topF.userData = { tooltipKey: 'doorFrame' };
    interactiveObjects.push(topF);
    group.add(topF);

    // Door panel
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x92400e, roughness: 0.7, metalness: 0.05
    });
    const doorPanel = new THREE.Mesh(
      new THREE.BoxGeometry(doorW - 0.08, doorH - 0.04, 0.05), doorMat
    );
    doorPanel.position.set(doorX, doorH / 2, wallD * 0.3);
    doorPanel.userData = { tooltipKey: 'door' };
    interactiveObjects.push(doorPanel);
    group.add(doorPanel);

    // Door handle
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8, roughness: 0.2, metalness: 0.8
    });
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), handleMat);
    handle.position.set(doorX + 0.32, 1.05, wallD * 0.3 + 0.04);
    handle.userData = { tooltipKey: 'doorHandle' };
    interactiveObjects.push(handle);
    group.add(handle);

    // Ground slab
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.95 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(wallW + 0.6, 0.08, 1.2), slabMat);
    slab.position.set(wallW / 2, -0.04, 0.45);
    slab.receiveShadow = true;
    slab.userData = { tooltipKey: 'slab' };
    interactiveObjects.push(slab);
    group.add(slab);

    return group;
  }
  scene.add(createWall());

  // Ground shadow plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);

  // ─── ORBIT CONTROLS ───
  let isDragging = false, isPanning = false;
  let prevMouse = { x: 0, y: 0 };
  let spherical = { theta: 0.85, phi: 1.05, radius: 18 };
  let target = new THREE.Vector3(4, 2, 0);

  function updateCamera() {
    const r = spherical.radius, t = spherical.theta;
    const p = spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    camera.position.set(
      target.x + r * Math.sin(p) * Math.cos(t),
      target.y + r * Math.cos(p),
      target.z + r * Math.sin(p) * Math.sin(t)
    );
    camera.lookAt(target);
  }
  updateCamera();

  renderer.domElement.addEventListener('mousedown', e => {
    if (e.button === 0) isDragging = true;
    if (e.button === 2) isPanning = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('mouseup', () => { isDragging = false; isPanning = false; });

  renderer.domElement.addEventListener('wheel', e => {
    spherical.radius *= 1 + e.deltaY * 0.001;
    spherical.radius = Math.max(3, Math.min(50, spherical.radius));
    updateCamera();
  });

  // Touch support
  let touchDist = 0;
  renderer.domElement.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist = Math.sqrt(dx * dx + dy * dy);
    }
  });
  renderer.domElement.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      spherical.theta -= dx * 0.005;
      spherical.phi += dy * 0.005;
      updateCamera();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.sqrt(dx * dx + dy * dy);
      spherical.radius *= touchDist / d;
      spherical.radius = Math.max(3, Math.min(50, spherical.radius));
      touchDist = d;
      updateCamera();
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchend', () => { isDragging = false; });

  // ─── RAYCASTING & TOOLTIP ───
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltipEl = document.getElementById('tooltip');
  const ttIcon = tooltipEl.querySelector('.icon');
  const ttTitle = tooltipEl.querySelector('.title-text');
  const ttRows = tooltipEl.querySelector('.tooltip-rows');
  const ttDesc = tooltipEl.querySelector('.tooltip-desc');

  let currentKey = null;

  // Highlight all meshes that share the same tooltipKey
  function highlightGroup(key, on) {
    interactiveObjects.forEach(o => {
      if (o.userData.tooltipKey !== key) return;
      const m = o.material;
      if (m.emissive) m.emissive.setHex(on ? 0x1a3a3a : 0x000000);
      if (o.userData.isGlass) m.opacity = on ? 0.35 : 0.15;
    });
  }

  // Populate and position the tooltip
  function showTooltip(key, mx, my) {
    const d = tooltipData[key];
    if (!d) return;
    ttIcon.style.background = d.icon;
    ttTitle.textContent = d.title;
    ttRows.innerHTML = d.rows.map(([l, v]) =>
      `<div class="tooltip-row">
        <span class="t-label">${l}</span>
        <span class="t-value">${v}</span>
      </div>`
    ).join('');
    ttDesc.textContent = d.desc;

    const pad = 20;
    let tx = mx + pad, ty = my + pad;
    tooltipEl.style.left = tx + 'px';
    tooltipEl.style.top = ty + 'px';
    tooltipEl.classList.add('visible');

    // Reposition if overflowing viewport
    requestAnimationFrame(() => {
      const r = tooltipEl.getBoundingClientRect();
      if (r.right > window.innerWidth - 10) tx = mx - r.width - pad;
      if (r.bottom > window.innerHeight - 10) ty = my - r.height - pad;
      tooltipEl.style.left = tx + 'px';
      tooltipEl.style.top = ty + 'px';
    });
  }

  function hideTooltip() {
    tooltipEl.classList.remove('visible');
  }

  // Combined mousemove: orbit controls + raycasting
  renderer.domElement.addEventListener('mousemove', e => {
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    prevMouse = { x: e.clientX, y: e.clientY };

    // Orbit / pan
    if (isDragging) {
      spherical.theta -= dx * 0.005;
      spherical.phi += dy * 0.005;
      updateCamera();
    }
    if (isPanning) {
      const right = new THREE.Vector3(), up = new THREE.Vector3();
      camera.getWorldDirection(up);
      right.crossVectors(camera.up, up).normalize();
      up.copy(camera.up).normalize();
      const s = spherical.radius * 0.001;
      target.add(right.multiplyScalar(-dx * s));
      target.add(up.multiplyScalar(dy * s));
      updateCamera();
    }

    // Skip raycasting while dragging/panning
    if (isDragging || isPanning) {
      if (currentKey) { highlightGroup(currentKey, false); currentKey = null; }
      hideTooltip();
      renderer.domElement.style.cursor = 'grabbing';
      return;
    }

    // Raycast against interactive objects

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(interactiveObjects, false);
    if (hits.length > 0) {
      const key = hits[0].object.userData.tooltipKey;
      if (key && key !== currentKey) {
        if (currentKey) highlightGroup(currentKey, false);
        currentKey = key;
        highlightGroup(key, true);
      }
      if (key) showTooltip(key, e.clientX, e.clientY);
      renderer.domElement.style.cursor = 'pointer';
    } else {
      if (currentKey) { highlightGroup(currentKey, false); currentKey = null; }
      hideTooltip();
      renderer.domElement.style.cursor = 'default';
    }
  });

  renderer.domElement.addEventListener('mouseleave', () => {
    if (currentKey) { highlightGroup(currentKey, false); currentKey = null; }
    hideTooltip();
  });

  // ─── AXIS INDICATOR (mini axes, top-right) ───
  const axC = document.getElementById('axis-indicator');
  const axR = new THREE.WebGLRenderer({ canvas: axC, antialias: true, alpha: true });
  axR.setSize(90, 90);
  axR.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const axS = new THREE.Scene();
  const axCam = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
  axCam.position.set(2, 1.5, 2);
  axCam.lookAt(0, 0, 0);

  [[1, 0, 0, 0xef4444], [0, 1, 0, 0x22c55e], [0, 0, 1, 0x3b82f6]].forEach(([x, y, z, c]) => {
    const d = new THREE.Vector3(x, y, z);
    axS.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), d.clone()]),
      new THREE.LineBasicMaterial({ color: c })
    ));
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.15, 6),
      new THREE.MeshBasicMaterial({ color: c })
    );
    cone.position.copy(d);
    if (x === 1) cone.rotation.z = -Math.PI / 2;
    else if (z === 1) cone.rotation.x = Math.PI / 2;
    axS.add(cone);
  });

  // ─── ANIMATE ───
  let animationId;
  function animate() {
    animationId = requestAnimationFrame(animate);
    const d = new THREE.Vector3();
    camera.getWorldDirection(d);
    axCam.position.copy(d.multiplyScalar(-3));
    axCam.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    axR.render(axS, axCam);
  }
  animate();

  // ─── RESIZE ───
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, animationId: () => animationId }

};