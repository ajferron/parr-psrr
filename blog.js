$(function () {
    $('.blog_grid_item-image').closest('.shadow-medium').each(function() {
        const randomRotation = (Math.random() * 4) - 2; // Random number between -2 and 2
        $(this).css('transform', `rotate(${randomRotation}deg)`);
    });

    $('.blog_grid_item-link').hover(
        function() {
            const $item = $(this).closest('.blog_grid_item');
            const $image = $item.find('.shadow-medium');
            const $link = $(this);
            
            gsap.to($image, {
                scale: 1.08,
                duration: 0.3,
                ease: "power2.out"
            });
            
            gsap.to($link, {
                scale: 1.15,
                duration: 0.2,
                ease: "back.out(1.2)"
            });
        },
        function() {
            const $item = $(this).closest('.blog_grid_item');
            const $image = $item.find('.shadow-medium');
            const $link = $(this);
            
            gsap.to($image, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
            
            gsap.to($link, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        }
    );
    
    // Image hover: scales only the image with parallax effect
    $('.blog_grid_item-image').hover(
        function() {
            const $image = $(this);
            
            gsap.to($image, {
                scale: 1.08,
                duration: 0.6,
                ease: "power3.out"
            });
        },
        function() {
            const $image = $(this);
            
            gsap.to($image, {
                scale: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    );
});
