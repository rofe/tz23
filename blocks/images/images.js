let touchstart = 0;

function createButton(title, cls, click = () => {}) {
  const icon = document.createElement('i');
  const btn = document.createElement('button');
  btn.title = title;
  btn.classList.add(cls);
  btn.addEventListener('click', click);
  btn.append(icon);
  return btn;
}

function prevHandler(carousel) {
  carousel.prevSlide();
  if (!carousel.root.classList.contains('fullscreen')) {
    // (re)start carousel
    carousel.start();
  }
}

function nextHandler(carousel) {
  carousel.nextSlide();
  if (!carousel.root.classList.contains('fullscreen')) {
    // (re)start carousel
    carousel.start();
  }
}

function navHandler(carousel, index) {
  carousel.showSlide(index);
  // (re) start carousel
  carousel.start();
}
class Carousel {
  constructor(slides) {
    this.slides = slides;
    this.isFullScreen = false;

    this.root = document.createElement('div');
    this.root.classList.add('carousel');
    this.createDeck();
    this.createNav();
    this.createControls();
  }

  init(block) {
    this.showSlide(0);
    this.start();
    block.append(this.root);
  }

  stop() {
    clearInterval(this.interval);
  }

  start() {
    this.stop();
    this.interval = setInterval(() => this.nextSlide(), 7000);
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
    const prevSlide = this.currentSlide;
    this.currentSlide = index;
    this.slides[prevSlide]?.classList.remove('active');
    this.slides[this.currentSlide].classList.add('active');
    this.navLinks[prevSlide]?.classList.remove('active');
    this.navLinks[this.currentSlide].classList.add('active');
  }

  createDeck() {
    this.slides.forEach((slide) => slide.classList.add('carousel-slide'));
    this.root.append(...this.slides);
  }

  createNav() {
    this.navLinks = [];
    const nav = document.createElement('ol');
    nav.classList.add('carousel-nav');
    this.slides.forEach((_, i) => {
      const li = document.createElement('li');
      li.classList.add('carousel-navlink');
      if (i === 0) {
        li.classList.add('active');
      }
      li.addEventListener('click', () => navHandler(this, i));
      nav.appendChild(li);
      this.navLinks.push(li);
    });
    this.root.append(nav);
  }

  createControls() {
    // previous button
    this.root.append(createButton('Previous Image', 'carousel-previous', () => prevHandler(this)));

    // next button
    this.root.append(createButton('Next Image', 'carousel-next', () => nextHandler(this)));

    // fuillscreen toggle button
    const title = (fullscreen) => `${fullscreen ? 'Exit' : 'Enter'} Full Screen Mode`;
    const fsToggle = createButton(title(false), 'carousel-fullscreen-toggle', () => {
      const enterFullScreen = !this.root.classList.contains('fullscreen');
      this.root.classList.toggle('fullscreen');
      if (enterFullScreen) {
        this.isFullScreen = true;
        this.stop();
      } else {
        this.isFullScreen = false;
        this.start();
      }
      fsToggle.title = title(enterFullScreen);
    });
    this.root.append(fsToggle);

    // detect horizontal swiping
    const handleSwipe = (touchend = 0) => {
      if (touchend < touchstart) {
        nextHandler(this);
      } else if (touchend > touchstart) {
        prevHandler(this);
      }
      touchstart = 0;
    };
    this.root.addEventListener('touchstart', ({ changedTouches }) => {
      touchstart = changedTouches[0].screenX;
    }, { passive: true });
    this.root.addEventListener('touchend', ({ changedTouches }) => {
      handleSwipe(changedTouches[0].screenX);
    }, { passive: true });

    // detect arrow and esc keys
    document.addEventListener('keyup', ({ key }) => {
      if (this.isFullScreen) {
        if (key === 'ArrowLeft') {
          prevHandler(this);
        } else if (key === 'ArrowRight') {
          nextHandler(this);
        } else if (key === 'Escape') {
          fsToggle.click();
        }
      }
    });

    // show controls when mouse is in range
    this.root.addEventListener('mouseenter', () => {
      this.root.classList.add('carousel-show-controls');
    });
    this.root.addEventListener('mouseleave', () => {
      this.root.classList.remove('carousel-show-controls');
    });
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
