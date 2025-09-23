class swiperComponent extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    this.swiper = this.querySelector('[data-swiper]');
    this.initSwiper();
  }

  initSwiper() {
    if(!this.swiper) return;
    const swiperOptions = this.swiper.dataset?.swiperOptions || {};
    new Swiper(this.swiper, JSON.parse(swiperOptions));
  }

}

customElements.define('swiper-component', swiperComponent);