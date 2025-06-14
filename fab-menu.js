$(function () {
    gsap.set(".fab-menu_container .primary-button_regular", { opacity: 0, y: 20 });

    function showMenu(menuSelector, staggerFrom, childSelector = undefined) {
        const $menu = $(menuSelector);
        const $menuItems = $menu.find(childSelector ?? ".primary-button_regular");
        // Show menus first so the animation has something to work with
        $menu.css("display", "flex");
        // Reset items to starting position for animation
        gsap.set($menuItems, { opacity: 0, y: 20 });
        // Animate items with stagger
        return gsap.to($menuItems, {
            opacity: 1,
            y: 0,
            duration: 0.25,
            stagger: {
                from: staggerFrom,
                amount: 0.05,
            },
            ease: "power2.out",
        });
    }

    function hideMenu(menuSelector, staggerFrom, childSelector = undefined) {
        const $menu = $(menuSelector);
        const $menuItems = $menu.find(childSelector ?? ".primary-button_regular");
        // Hide animation
        return gsap.to($menuItems, {
            opacity: 0,
            y: 20,
            duration: 0.25,
            stagger: {
                from: staggerFrom,
                amount: 0.05,
            },
            ease: "power2.in",
            onComplete: function () {
                $menu.hide();
            },
        });
    }

    // TODO: Not using this rn (see FAB click handler below)
    function toggleMenu(
        menuSelector,
        staggerFrom = "start",
        childSelector = undefined
    ) {
        const $menu = $(menuSelector);
        if ($menu.is(":visible")) {
            return hideMenu(menuSelector, staggerFrom, childSelector);
        } else {
            return showMenu(menuSelector, staggerFrom, childSelector);
        }
    }

    function toggleMenuButtonColor(isOpen) {
        const $button = $(".fab-menu_button");
        if (isOpen) {
            // Transition to translucent black when menu opens
            gsap.to($button, {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                duration: 0.25,
                ease: "power2.out"
            });
        } else {
            console.log('ay')
            // Transition back to original color when menu closes
            gsap.to($button, {
                backgroundColor: "var(--buttons--primary)", // or whatever your original color is
                duration: 0.25,
                ease: "power2.out"
            });
        }
    }

    $(".fab-menu_button").on("click", function () {
        const menuSelector = ".fab-menu_wrapper.main-menu"
        const staggerFrom = "start";

        if ($(menuSelector).is(":visible")) {
            toggleMenuButtonColor(false);
            return hideMenu(menuSelector, staggerFrom);
        } else {
            toggleMenuButtonColor(true);
            return showMenu(menuSelector, staggerFrom);
        }
    });  
});