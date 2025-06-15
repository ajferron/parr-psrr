$(function () {
  const stackedItems = [...$(".image-stack_item")];
  let isAnimating = false;

  // Function to preload all stackedItems
  function preloadImages() {
    return new Promise((resolve) => {
      const imageElements = stackedItems.map(wrapper => wrapper.querySelector('img')).filter(img => img);
      let loadedCount = 0;
      const totalImages = imageElements.length;

      if (totalImages === 0) {
        resolve();
        return;
      }

      function onImageLoad() {
        loadedCount++;
        if (loadedCount === totalImages) {
          resolve();
        }
      }

      imageElements.forEach(img => {
        if (img.complete) {
          onImageLoad();
        } else {
          img.addEventListener('load', onImageLoad);
          img.addEventListener('error', onImageLoad); // Handle errors gracefully
        }
      });
    });
  }

  // Initially hide all cards and position them for the entrance animation
  stackedItems.forEach((item, index) => {
    const image = $(item).find('.image-stack_image-wrapper');
    const button = $(item).find('.home_cta');

    gsap.set(image, {
      x: 0,
      y: -index * 3 + 30, // Start position slightly lower for entrance
      zIndex: stackedItems.length - index,
      rotation: Math.random() * 8 - 4,
      scale: 1 - (index * 0.02),
      opacity: 0, // Start invisible
      transformOrigin: "center center"
    });
    // Initially hide all CTA buttons
    gsap.set(button, { opacity: 0 });
  });

  // Staggered entrance animation (bottom to top)
  function animateCardsIn() {
    const tl = gsap.timeline();
    
    // Animate cards from back to front (reverse order for bottom-to-top effect)
    stackedItems.slice().forEach((item, index) => {
      const image = $(item).find('.image-stack_image-wrapper');
      const button = $(item).find('.home_cta');

      const actualIndex = stackedItems.length - 1 - index;
      
      tl.to(image, {
        y: -actualIndex * 3, // Final position
        opacity: 1,
        scale: 1 - (actualIndex * 0.012),
        duration: 0.6,
        ease: "back.out(1.7)",
      }, index * 0.15); // Stagger delay of 150ms between each item

      if (index === 0) {
        tl.to(button, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    });
    
    return tl;
  }

  // Wait for stackedItems to load before starting animations
  preloadImages().then(() => {
    // opacity:0 set in Webflow set as initial state
    // Need to use opacity since display:none prevents image load
    gsap.set($('.image-stack'), { opacity: 1 });
    gsap.delayedCall(0.3, () => {
      animateCardsIn().then(() => {
        // Start the cycling animation after entrance is complete
        gsap.delayedCall(2, function repeat() {
          cycleCard();
          gsap.delayedCall(5, repeat);
        });
      });
    });
  });

  function cycleCard() {
    if (isAnimating) return;
    isAnimating = true;
    
    const topCard = $(stackedItems[0]).find('.image-stack_image-wrapper');
    const currentCTA = $(stackedItems[0]).find('.home_cta');
    const nextCTA = $(stackedItems[1]).find('.home_cta'); // The card that will become the new top

    // Create timeline for smoother orchestration
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      }
    });

    // Fade out current CTA button at the start
    tl.to(currentCTA, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    })
    // Quick snap out with dramatic rotation and scale
    .to(topCard, {
      x: -400,
      y: -50,
      rotation: -25,
      scale: 0.8,
      opacity: 0,
      duration: 0.55, // Much faster exit
      ease: "power3.in",
    }, "-=0.1") // Start slightly before CTA fade completes
    .call(() => {
      // Move card to bottom of array
      stackedItems.push(stackedItems.shift());
      
      // Reset position for re-entry
      gsap.set(topCard, {
        x: 400, // Enter from opposite side
        y: -(stackedItems.length - 1) * 3,
        opacity: 0,
        zIndex: 1,
        rotation: Math.random() * 8 - 4,
        scale: 0.9,
      });
      
      // Update z-index for all cards
      stackedItems.forEach((card, index) => {
        gsap.set(card, {
          zIndex: stackedItems.length - index,
        });
      });
    })
    // Snap back in with bounce
    .to(topCard, {
      x: 0,
      y: -(stackedItems.length - 1) * 3,
      rotation: Math.random() * 8 - 4,
      scale: 1 - ((stackedItems.length - 1) * 0.02),
      duration: 0.65, // Quick entry
      ease: "back.out(2)", // Bouncy ease for satisfaction
    }, "-=0.1") // Slight overlap for smoother transition
    .to(topCard, {
      opacity: 1,
      duration: 0.35, // Much faster fade in
      ease: "power2.out",
    }, "-=0.2") // Start fading in during movement
    // Fade in the new top card's CTA button
    .to(nextCTA, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.2"); // Start fading in slightly before card animation completes
  }

  new Swiper(".swiper", {
    effect: "cards",
    grabCursor: true,
    keyboard: true,
    initialSlide: 1,
    cardsEffect: {
      perSlideOffset: 24,
      perSlideRotate: 8,
    },
  });
});
