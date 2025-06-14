$(function () {
    // Initialize all dropdown items as hidden
    gsap.set('.common_dropdown_items', { display: 'none' });
    gsap.set('.common_dropdown_item', { opacity: 0, y: -10 });

    // Utility functions
    function openDropdown($dropdown) {
        const $arrow = $dropdown.find('.common_dropdown_arrow');
        const $items = $(`#${$dropdown.attr('target')}`).find('.common_dropdown_item');
        
        gsap.set('.common_dropdown_items', { display: 'flex' });
        $items.css('display', 'block');
        
        gsap.to($arrow, { rotation: 180, duration: 0.3, ease: "power2.out" });
        gsap.to($items, { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: "power2.out" });
        
        $dropdown.data('isOpen', true);
    }

    function closeDropdown($dropdown) {
        const $arrow = $dropdown.find('.common_dropdown_arrow');
        const $items = $(`#${$dropdown.attr('target')}`).find('.common_dropdown_item');
        
        gsap.to($arrow, { rotation: 0, duration: 0.3, ease: "power2.out" });
        gsap.to($items, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            stagger: 0.05,
            ease: "power2.in",
            onComplete: () => $items.css('display', 'none')
        });
        
        $dropdown.data('isOpen', false);
    }

    function closeAllDropdowns() {
        $('.common_dropdown_button').each(function() {
            const $dropdown = $(this);
            if ($dropdown.data('isOpen')) {
                closeDropdown($dropdown);
            }
        });
    }

    function closeOtherDropdowns($currentDropdown) {
        $('.common_dropdown_button').not($currentDropdown).each(function() {
            const $dropdown = $(this);
            if ($dropdown.data('isOpen')) {
                closeDropdown($dropdown);
            }
        });
    }

    // Toggle dropdown on click
    $('.common_dropdown_button').on('click', function(e) {
        e.stopPropagation();
        
        const $dropdown = $(this);
        const isOpen = $dropdown.data('isOpen') || false;
        
        closeOtherDropdowns($dropdown);
        
        if (!isOpen) {
            openDropdown($dropdown);
        } else {
            closeDropdown($dropdown);
        }
    });
    
    // Handle item selection
    $('.common_dropdown_item').on('click', function(e) {
        e.stopPropagation();
        
        const $item = $(this);
        const $dropdown = $item.closest('.common_dropdown').find('.common_dropdown_button');
        const $valueElement = $dropdown.find('.common_dropdown_value');
        const selectedText = $item.find('.common_dropdown_item-text').text();

        $('#' + $item.attr('target')).get(0).scrollIntoView();
        $valueElement.text(selectedText);
        closeDropdown($dropdown);
    });
    
    // Close all dropdowns when clicking outside
    $(document).on('click', closeAllDropdowns);
});