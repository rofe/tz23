/**
 * Carousel
 */
export default class Carousel {
  #slides = [];

  #cfg = {};

  #root = undefined;

  #currentSlide = 0;

  #navLinks = [];

  #loop = undefined;

  #lastMouseMove = 0;

  #mouseTracker = undefined;

  #isFullScreen = false;

  #touchstart = 0;

  /**
   * Creates a new carousel
   * @param {Iterable<HTMLElement>} slides The slides to show
   * @param {Object} opts The carousel options
   */
  constructor(slides = [], opts = {}) {
    this.#slides = [...slides];
    this.#cfg = {
      nav: true,
      arrows: true,
      fullscreen: true,
      loop: true,
      interval: 7000,
      idleTime: 3000,
      ...opts,
    };
    this.#root = document.createElement('div');
    this.#root.classList.add('carousel');
  }

  async draw(elem) {
    const {
      nav,
      arrows,
      fullscreen,
      loop,
    } = this.#cfg;
    this.#createDeck();
    if (nav) {
      this.#createNav();
    }
    if (arrows) {
      this.#createArrows();
    }
    if (fullscreen) {
      this.#createFullScreenMode();
    }
    this.showSlide(0);
    elem.append(await this.#fetchCSS());
    elem.append(this.#root);
    if (loop) {
      this.start();
    }
  }

  stop() {
    if (this.#loop) {
      clearInterval(this.#loop);
      this.#loop = undefined;
    }
  }

  start() {
    this.stop();
    this.#loop = setInterval(() => this.nextSlide(), this.#cfg.interval);
  }

  nextSlide(userAction = false) {
    if (this.#currentSlide < this.#slides.length - 1) {
      this.showSlide(this.#currentSlide + 1);
    } else {
      this.showSlide(0);
    }
    if (userAction && this.#loop) {
      this.start();
    }
  }

  previousSlide(userAction = false) {
    if (this.#currentSlide > 0) {
      this.showSlide(this.#currentSlide - 1);
    } else {
      this.showSlide(this.#slides.length - 1);
    }
    if (userAction && this.#loop) {
      this.start();
    }
  }

  showSlide(index) {
    const prevSlide = this.#currentSlide;
    this.#currentSlide = index;
    this.#slides[prevSlide]?.classList.remove('active');
    this.#slides[this.#currentSlide]?.classList.add('active');
    this.#navLinks[prevSlide]?.classList.remove('active');
    this.#navLinks[this.#currentSlide]?.classList.add('active');
  }

  // eslint-disable-next-line class-methods-use-this
  async #fetchCSS() {
    const style = document.createElement('style');
    let css = '';
    try {
      const resp = await fetch('/blocks/images/carousel.css');
      css = await resp.text();
    } catch (e) {
      // ignore
    }
    style.append(css);
    return style;
  }

  #createDeck() {
    this.#slides.forEach((slide) => slide.classList.add('carousel-slide'));
    this.#root.append(...this.#slides);
  }

  #navHandler(index) {
    this.showSlide(index);
    if (this.#cfg.loop) {
      // (re)start carousel
      this.start();
    }
  }

  #createNav() {
    const nav = document.createElement('ol');
    nav.classList.add('carousel-nav');
    this.#slides.forEach((_, i) => {
      const li = document.createElement('li');
      li.classList.add('carousel-navlink');
      if (i === 0) {
        li.classList.add('active');
      }
      li.addEventListener('click', () => this.#navHandler(i));
      nav.appendChild(li);
      this.#navLinks.push(li);
    });
    this.#root.append(nav);
  }

  // eslint-disable-next-line class-methods-use-this
  #createButton(title, cls, click = () => {}) {
    const icon = document.createElement('i');
    const btn = document.createElement('button');
    btn.title = title;
    btn.classList.add(cls);
    btn.addEventListener('click', click);
    btn.append(icon);
    return btn;
  }

  #stopMouseTracker() {
    this.#root.classList.remove('carousel-show-controls');
    if (this.#mouseTracker) {
      clearInterval(this.#mouseTracker);
      this.#mouseTracker = undefined;
    }
  }

  #startMouseTracker() {
    this.#root.classList.add('carousel-show-controls');
    // check mouse idle time every second
    this.#mouseTracker = setInterval(() => {
      if (this.#mouseTracker && this.#lastMouseMove
        && Date.now() > this.#lastMouseMove + this.#cfg.idleTime) {
        this.#stopMouseTracker();
      }
    }, 1000);
  }

  #createArrows() {
    // add arrow buttons
    this.#root.append(this.#createButton('Previous Image', 'carousel-previous', () => this.previousSlide(true)));
    this.#root.append(this.#createButton('Next Image', 'carousel-next', () => this.nextSlide(true)));

    // show arrows when mouse is in range and hide when idle for 5s
    this.#root.addEventListener('mouseleave', () => {
      this.#stopMouseTracker();
    }, { passive: true });
    this.#root.addEventListener('mousemove', () => {
      this.lastMouseMove = Date.now();
      this.#startMouseTracker();
    }, { passive: true });
  }

  #swipeHandler(touchend = 0) {
    if (touchend < this.#touchstart) {
      this.previousSlide(true);
    } else if (touchend > this.#touchstart) {
      this.nextSlide(true);
    }
    this.#touchstart = 0;
  }

  #createFullScreenMode() {
    // fullscreen button
    const title = (fullscreen) => `${fullscreen ? 'Exit' : 'Enter'} Full Screen Mode`;
    const fsButton = this.#createButton(title(false), 'carousel-fullscreen-toggle', () => {
      this.#root.classList.toggle('fullscreen');
      if (!this.#isFullScreen) {
        this.#isFullScreen = true;
        if (this.#cfg.loop) {
          this.stop();
        }
      } else {
        this.#isFullScreen = false;
        if (this.#cfg.loop) {
          this.start();
        }
      }
      fsButton.title = title(this.#isFullScreen);
    });
    this.#root.append(fsButton);

    // detect horizontal swiping
    this.#root.addEventListener('touchstart', ({ changedTouches }) => {
      if (this.#isFullScreen) {
        this.touchstart = changedTouches[0].screenX;
      }
    }, { passive: true });
    this.#root.addEventListener('touchend', ({ changedTouches }) => {
      if (this.#isFullScreen) {
        this.#swipeHandler(changedTouches[0].screenX);
      }
    }, { passive: true });

    // detect arrow and esc keys
    document.addEventListener('keyup', ({ key }) => {
      if (this.#isFullScreen) {
        if (key === 'ArrowLeft') {
          this.previousSlide(true);
        } else if (key === 'ArrowRight') {
          this.nextSlide(true);
        } else if (key === 'Escape') {
          fsButton.click();
        }
      }
    }, { passive: true });
  }
}
