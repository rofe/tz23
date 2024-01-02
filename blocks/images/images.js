let touchstart = 0;

class Carousel {
  constructor(slides) {
    this.slides = slides;

    this.root = document.createElement('div');
    this.root.classList.add('carousel');
    this.createDeck();
    this.createNav();
    this.createControls();
  }

  init(block) {
    this.navLinks = this.root.querySelectorAll('ol > li');
    this.navLinks.forEach((li, i) => li.addEventListener('click', () => this.showSlide(i)));

    block.append(this.root);
    this.showSlide(0);
    this.start();
    this.detectSwipe();
  }

  start() {
    this.interval = setInterval(() => this.nextSlide(), 7000);
  }

  stop() {
    clearInterval(this.interval);
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.showSlide(this.currentSlide + 1);
    } else {
      this.showSlide(0);
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.showSlide(this.currentSlide - 1);
    } else {
      this.showSlide(this.slides.length - 1);
    }
  }

  showSlide(index) {
    const prevSlide = this.currentSlide || 0;
    this.currentSlide = index;
    this.slides[prevSlide].classList.remove('active');
    this.slides[this.currentSlide].classList.toggle('active');
    this.navLinks[prevSlide].classList.toggle('active');
    this.navLinks[this.currentSlide].classList.toggle('active');
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

  createControls() {
    const getTitle = (fullscreen) => `${fullscreen ? 'Exit' : 'Enter'} Full Screen Mode`;
    const icon = document.createElement('i');
    const btn = document.createElement('button');
    btn.title = getTitle(false);
    btn.classList.add('carousel-fullscreen-toggle');
    btn.addEventListener('click', () => {
      const enterFullScreen = !this.root.classList.contains('fullscreen');
      this.root.classList.toggle('fullscreen');
      if (enterFullScreen) {
        this.stop();
      } else {
        this.start();
      }
      btn.title = getTitle(enterFullScreen);
    });
    btn.append(icon);
    this.root.append(btn);
  }

  detectSwipe() {
    const handleSwipe = (touchend = 0) => {
      if (touchend < touchstart) {
        this.nextSlide();
      } else if (touchend > touchstart) {
        this.prevSlide();
      }
      touchstart = 0;
    };

    this.root.addEventListener('touchstart', ({ changedTouches }) => {
      touchstart = changedTouches[0].screenX;
    }, { passive: true });
    this.root.addEventListener('touchend', ({ changedTouches }) => {
      handleSwipe(changedTouches[0].screenX);
    }, { passive: true });
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
