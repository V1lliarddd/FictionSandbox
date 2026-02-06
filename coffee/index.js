document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  //генерирует случайное значение свойства clip-path
  //опционально, мб потом поменяю логику
  //   function createClipPathProperty() {
  //     return `(${Math.round(Math.random() * 10)}% ${Math.round(Math.random() * 10)}%,
  //     ${Math.round(Math.random() * 10)}% ${Math.round(Math.random() * 10)}%,
  //     ${Math.round(Math.random() * 10)}% ${Math.round(Math.random() * 10)}%,
  //     ${Math.round(Math.random() * 10)}% ${Math.round(Math.random() * 10)}%)`;
  //   }

  gsap.ticker.lagSmoothing(0);

  gsap.utils.toArray(".work-item").forEach((item) => {
    const itemImg = item.querySelector(".work-item__img");
    const itemTitle = item.querySelector(".work-item__name h2");
    const split = SplitText.create(itemTitle, {
      type: "chars",
      mask: "chars",
    });

    gsap.set(split.chars, { y: "125%" });

    split.chars.forEach((char, index) => {
      ScrollTrigger.create({
        trigger: item,
        start: `top+=${index * 25 - 250} top`,
        end: `top+=${index * 25 - 100} top`,
        scrub: 1,
        animation: gsap.fromTo(char, { y: "125%" }, { y: "0%" }),
      });
    });

    ScrollTrigger.create({
      trigger: item,
      start: "top bottom",
      end: "top top",
      scrub: 0.5,
      animation: gsap.fromTo(
        itemImg,
        {
          clipPath: "polygon(25% 25%, 75% 40%, 100% 100%, 0% 100%)",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        },
      ),
    });

    ScrollTrigger.create({
      trigger: item,
      start: "bottom bottom",
      end: "bottom top",
      scrub: 0.5,
      animation: gsap.fromTo(
        itemImg,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 75% 60%, 25% 75%)",
        },
      ),
    });
  });
});
