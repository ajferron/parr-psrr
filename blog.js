$(function () {
    $('.blog_grid_item-image').closest('.shadow-medium').each(function() {
        const randomRotation = (Math.random() * 4) - 2; // Random number between -2 and 2
        $(this).css('transform', `rotate(${randomRotation}deg)`);
    });

    $('.blog_grid_link').hover(
        function () {
            const $image = $(this).find('.shadow-medium');
            const $accent = $(this).find('.blog_grid_item-accent');

            gsap.to($image, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to($accent, {
                scale: 1.1,
                duration: 0.2,
                ease: "back.out(1.2)"
            });
        },
        function () {
            const $image = $(this).find('.shadow-medium');
            const $accent = $(this).find('.blog_grid_item-accent');

            gsap.to($image, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to($accent, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        }
    );
});
