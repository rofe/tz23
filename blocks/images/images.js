import Carousel from './carousel.js';

export default function decorate(block) {
  const slides = [];
  block.querySelectorAll('picture').forEach((pic) => {
    const slide = document.createElement('div');
    slide.append(pic);
    slides.push(slide);
  });
  block.innerHTML = '';

  // draw carousel
  const carousel = new Carousel(slides);
  carousel.draw(block);
}
