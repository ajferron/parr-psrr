$(function () {
    const $blurTarget = $('.layout_flower');
    // Configuration
    const maxBlur = 10; // Maximum blur in pixels
    const scrollDistance = 1000; // Scroll distance for full blur effect
    
    // Track current blur value for smooth animation
    let currentBlur = 0;
    
    function updateBlur() {
        const scrollY = $(window).scrollTop();
        // Calculate blur amount based on scroll position
        const blurAmount = Math.min((scrollY / scrollDistance) * maxBlur, maxBlur);
        // Animate blur smoothly with GSAP
        gsap.to({ blur: currentBlur }, {
            blur: blurAmount,
            duration: 0.3,
            ease: "power2.out",
            onUpdate: function() {
                currentBlur = this.targets()[0].blur;
                $blurTarget.css('filter', `blur(${currentBlur}px)`);
            }
        });
    }
    
    // Alternative method using GSAP's direct element animation
    function updateBlurDirect() {
        const scrollY = $(window).scrollTop();
        const blurAmount = Math.min((scrollY / scrollDistance) * maxBlur, maxBlur);
        // Direct GSAP animation on the element
        gsap.to($blurTarget[0], {
            filter: `blur(${blurAmount}px)`,
            duration: 0.3,
            ease: "power2.out"
        });
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateBlur);
            ticking = true;
        }
    }
    
    function resetTick() {
        ticking = false;
    }
    
    // Bind scroll event
    $(window).on('scroll', function() {
        requestTick();
        setTimeout(resetTick, 50);
        console.log('HELLO')
    });
    
    // Initialize
    updateBlur();
});