var swiper = new Swiper('.slide-wrap', {
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    slidesPerGroup: 1,
    autoplay: false,
    loop: true,
    // navigation: {
    //     nextEl: ".visual-button-next",
    //     prevEl: ".visual-button-prev"
    // },
    breakpoints: {
        280: {},
        768: {},
        1024: {}
    }
});