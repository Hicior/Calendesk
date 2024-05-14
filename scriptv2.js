
function waitForElement(selector, callback) {
    var element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        setTimeout(function() { waitForElement(selector, callback); }, 500);
    }
}

// Function to initialize Swiper
function initSwiper() {
    var swiper = new Swiper(".slide-content", {
        slidesPerView: 3,
        spaceBetween: 25,
        loop: true,
        centerSlide: 'true',
        fade: 'true',
        grabCursor: 'true',
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: 1,
            },
            520: {
                slidesPerView: 2,
            },
            950: {
                slidesPerView: 3,
            },
        },
    });
}

// Wait for the swiper container to be available in the DOM before initializing Swiper
waitForElement('.slide-content', initSwiper);