// Header Slide Functionality
class HeaderSlider {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.indicators = [];
    this.autoSlideInterval = null;
    this.autoSlideDelay = 8000;
    
    this.init();
  }

  // Đây là hàm khởi tạo khi mà program chạy thì nó sẽ khởi động 1 lần duy nhất
  init() {
    const headerSlide = document.querySelector('.header-slide');
    if (!headerSlide) return;

    // Get all slides
    this.slides = Array.from(headerSlide.querySelectorAll('.header'));
    if (this.slides.length === 0) return;

    // Get existing navigation buttons from HTML
    this.prevBtn = headerSlide.querySelector('.slide-nav.prev');
    this.nextBtn = headerSlide.querySelector('.slide-nav.next');

    // Get existing indicators from HTML
    this.indicators = Array.from(headerSlide.querySelectorAll('.slide-indicator'));

    // Show first slide
    this.showSlide(0);

    // Start auto slide
    this.startAutoSlide();
  }

  showSlide(index) {
    // Remove active class from all slides
    this.slides.forEach(slide => slide.classList.remove('active'));
    
    // Remove active class from all indicators
    this.indicators.forEach(indicator => indicator.classList.remove('active'));

    // Add active class to current slide
    this.slides[index].classList.add('active');
    
    // Add active class to current indicator
    if (this.indicators[index]) {
      this.indicators[index].classList.add('active');
    }

    this.currentSlide = index;
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(nextIndex);
    this.resetAutoSlide();
  }

  prevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prevIndex);
    this.resetAutoSlide();
  }

  goToSlide(index) {
    this.showSlide(index);
    this.resetAutoSlide();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideDelay);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}

// Global variable to access slider instance from HTML
let headerSlider;

// Initialize header slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  headerSlider = new HeaderSlider();
});