let allCards;
/** Symbol ID, set from URL param */
let symbolFilter;
/** A selector */
let openedMenu;

const MENU_SELECTOR = {
  SYMBOLS: ".card-menu_symbol-menu.fab-menu_wrapper",
};

$(function () {
  symbolFilter = getSymbolFromUrl();
  const originalCards = document.querySelectorAll(".swiper-slide.card");
  // Store the HTML of every card rendered by Webflow and remove it from the document.
  allCards = Array.from(originalCards).map((card, index) => {
    const cardName = $(card).find(".card_name").html();
    const cardContent = $(card).find(".card_content p").html();
    const cardOrder = $(card)
      .find(".card_back-header .text-size-regular")
      .html();
    const clone = card.cloneNode(true);
    const slug = card.getAttribute("data-history");
    const group = card.getAttribute("data-card-group");
    const symbol = card.getAttribute("data-card-symbol");
    card.remove();
    // TODO: Clean up redundancy between index and id?
    return {
      index,
      slug,
      group,
      symbol,
      html: clone.outerHTML,
      // For searching...
      id: index,
      title: cardName,
      order: cardOrder,
      text: cardContent,
    };
  });

  const filteredCards = !symbolFilter
    ? allCards
    : allCards.filter((card) => card.symbol === symbolFilter);

  let cardSwiper, infoSwiper;

  function createCardSwiper(cards) {
    if (cardSwiper) {
      console.log("destroying cardSwiper");
      cardSwiper.destroy();
    }
    if (infoSwiper) {
      console.log("destroying infoSwiper");
      infoSwiper.destroy();
    }

    cardSwiper = new Swiper(".swiper.card", {
      effect: "cards",
      grabCursor: true,
      keyboard: true,
      history: {
        replaceState: true,
        keepQuery: true,
        key: "cards",
      },
      virtual: {
        slides: cards,
        cache: true,
        renderSlide: ({ html }, i) => html,
      },
      on: {
        init: function () {
          // Get the initial slide from URL. 'Cards Template' page will only load if the slug exists, otherwise Webflow 404s
          const urlSegments = window.location.pathname.split("/");
          const cardSlug =
            urlSegments[urlSegments.length - 1] || "introduction";
          const initialSlide = filteredCards.findIndex(
            (card) => card.slug === cardSlug
          );
          if (!isNaN(initialSlide) && initialSlide >= 0) {
            this.slideTo(initialSlide, 0, false);
          }
        },
      },
    });
    infoSwiper = new Swiper(".swiper.card-info", {
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      followFinger: false,
      grabCursor: true,
      keyboard: true,
      on: {
        init: function () {
          // When infoSwiper initializes, sync with cardSwiper's current slide
          if (cardSwiper.initialized) {
            this.slideTo(cardSwiper.activeIndex, 0, false);
          }
        },
      },
    });
    // Bidirectional control
    cardSwiper.controller.control = infoSwiper;
    infoSwiper.controller.control = cardSwiper;

    cardSwiper.on("tap", function (swiper, event) {
      const clickedSlide = swiper.clickedSlide;
      if (!clickedSlide) {
        return;
      }

      const clickedIndex = parseInt(
        clickedSlide.getAttribute("data-swiper-slide-index")
      );
      if (clickedIndex !== cardSwiper.activeIndex) return;

      // const slideData = swiper.virtual.slides[clickedIndex];
      const cardWrapper = $(clickedSlide).find(".card_wrapper");
      const cardBackChildren = $(clickedSlide).find(".card_back > *");
      const isFlipped = $(cardWrapper).hasClass("flipped");

      if (!isFlipped) {
        gsap.set(cardBackChildren, { autoAlpha: 0 });
        $(cardWrapper).addClass("flipped");
      }

      // Create a properly cached timeline with vars object
      const flipTimeline = gsap.timeline({
        defaults: {
          ease: "back.out(1.7)",
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
          force3D: true, // Force hardware acceleration
        },
        onComplete: function () {
          // Card started flipped, wait till animation ends before hiding the back
          if (isFlipped) $(cardWrapper).removeClass("flipped");
        },
      });

      flipTimeline
        .to(cardWrapper, { scale: 0.8, duration: 0.1, ease: "back.in(1.7)" })
        .to(cardWrapper, { rotationY: isFlipped ? 0 : 180, duration: 0.2 })
        .to(
          cardBackChildren,
          { autoAlpha: isFlipped ? 0 : 1, duration: 0.1 },
          "-=0.1"
        )
        .to(cardWrapper, { scale: 1, duration: 0.1 });
    });
  }

  createCardSwiper(filteredCards);

  gsap.set(".primary-button_regular, .card-menu_header", { opacity: 0, y: 20 });
  gsap.set(".card-menu_background", { opacity: 0 }); // background has display:none set in webflow since script load is delayed

  function showMenu(menuSelector, staggerFrom, childSelector = undefined) {
    const $menu = $(menuSelector);
    const $menuItems = $menu.find(
      childSelector ?? ".primary-button_regular, .card-menu_item-btn, .card-menu_header"
    );
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
    const $menuItems = $menu.find(
      childSelector ?? ".primary-button_regular, .card-menu_item-btn, .card-menu_header"
    );
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

  $(".fab-menu_button").on("click", function () {
    if (openedMenu) {
      $(openedMenu).trigger("close");
      openedMenu = null;
    } else {
      toggleMenu(".card-menu_main-menu");
    }
  });
  $(".card-menu_search-menu").on("close", async function () {
    toggleBackgroundBlur(false);
    await hideMenu(
      ".card-menu_search-menu",
      "end",
      '.card-search_results [role="button"]'
    );
    $("body").removeClass("disable-scroll");
    openedMenu = null;
  });
  $(".card-menu_topic-menu").on("close", async function () {
    toggleBackgroundBlur(false);
    await hideMenu(".card-menu_topic-menu", "end");
    openedMenu = null;
  });
  $(".card-menu_symbol-menu").on("close", async function () {
    toggleBackgroundBlur(false);
    await hideMenu(".card-menu_symbol-menu", "end");
    openedMenu = null;
  });

  $(".card-menu_symbol-menu.fab-menu_wrapper .primary-button_regular").on(
    "click",
    async function () {
      toggleBackgroundBlur(false);
      const symbol = $(this).attr("data-card-symbol");
      // Symbol selected, filter to only show that symbol
      $(".card-menu_symbol-menu").trigger("close");
      const firstOfSymbol = allCards.find((card) => symbol === card.symbol);
      if (firstOfSymbol) {
        navigateToNewCard(firstOfSymbol.slug, symbol);
        hideMenu(".card-menu_symbol-menu", "end");
        fadeOut();
      } else {
        console.error(
          `Found no cards with symbol ${symbol}, cancelling navigate`
        );
      }
    }
  );
  $(".card-menu_topic-menu.fab-menu_wrapper .card-menu_item-btn").on(
    "click",
    async function () {
      toggleBackgroundBlur(false);
      const cardGroup = $(this).attr("data-card-group");
      // Card group selected, go to first slide of the group
      const introSlideIndex = allCards.findIndex(
        (card) => card.group === cardGroup
      );
      if (!isNaN(introSlideIndex) && introSlideIndex >= 0) {
        hideMenu(".card-menu_topic-menu", "end");
        if (symbolFilter) {
          navigateToNewCard(allCards[introSlideIndex].slug);
          fadeOut();
        } else {
          cardSwiper.slideTo(introSlideIndex, 0, false);
          openedMenu = null;
        }
      } else {
        console.error(`No cards found with group "${cardGroup}"`);
      }
    }
  );

  // MAIN MENU ITEM HANDLERS
  $(".card-menu_main-menu.fab-menu_wrapper .primary-button_regular").on(
    "click",
    async function () {
      // Opening the submenu from the main menu
      openedMenu = $(this).attr("data-submenu"); // A selector, set as a Webflow custom attribute
      await toggleMenu(".card-menu_main-menu");
      $(openedMenu).trigger("open");
    }
  );
  let miniSearch;
  let debounceTimer;
  // MENU OPEN HANDLERS
  $(".card-menu_symbol-menu").on("open", async function () {
    await showMenu(".card-menu_symbol-menu", "end");
  });
  $(".card-menu_topic-menu").on("open", async function () {
    await showMenu(".card-menu_topic-menu", "end");
  });
  $(".card-menu_search-menu").on("open", async function () {
    toggleBackgroundBlur(true);

    $("body").toggleClass("disable-scroll");
    if (!miniSearch) {
      miniSearch = new MiniSearch({
        fields: ["title", "text"], // Fields to index for full-text search
        storeFields: ["title", "index", "order", "symbol"], // Fields to return with search results
        searchOptions: { prefix: true, boost: { title: 3 }, fuzzy: 0.2 },
      });
      miniSearch.addAll(allCards);
    }
    $(".card-search_input").trigger("focus");
    showSearchResults(allCards);

    await showMenu(
      ".card-menu_search-menu",
      "end",
      '.card-search_results [role="button"]'
    );
  });

  $(".card-search_input").on("keydown keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();
    }
    clearTimeout(debounceTimer);
    if (event.target.value.length === 0) {
      showSearchResults(allCards);
    } else {
      debounceTimer = setTimeout(() => {
        const results = miniSearch.search(event.target.value);
        showSearchResults(results);
      }, 300);
    }
  });

  function showSearchResults(cards) {
    const $searchResults = $(".card-search_results");
    $searchResults.empty();
    cards.forEach((card) => {
      $searchResults.append(getSearchResult(card));
    });
  }

  function getSearchResult({ index, title, order }) {
    const $searchResultWrapper = $("<div>")
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("aria-label", title)
      .css({
        display: "flex",
        gap: "5px",
        paddingBottom: "1rem",
        marginBottom: "1rem",
        borderBottom: "1px solid #555",
        cursor: "pointer",
      })
      // const $searchResultWrapper = $(
      //   '<button class="primary-button_regular shadow-medium text-size-large">'
      // )
      // .css({ padding: "9px 20px" })
      .hide()
      .fadeIn(250)
      .append(
        $("<p>").text(order.padStart(2, "0") + "."),
        $("<p>").text(title)
      );
    // .append($("<p>").text(`${order.padStart(2, "0")}. ${title}`))

    $searchResultWrapper.on("click", function () {
      toggleBackgroundBlur(false);
      // $searchResultWrapper.fadeOut(1000);
      toggleMenu(openedMenu, "end", '.card-search_results [role="button"]');
      if (symbolFilter) {
        navigateToNewCard(allCards[index].slug);
        fadeOut();
      } else {
        cardSwiper.slideTo(index, 0, false);
        openedMenu = null;
      }
      $("body").removeClass("disable-scroll");
    });

    return $searchResultWrapper;
  }
});

function navigateToNewCard(newCardId, symbol) {
  const currentUrl = window.location.href;
  // Extract the base URL (everything before the last segment)
  const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/") + 1);
  let newUrl = baseUrl + newCardId;
  if (symbol) {
    newUrl += "?symbol=" + encodeURIComponent(symbol);
  }
  // navigation.navigate(newUrl); doesn't work on S afari
  window.location.href = newUrl;
}

function getSymbolFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("symbol");
}

function toggleBackgroundBlur(show = true, blurAmount = 6) {
  const $cardMenuBackground = $(".card-menu_background");
  // Create a new timeline
  const tl = gsap.timeline();

  if (show) {
    // Show the background first
    $cardMenuBackground.show();
    // Animation for showing the blur
    return tl
      .to($cardMenuBackground, {
        autoAlpha: 1,
        duration: 0.2,
      })
      .to(
        $cardMenuBackground,
        {
          backdropFilter: `blur(${blurAmount}px)`,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.1"
      );
  } else {
    // Animation for hiding the blur
    return tl
      .to($cardMenuBackground, {
        backdropFilter: "blur(0px)",
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
      })
      .to(
        $cardMenuBackground,
        {
          autoAlpha: 0,
          duration: 0.2,
          onComplete: () => $cardMenuBackground.hide(),
        },
        "-=0.1"
      );
  }

  return tl; // Return the timeline for further chaining if needed
}

function fadeOut() {
  const tl = gsap.timeline();
  const $sliderWrapper = $(".slider_wrapper");
  tl.to($sliderWrapper, {
    backdropFilter: "blur(0px)",
    scale: 0.95,
    duration: 0.3,
    ease: "power2.in",
  }).to(
    $sliderWrapper,
    {
      autoAlpha: 0,
      duration: 0.2,
      onComplete: () => $sliderWrapper.hide(),
    },
    "-=0.1"
  );
}
