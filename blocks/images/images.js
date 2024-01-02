class Carousel {
  constructor(slides) {
    this.slides = slides;

    this.root = document.createElement('div');
    this.root.classList.add('carousel');
    this.createDeck();
    this.createNav();
    this.currentSlideIndex = 0;
  }

  init(block) {
    this.navLinks = this.root.querySelectorAll('ol > li');
    this.navLinks.forEach((li, i) => li.addEventListener('click', () => this.showSlide(i)));

    block.append(this.root);
    this.start();
  }

  start() {
    this.showSlide(0);
    setInterval(() => this.nextSlide(), 7000);
  }

  nextSlide() {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.showSlide(this.currentSlideIndex + 1);
    } else {
      this.showSlide(0);
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.showSlide(this.currentSlideIndex - 1);
    } else {
      this.showSlide(this.slides.length - 1);
    }
  }

  showSlide(index) {
    const prevSlideIndex = this.currentSlideIndex;
    this.currentSlideIndex = index;
    this.slides[prevSlideIndex].classList.remove('active');
    this.slides[this.currentSlideIndex].classList.toggle('active');
    this.navLinks[prevSlideIndex].classList.toggle('active');
    this.navLinks[this.currentSlideIndex].classList.toggle('active');
  }

  createDeck() {
    this.slides.forEach((slide) => slide.classList.add('carousel-slide'));
    this.root.append(...this.slides);
  }

  createNav() {
    const nav = document.createElement('ol');
    nav.classList.add('carousel-nav');
    this.slides.forEach((_, i) => {
      const li = document.createElement('li');
      li.classList.add('carousel-navlink');
      if (i === 0) {
        li.classList.add('active');
      }
      nav.appendChild(li);
    });
    this.root.append(nav);
  }
}

export default function decorate(block) {
  const slides = [];
  block.querySelectorAll('picture').forEach((pic) => {
    const slide = document.createElement('div');
    slide.append(pic);
    slides.push(slide);
  });
  block.innerHTML = '';

  // create carousel
  const carousel = new Carousel(slides);
  carousel.init(block);
}
