const projectData = [
  {
    title: "Clouds",
    image: "./images/clouds.jpg",
    category: "Nature",
    year: "2024",
  },
  {
    title: "Unity",
    image: "./images/field.jpg",
    category: "Nature",
    year: "2025",
  },
  {
    title: "Mirror",
    image: "./images/mirror.jpg",
    category: "Nature",
    year: "2025",
  },
  {
    title: "Road",
    image: "./images/road.jpg",
    category: "Nature",
    year: "2026",
  },
  {
    title: "Sunflower",
    image: "./images/sunflower.jpg",
    category: "Nature",
    year: "2026",
  },
];

const CONFIG = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.05,
  BUFFER_SIZE: 5,
  MAX_VELOCITY: 150,
  SNAP_DURATION: 500,
};

const state = {
  curY: 0,
  targetY: 0,
  isDragging: false,
  projects: new Map(),
  minimap: new Map(),
  minimapInfo: new Map(),
  projectHeight: window.innerHeight,
  minimapHeigh: 250,
  isSnapping: false,
  snapStart: { time: 0, y: 0, target: 0 },
  lastScrollTime: Date.now(),
};

const lerp = (start, end, factor) => start + (end - start) * factor;

const createParallax = (img, height) => {
  let current = 0;
  return {
    update: (scroll, index) => {
      const target = (-scroll - index * height) * 0.2;
      current = lerp(current, target, 0.2);
      if (Math.abs(current - target) > 0.01) {
        img.style.transform = `translateY(${current}px) scale(1.5)`;
      }
    },
  };
};

const getProjectData = (index) => {
  const i =
    ((Math.abs(index) % projectData.length) + projectData.length) %
    projectData.length;
  return projectData[i];
};

const createElement = (index, type) => {
  const maps = {
    main: state.projects,
    minimap: state.minimap,
    info: state.minimapInfo,
  };
  if (maps[type].has(index)) return;

  const data = getProjectData(index);
  const num = (
    (((Math.abs(index) % projectData.length) + projectData.length) %
      projectData.length) +
    1
  )
    .toString()
    .padStart(2, "0");

  if (type === "main") {
    const el = document.createElement("div");
    el.className = "project-list__project";
    el.innerHTML = `<img src="${data.image}" alt="${data.title}" />`;
    document.querySelector(".project-list").appendChild(el);
    state.projects.set(index, {
      el,
      parallax: createParallax(el.querySelector("img"), state.projectHeight),
    });
  } else if (type === "minimap") {
    const el = document.createElement("div");
    el.className = "img-preview__item";
    el.innerHTML = `<img src="${data.image}" alt="${data.title}" />`;
    document.querySelector(".minimap__wrapper-img-preview").appendChild(el);
    state.projects.set(index, {
      el,
      parallax: createParallax(el.querySelector("img"), state.projectHeight),
    });
  } else {
    const el = document.createElement("div");
    el.className = "info-list__item";
    el.innerHTML = `
        <div class="info-list__item-row">
            <p>${num}</p>
            <p>${data.title}</p>
        </div>
        <div class="info-list__item-row">
            <p>${data.category}</p>
            <p>${data.year}</p>
        </div>
    `;
    document.querySelector(".minimap__wrapper-info-list").appendChild(el);
    state.minimapInfo.set(index, { el });
  }
};

const syncElements = () => {
  const current = Math.round(-state.targetY / state.projectHeight);
  const min = current - CONFIG.BUFFER_SIZE;
  const max = current + CONFIG.BUFFER_SIZE;

  for (let i = min; i <= max; i++) {
    createElement(i, "main");
    createElement(i, "minimap");
    createElement(i, "info");
  }

  [state.projects, state.minimap, state.minimapInfo].forEach((map) => {
    map.forEach((item, index) => {
      if (index < min || index > max) {
        item.el.remove();
        map.delete(index);
      }
    });
  });
};

const snapToProject = () => {
  state.isSnapping = true;
  state.snapStart.time = Date.now();
  state.snapStart.y = state.targetY;
  state.snapStart.target =
    -Math.round(-state.targetY / state.projectHeight) * state.projectHeight;
};

const updateSnap = () => {
  const progress = Math.min(
    (Date.now() - state.snapStart.time) / CONFIG.SNAP_DURATION,
    1,
  );
  const eased = 1 - Math.pow(1 - progress, 3);
  state.targetY =
    state.snapStart.y + (state.snapStart.target - state.snapStart.y) * eased;
  if (progress >= 1) state.isDragging = true;
};

const updatePositions = () => {
  const minimapY = (state.curY * state.minimapHeigh) / state.projectHeight;

  state.projects.forEach((item, index) => {
    const y = index * state.projectHeight + state.curY;
    item.el.style.transform = `translateY(${y}px)`;
    item.parallax.update(state.curY, index);
  });

  state.minimap.forEach((item, index) => {
    const y = index * state.projectHeight + minimapY;
    item.el.style.transform = `translateY(${y}px)`;
    item.parallax.update(minimapY, index);
  });

  state.minimapInfo.forEach((item, index) => {
    item.el.style.transform = `translateY(${index * state.minimapHeigh + minimapY}px)`;
  });
};

const animate = () => {
  const now = Date.now();

  if (
    !state.isDragging &&
    !state.isSnapping &&
    now - state.lastScrollTime > 100
  ) {
    const snapPoint =
      -Math.round(-state.targetY / state.projectHeight) * state.projectHeight;
    if (Math.abs(state.targetY - snapPoint) > 1) snapToProject();
  }

  if (state.isSnapping) updateSnap();
  if (!state.isDragging)
    state.curY += (state.targetY - state.curY) * CONFIG.LERP_FACTOR;

  syncElements();
  updatePositions();
  requestAnimationFrame(animate);
};

animate();

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    state.isSnapping = false;
    state.lastScrollTime = Date.now();
    const delta = Math.max(
      Math.min(e.deltaY * CONFIG.SCROLL_SPEED, CONFIG.MAX_VELOCITY),
      -CONFIG.MAX_VELOCITY,
    );
    state.targetY -= delta;
  },
  { passive: false },
);
