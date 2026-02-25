const TOTAL_SLIDES = 20;
const END_SCALE = 5;
const SLIDES_TITLE = [
  "Конец?",
  "Полднень",
  "Лес зовёт",
  "Все будет хорошо",
  "Money money money",
  "Пальма",
  "Ромашки",
  "Матеша не прощает",
  "Искусство",
  "Чувак...",
  "Конец?",
  "Полднень",
  "Лес зовёт",
  "Все будет хорошо",
  "Money money money",
  "Пальма",
  "Ромашки",
  "Матеша не прощает",
  "Искусство",
  "Чувак...",
];

const slider = document.querySelector(".slider");
const sliderTitle = document.querySelector(".slider__title");
const thumbnailWheel = document.querySelector(".thumbnail-wheel");

let slideWidth = window.innerWidth * 0.45;
let viewportCenter = window.innerWidth / 2;
let isMobile = window.innerWidth < 1000;

let curX = 0;
let targetX = 0;
let isScrolling = false;
//В теории можно на lenis переделать
let scrollTimeout;
let activeSlideIndex = 0;

function createSlides() {
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const slide = document.createElement("div");
    slide.classList.add("slide");

    const img = document.createElement("img");
    const imageNumber = (i % TOTAL_SLIDES) + 1;
    img.src = `./images/pic-${imageNumber}.jpg`;

    slider.appendChild(slide);
    slide.appendChild(img);
    console.log(slide.offsetWidth);
  }
  console.log(slider.offsetWidth);
}

function initializeSlider() {
  const slides = document.querySelectorAll(".slide");
  slides.forEach((slide, index) => {
    const x = index * slideWidth - slideWidth;
    gsap.set(slide, { x: x });
  });

  const centerOffset = window.innerWidth / 2 - slideWidth / 2;
  curX = centerOffset;
  targetX = centerOffset;
}

createSlides();
initializeSlider();

function handleScroll(e) {
  const scrollIntensity = e.deltaY || e.detail || e.wheelDelta * -1;
  targetX -= scrollIntensity * 1;

  isScrolling = true;
  clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 150);
}

window.addEventListener("wheel", handleScroll, { passive: false });
window.addEventListener("DOMMouseScroll", handleScroll, { passive: false });

window.addEventListener(
  "scroll",
  function (e) {
    if (e.target === document || e.target === document.body) {
      window.scrollTo(0, 0);
    }
  },
  { passive: false },
);

animate();

function createThumbnail() {
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const angle = (i / TOTAL_SLIDES) * Math.PI * 2;
    const radius = isMobile ? 150 : 300;
    const x = radius * Math.cos(angle) + window.innerWidth / 2;
    const y = radius * Math.sin(angle) + window.innerHeight / 2 - 25;

    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail-wheel__item");
    thumbnail.dataset.index = i;
    thumbnail.dataset.angle = angle;
    thumbnail.dataset.radius = radius;

    const img = document.createElement("img");
    const imageNumber = (i % TOTAL_SLIDES) + 1;
    img.src = `./images/pic-${imageNumber}.jpg`;
    thumbnail.appendChild(img);

    gsap.set(thumbnail, {
      x,
      y,
      transformOrigin: "center center",
    });

    thumbnailWheel.appendChild(thumbnail);
  }
}

createThumbnail();

function updateThumbnail() {
  const exactSlideProgress = Math.abs(curX) / slideWidth;
  const curRotationAngle = -(exactSlideProgress * (360 / TOTAL_SLIDES)) + 90;

  const thumbnails = document.querySelectorAll(".thumbnail-wheel__item");

  thumbnails.forEach((thumbnail) => {
    const baseAngle = parseFloat(thumbnail.dataset.angle);
    const radius = isMobile ? 150 : 300;
    const curAngle = baseAngle + (curRotationAngle * Math.PI) / 180;

    const x = radius * Math.cos(curAngle) + window.innerWidth / 2;
    const y = radius * Math.sin(curAngle) + window.innerHeight / 2 - 25;

    gsap.set(thumbnail, {
      x: x,
      y: y,
      rotation: 0,
      transformOrigin: "center center",
    });
  });
}

function animate() {
  curX += (targetX - curX) * 0.1;

  const totalWidth = TOTAL_SLIDES * slideWidth - slideWidth * 2.2;

  if (curX > 0) {
    curX -= totalWidth;
    targetX -= totalWidth;
  } else if (curX < -totalWidth) {
    curX += totalWidth;
    targetX += totalWidth;
  }

  let centerSlideIndex = 0;
  let closestToCenter = Infinity;
  const slides = document.querySelectorAll(".slide");
  slides.forEach((slide, index) => {
    const x = index * slideWidth + curX;
    gsap.set(slide, { x: x });

    const slideCenterX = x + slideWidth / 2;
    const distanceFromCenter = Math.abs(slideCenterX - viewportCenter);

    const outerDistance = slideWidth * 3;
    const progress = Math.min(distanceFromCenter / outerDistance, 1);

    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const scale = 1 + easedProgress * (END_SCALE - 1);

    const img = slide.querySelector("img");
    gsap.set(img, { scale: scale });

    if (distanceFromCenter < closestToCenter) {
      closestToCenter = distanceFromCenter;
      centerSlideIndex = index % TOTAL_SLIDES;
    }

    const currentTitleIndex = centerSlideIndex;
    sliderTitle.textContent = SLIDES_TITLE[currentTitleIndex];
  });

  updateThumbnail();
  requestAnimationFrame(animate);
}
