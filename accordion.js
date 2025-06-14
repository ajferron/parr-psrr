$(function() {
    $('.accordion-header').click(function() {
        const $item = $(this).parent();
        const $content = $item.find('.accordion-content');
        const $header = $(this);
        const $icon = $header.find('.accordion-icon');
        
        // Close other items
        $('.accordion-item').not($item).each(function() {
            const $otherContent = $(this).find('.accordion-content');
            const $otherHeader = $(this).find('.accordion-header');
            const $otherIcon = $otherHeader.find('.accordion-icon');
            
            gsap.to($otherContent, {duration: 0.3, height: 0, ease: "power2.out"});
            gsap.to($otherIcon, {duration: 0.3, rotation: 0, ease: "power2.out"});
            $otherHeader.removeClass('active');
        });
        
        // Toggle current item
        if ($header.hasClass('active')) {
            gsap.to($content, {duration: 0.3, height: 0, ease: "power2.out"});
            gsap.to($icon, {duration: 0.3, rotation: 0, ease: "power2.out"});
            $header.removeClass('active');
        } else {
            const targetHeight = $content.find('.accordion-content_inner').outerHeight();
            gsap.to($content, {duration: 0.3, height: targetHeight, ease: "power2.out"});
            gsap.to($icon, {duration: 0.3, rotation: 45, ease: "power2.out"});
            $header.addClass('active');
        }
    });
});