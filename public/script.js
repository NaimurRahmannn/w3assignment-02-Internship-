document.addEventListener("DOMContentLoaded", () => {
  const openButtons = document.querySelectorAll("[data-gallery-open]");
  const modal = document.querySelector("#gallery-modal");

  // About section expand/collapse toggle.
  
  const aboutSection = document.querySelector("[data-about-description]");
  if (aboutSection) {
    const moreContent = aboutSection.querySelector("[data-about-more]");
    const toggleButton = aboutSection.querySelector("[data-about-toggle]");

    if (moreContent && toggleButton) {
      const setExpanded = (expanded) => {
        moreContent.hidden = !expanded;
        toggleButton.textContent = expanded ? "Show less" : "Show more";
        toggleButton.setAttribute("aria-expanded", String(expanded));
      };

      setExpanded(false);
      toggleButton.addEventListener("click", () => {
        setExpanded(moreContent.hidden);
      });
    }
  }

  // Amenities list expand/collapse toggle.

  const amenitiesSection = document.querySelector("[data-amenities-description]");
  if (amenitiesSection) {
    const moreAmenities = amenitiesSection.querySelector("[data-amenities-more]");
    const toggleButton = amenitiesSection.querySelector("[data-amenities-toggle]");

    if (moreAmenities && toggleButton) {
      const setExpanded = (expanded) => {
        moreAmenities.hidden = !expanded;
        toggleButton.textContent = expanded ? "Show less" : "Show more";
        toggleButton.setAttribute("aria-expanded", String(expanded));
      };

      setExpanded(false);
      toggleButton.addEventListener("click", () => {
        setExpanded(moreAmenities.hidden);
      });
    }
  }



// FAQ section expand/collapse toggle. 


  const faqItems = document.querySelectorAll(".faq-item");
  if (faqItems.length) {
    faqItems.forEach((item) => {
      const toggle = item.querySelector(".faq-label");
      const checkbox = item.querySelector(".faq-toggle");

      if (!toggle) {
        return;
      }

      const setExpanded = (expanded) => {
        item.classList.toggle("is-open", expanded);
        if (checkbox) {
          checkbox.checked = expanded;
        }
        toggle.setAttribute("aria-expanded", String(expanded));
      };

      const initialOpen = checkbox ? checkbox.checked : item.classList.contains("is-open");
      setExpanded(initialOpen);

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        setExpanded(!item.classList.contains("is-open"));
      });
    });
  }
// Review cards expand/collapse toggle.


  const reviewCards = document.querySelectorAll(".review-card");
  if (reviewCards.length) {
    reviewCards.forEach((card) => {
      const moreContent = card.querySelector("[data-review-more]");
      const toggleButton = card.querySelector("[data-review-toggle]");

      if (!moreContent || !toggleButton) {
        return;
      }

      const setExpanded = (expanded) => {
        moreContent.hidden = !expanded;
        toggleButton.textContent = expanded ? "Show less" : "Show more";
        toggleButton.setAttribute("aria-expanded", String(expanded));
      };

      setExpanded(false);
      toggleButton.addEventListener("click", (event) => {
        event.preventDefault();
        setExpanded(moreContent.hidden);
      });
    });
  }

  const bookingCard = document.querySelector(".booking-card");
  if (bookingCard) {
    const checkinInput = bookingCard.querySelector("[data-checkin-input]");
    const checkoutInput = bookingCard.querySelector("[data-checkout-input]");
    const pricePerNightLabel = bookingCard.querySelector("[data-price-per-night]");
    const totalPriceLabel = bookingCard.querySelector("[data-total-price]");
    const nightlyRate = Number(bookingCard.dataset.nightlyRate) || 0;

    const formatCurrency = (value) =>
      `USD $${value.toLocaleString("en-US", {
        maximumFractionDigits: 0,
        useGrouping: false
      })}`;
    const setTotalPrice = (nights) => {
      if (!totalPriceLabel) {
        return;
      }
      const total = nights > 0 ? nights * nightlyRate : nightlyRate;
      totalPriceLabel.textContent = formatCurrency(total);
    };

    if (pricePerNightLabel) {
      pricePerNightLabel.textContent = formatCurrency(nightlyRate);
    }
    setTotalPrice(1);

    if (checkinInput && checkoutInput && window.HotelDatepicker && window.fecha) {
      const separator = " - ";
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const datepicker = new HotelDatepicker(checkinInput, {
        format: "MMM D, YYYY",
        separator,
        startDate: today,
        minNights: 1,
        selectForward: true,
        autoClose: true,
        getValue: () => {
          if (checkinInput.value && checkoutInput.value) {
            return `${checkinInput.value}${separator}${checkoutInput.value}`;
          }
          return "";
        },
        setValue: (_value, start, end) => {
          checkinInput.value = start || "";
          checkoutInput.value = end || "";
        },
        onSelectRange: () => {
          const nights = datepicker.getNights();
          if (nights > 0) {
            setTotalPrice(nights);
          }
        }
      });

      const openPicker = () => datepicker.open();
      checkoutInput.addEventListener("focus", openPicker);
      checkoutInput.addEventListener("click", openPicker);

      checkinInput.addEventListener("afterClear", () => {
        setTotalPrice(1);
      });
    }
  }
// nearby section property loading, sorting, and rendering.

  const nearbySection = document.querySelector(".nearby-section");
  if (nearbySection) {
    const sortSelect = nearbySection.querySelector("[data-nearby-sort]");
    const grid = nearbySection.querySelector("[data-nearby-grid]");
    const mapCanvas = nearbySection.querySelector("[data-map-canvas]");
    const mapAside = nearbySection.querySelector(".nearby-map-aside");
    const leftColumn = nearbySection.querySelector(".nearby-left");
    const desktopQuery = window.matchMedia("(min-width: 1200px)");
    const zoomInButton = nearbySection.querySelector("[data-map-zoom-in]");
    const zoomOutButton = nearbySection.querySelector("[data-map-zoom-out]");

    if (sortSelect && grid) {
      const imageBase = "https://beta.imgservice.rentbyowner.com/640x300/";
      const mobileQuery = window.matchMedia("(max-width: 768px)");
      const favoritesKey = "nearbyFavorites";

    

      let mapZoom = Number.parseInt(mapCanvas?.dataset.mapZoom || "", 10);
      if (!Number.isFinite(mapZoom)) {
        mapZoom = 13;
      }
      const clampZoom = (value) => Math.min(20, Math.max(2, value));
      let mapInstance = null;
      let mapMarker = null;
      let mapsPromise = null;
      const loadGoogleMaps = (apiKey) => {
        if (window.google && window.google.maps) {
          return Promise.resolve();
        }
        if (mapsPromise) {
          return mapsPromise;
        }
        mapsPromise = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Maps script failed to load"));
          document.head.appendChild(script);
        });
        return mapsPromise;
      };
      const initMap = async () => {
        if (!mapCanvas) {
          return;
        }
        const apiKey = window.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          mapCanvas.textContent = "Map unavailable";
          return;
        }
        try {
          await loadGoogleMaps(apiKey);
        } catch (error) {
          console.error("Google Maps failed to load:", error);
          mapCanvas.textContent = "Map unavailable";
          return;
        }

        const location = mapCanvas.dataset.mapLocation || "Sanctuary Cap Cana";
        mapInstance = new window.google.maps.Map(mapCanvas, {
          center: { lat: 18.4906, lng: -68.3639 },
          zoom: mapZoom,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const position = results[0].geometry.location;
            mapInstance.setCenter(position);
            if (mapMarker) {
              mapMarker.setMap(null);
            }
            mapMarker = new window.google.maps.Marker({
              map: mapInstance,
              position
            });
          }
        });
      };
      const updateMapZoom = (delta) => {
        mapZoom = clampZoom(mapZoom + delta);
        if (mapCanvas) {
          mapCanvas.dataset.mapZoom = String(mapZoom);
        }
        if (mapInstance) {
          mapInstance.setZoom(mapZoom);
        }
      };
      const syncMapHeight = () => {
        if (!mapAside || !leftColumn) {
          return;
        }
        if (!desktopQuery.matches) {
          mapAside.style.height = "";
          return;
        }
        mapAside.style.height = `${leftColumn.offsetHeight}px`;
      };

      const loadFavorites = () => {
        try {
          const stored = JSON.parse(localStorage.getItem(favoritesKey) || "[]");
          if (!Array.isArray(stored)) {
            return new Set();
          }
          return new Set(stored.filter((id) => typeof id === "string"));
        } catch (error) {
          console.error("Failed to load favorites:", error);
          return new Set();
        }
      };
      const saveFavorites = (favorites) => {
        try {
          localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
        } catch (error) {
          console.error("Failed to save favorites:", error);
        }
      };
      const setFavoriteButtonState = (button, isFavorite) => {
        button.setAttribute("aria-pressed", String(isFavorite));
        button.classList.toggle("is-active", isFavorite);
      };

      const favorites = loadFavorites();

      const getLimit = () => (mobileQuery.matches ? 4 : 6);
      const getSortParam = (value) => {
        if (value === "highest-price") {
          return "highest-price";
        }
        if (value === "lowest-price") {
          return "lowest-price";
        }
        return "most-popular";
      };
      const formatPrice = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0) {
          return "From $--";
        }
        return `From $${numeric.toLocaleString("en-US", {
          maximumFractionDigits: 0
        })}`;
      };
      const buildImageUrl = (featureImage) => {
        if (featureImage && typeof featureImage === "string") {
          return `${imageBase}${featureImage}`;
        }
        return "assets/nearby-resort-1.png";
      };
      const getAmenitiesText = (property) => {
        if (Array.isArray(property.TopAmenities) && property.TopAmenities.length) {
          return property.TopAmenities.slice(0, 3)
            .map((amenity) => amenity.Name)
            .filter(Boolean)
            .join(" / ");
        }
        if (property.Amenities && typeof property.Amenities === "object") {
          return Object.values(property.Amenities)
            .filter(Boolean)
            .slice(0, 3)
            .join(" / ");
        }
        return "Amenities available";
      };
      const getLocationText = (geo) => {
        if (geo.Display) {
          return geo.Display;
        }
        const city = geo.City || "";
        const country = geo.Country || "";
        return [city, country].filter(Boolean).join(", ") || "Location details";
      };
      const getBrand = (url) => {
        if (!url) {
          return { label: "Booking.com", className: "booking" };
        }
        const normalized = url.toLowerCase();
        if (normalized.includes("vrbo")) {
          return { label: "Vrbo", className: "vrbo" };
        }
        if (normalized.includes("expedia")) {
          return { label: "Expedia", className: "expedia" };
        }
        return { label: "Booking.com", className: "booking" };
      };
      const getRatingText = (property) => {
        const score = Number(property.ReviewScore);
        const reviews = Number(property.Counts && property.Counts.Reviews);
        if (Number.isFinite(score) && score > 0) {
          const normalized = score > 5 ? score / 2 : score;
          const rating = normalized.toFixed(1);
          if (Number.isFinite(reviews) && reviews > 0) {
            return `${rating} (${reviews} Reviews)`;
          }
          return rating;
        }
        return "New";
      };
      const setStatus = (message) => {
        grid.innerHTML = "";
        const status = document.createElement("p");
        status.className = "resort-grid__status";
        status.textContent = message;
        grid.append(status);
        syncMapHeight();
      };
      const buildCard = (item) => {
        const property = item.Property || {};
        const geo = item.GeoInfo || {};
        const partner = item.Partner || {};
        const propertyId = item.ID ? String(item.ID) : "";

        const article = document.createElement("article");
        article.className = "resort-card";

        const media = document.createElement("div");
        media.className = "resort-media";

        const image = document.createElement("img");
        image.src = buildImageUrl(property.FeatureImage);
        image.alt = property.PropertyName
          ? `${property.PropertyName} property`
          : "Nearby resort";
        media.append(image);

        const priceBadge = document.createElement("span");
        priceBadge.className = "resort-price-badge";
        priceBadge.textContent = formatPrice(property.CachePrice ?? property.Price);
        media.append(priceBadge);

        const actions = document.createElement("div");
        actions.className = "resort-actions";
        actions.setAttribute("aria-label", "Resort quick actions");
        const ecoButton = document.createElement("button");
        ecoButton.type = "button";
        ecoButton.setAttribute("aria-label", "Eco friendly");
        ecoButton.innerHTML = '<i class="fa-solid fa-leaf"></i>';


        const locationButton = document.createElement("button");
        locationButton.type = "button";
        locationButton.setAttribute("aria-label", "View location");
        locationButton.innerHTML = '<i class="fa-solid fa-location-dot"></i>';


        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.setAttribute("aria-label", "Save resort");
        favoriteButton.setAttribute("data-favorite", "true");
        favoriteButton.innerHTML = '<i class="fa-regular fa-heart"></i>';
        if (propertyId) {
          favoriteButton.setAttribute("data-property-id", propertyId);
          setFavoriteButtonState(favoriteButton, favorites.has(propertyId));
        } else {
          favoriteButton.disabled = true;
          favoriteButton.setAttribute("aria-disabled", "true");
        }

        actions.append(ecoButton, locationButton, favoriteButton);
        media.append(actions);

        const body = document.createElement("div");
        body.className = "resort-body";

        const meta = document.createElement("div");
        meta.className = "resort-meta";

        const rating = document.createElement("span");
        rating.innerHTML = `<b>&#9733;</b> ${getRatingText(property)}`;
        const type = document.createElement("span");
        type.textContent = property.PropertyType || "Resort";
        meta.append(rating, type);

        const title = document.createElement("h2");
        title.textContent = property.PropertyName || "Property";

        const amenities = document.createElement("p");
        amenities.textContent = getAmenitiesText(property);

        const location = document.createElement("p");
        location.textContent = getLocationText(geo);

        const footer = document.createElement("footer");
        const brand = getBrand(partner.URL);
        const brandSpan = document.createElement("span");
        brandSpan.className = `brand ${brand.className}`;
        brandSpan.textContent = brand.label;
        const link = document.createElement("a");
        link.href = partner.URL || "#";
        link.textContent = "View Availability";
        footer.append(brandSpan, link);

        body.append(meta, title, amenities, location, footer);
        article.append(media, body);

        return article;
      };
      const renderProperties = (items) => {
        grid.innerHTML = "";
        items.forEach((item) => {
          grid.append(buildCard(item));
        });
        syncMapHeight();
      };
      const fetchProperties = async (sortValue) => {
        const sortParam = getSortParam(sortValue);
        const params = new URLSearchParams();
        params.set("limit", String(getLimit()));
        params.set(sortParam, "true");

        setStatus("Loading properties...");
        try {
          const response = await fetch(`/get-property?${params.toString()}`);
          if (!response.ok) {
            throw new Error("Property request failed");
          }
          const data = await response.json();
          if (!Array.isArray(data) || data.length === 0) {
            setStatus("No properties found.");
            return;
          }
          renderProperties(data);
        } catch (error) {
          console.error("Nearby properties load failed:", error);
          setStatus("Unable to load properties.");
        }
      };

      if (!sortSelect.value) {
        sortSelect.value = "most-popular";
      }
      initMap();
      if (zoomInButton) {
        zoomInButton.addEventListener("click", () => updateMapZoom(1));
      }
      if (zoomOutButton) {
        zoomOutButton.addEventListener("click", () => updateMapZoom(-1));
      }
      window.addEventListener("resize", syncMapHeight);
      fetchProperties(sortSelect.value);
      sortSelect.addEventListener("change", (event) => {
        fetchProperties(event.target.value);
      });
     // Event delegation for favorite buttons.

      grid.addEventListener("click", (event) => {
        const favoriteButton = event.target.closest("[data-favorite]");
        if (!favoriteButton || !grid.contains(favoriteButton)) {
          return;
        }
        const propertyId = favoriteButton.getAttribute("data-property-id");
        if (!propertyId) {
          return;
        }
        const isFavorite = !favorites.has(propertyId);
        if (isFavorite) {
          favorites.add(propertyId);
        } else {
          favorites.delete(propertyId);
        }
        saveFavorites(favorites);
        setFavoriteButtonState(favoriteButton, isFavorite);
      });
    }
  }

  if (!openButtons.length || !modal) {
    return;
  }

  // Gallery modal state, image loading, and URL sync.
  const closeButton = modal.querySelector("[data-gallery-close]");
  const prevButton = modal.querySelector("[data-gallery-prev]");
  const nextButton = modal.querySelector("[data-gallery-next]");
  const scroller = modal.querySelector(".image-modal__scroller");
  const track = modal.querySelector("[data-gallery-track]");
  const totalLabel = modal.querySelector("[data-gallery-total]");
  const counterLabel = modal.querySelector("[data-gallery-counter]");
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const supportsPointer = "PointerEvent" in window;

  let images = [];
  let imagesLoaded = false;
  let currentIndex = 0;
  let lockedScrollY = 0;
  let lastFocusedElement = null;
  let isDragging = false;
  let isHorizontalDrag = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragDeltaX = 0;
  let activePointerId = null;

  const isGalleryPath = (pathname) => {
    const trimmed = pathname.replace(/\/$/, "");
    return trimmed.endsWith("/gallery");
  };

  const getBasePath = (pathname) => {
    const trimmed = pathname.replace(/\/$/, "");
    if (trimmed.endsWith("/gallery")) {
      const base = trimmed.slice(0, -"/gallery".length);
      return base || "/";
    }
    return trimmed || "/";
  };

  const buildGalleryUrl = () => {
    const url = new URL(window.location.href);
    const basePath = getBasePath(url.pathname);
    const normalizedBase = basePath === "/" ? "" : basePath;
    url.pathname = `${normalizedBase}/gallery`;
    return url;
  };

  const buildBaseUrl = () => {
    const url = new URL(window.location.href);
    url.pathname = getBasePath(url.pathname);
    return url;
  };

  const setStatus = (message) => {
    track.innerHTML = "";

    const status = document.createElement("p");
    status.className = "image-modal__status";
    status.textContent = message;
    track.append(status);
  };

  const updateCounts = () => {
    const total = images.length;

    totalLabel.textContent = total === 1 ? "1 photo" : `${total} photos`;
    counterLabel.textContent = total ? `${currentIndex + 1} / ${total}` : "0 / 0";
  };

  const updateSlider = () => {
    const total = images.length;

    if (total) {
      currentIndex = (currentIndex + total) % total;
    } else {
      currentIndex = 0;
    }

    if (mobileQuery.matches && total) {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    } else {
      track.style.transform = "";
    }

    const hasMultipleImages = total > 1;
    prevButton.disabled = !hasMultipleImages;
    nextButton.disabled = !hasMultipleImages;
    updateCounts();
  };

  const goToImage = (index) => {
    currentIndex = index;
    updateSlider();
  };

  const renderImages = () => {
    track.innerHTML = "";

    const fragment = document.createDocumentFragment();

    images.forEach((src, index) => {
      const figure = document.createElement("figure");
      figure.className = "image-modal__figure";

      const image = document.createElement("img");
      image.src = src;
      image.alt = `Property image ${index + 1}`;
      image.draggable = false;
      image.loading = index === 0 ? "eager" : "lazy";

      const caption = document.createElement("figcaption");
      caption.className = "image-modal__caption";
      caption.textContent = `Photo ${index + 1}`;

      figure.append(image, caption);
      fragment.append(figure);
    });

    track.append(fragment);
    updateSlider();
  };

  const loadImages = async () => {
    if (imagesLoaded) {
      return;
    }

    setStatus("Loading photos...");

    try {
      const response = await fetch("/images");

      if (!response.ok) {
        throw new Error("Image request failed");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Image response was not a list");
      }

      images = data
        .filter((src) => typeof src === "string" && src.trim())
        .sort((first, second) =>
          first.localeCompare(second, undefined, {
            numeric: true,
            sensitivity: "base"
          })
        );

      imagesLoaded = true;

      if (!images.length) {
        setStatus("No property images were found.");
        updateSlider();
        return;
      }

      renderImages();
    } catch (error) {
      console.error("Gallery images could not be loaded:", error);
      images = [];
      setStatus("Photos could not be loaded. Please try again later.");
      updateSlider();
    }
  };

  const lockPageScroll = () => {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop;
    document.body.classList.add("gallery-modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockPageScroll = () => {
    document.body.classList.remove("gallery-modal-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedScrollY);
  };

  const openModal = async (options = {}) => {
    if (!modal.hidden) {
      return;
    }

    const { shouldFocus = true } = options;
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    lockPageScroll();
    await loadImages();
    updateSlider();

    if (!modal.hidden && shouldFocus) {
      closeButton.focus({ preventScroll: true });
    }
  };

  const closeModal = () => {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    unlockPageScroll();

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
  };

  // Mobile swipe handling for the gallery slider.
  const beginDrag = (clientX, clientY, pointerId) => {
    if (!mobileQuery.matches || images.length < 2) {
      return false;
    }

    isDragging = true;
    isHorizontalDrag = false;
    dragStartX = clientX;
    dragStartY = clientY;
    dragDeltaX = 0;
    activePointerId = pointerId;
    track.style.transition = "none";
    return true;
  };

  const handleDragMove = (clientX, clientY, event) => {
    if (!isDragging) {
      return;
    }

    dragDeltaX = clientX - dragStartX;
    const dragDeltaY = clientY - dragStartY;

    if (!isHorizontalDrag && Math.abs(dragDeltaX) > 8) {
      isHorizontalDrag = Math.abs(dragDeltaX) > Math.abs(dragDeltaY);
    }

    if (isHorizontalDrag) {
      if (event && event.cancelable) {
        event.preventDefault();
      }
      track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${dragDeltaX}px))`;
    }
  };

  const finishDrag = () => {
    if (!isDragging) {
      return;
    }

    const threshold = Math.max(50, scroller.clientWidth * 0.14);
    track.style.transition = "";

    if (isHorizontalDrag && Math.abs(dragDeltaX) > threshold) {
      goToImage(currentIndex + (dragDeltaX < 0 ? 1 : -1));
    } else {
      updateSlider();
    }

    isDragging = false;
    isHorizontalDrag = false;
    dragDeltaX = 0;
    activePointerId = null;
  };

  const syncModalWithUrl = () => {
    if (isGalleryPath(window.location.pathname)) {
      openModal({ shouldFocus: false });
    } else {
      closeModal();
    }
  };

  const openModalFromButton = () => {
    if (!isGalleryPath(window.location.pathname)) {
      const galleryUrl = buildGalleryUrl();
      history.pushState({ galleryOpen: true }, "", galleryUrl);
    }
    openModal();
  };

  const requestCloseModal = () => {
    if (isGalleryPath(window.location.pathname)) {
      history.back();
      return;
    }

    closeModal();
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", openModalFromButton);
  });

  closeButton.addEventListener("click", requestCloseModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      requestCloseModal();
    }
  });

  prevButton.addEventListener("click", () => {
    goToImage(currentIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    goToImage(currentIndex + 1);
  });

  if (supportsPointer) {
    scroller.addEventListener("pointerdown", (event) => {
      if (!beginDrag(event.clientX, event.clientY, event.pointerId)) {
        return;
      }

      scroller.setPointerCapture(event.pointerId);
    });

    scroller.addEventListener("pointermove", (event) => {
      if (!isDragging || event.pointerId !== activePointerId) {
        return;
      }

      handleDragMove(event.clientX, event.clientY, event);
    });

    scroller.addEventListener("pointerup", finishDrag);
    scroller.addEventListener("pointercancel", finishDrag);
    scroller.addEventListener("lostpointercapture", finishDrag);
  } else {
    scroller.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      beginDrag(touch.clientX, touch.clientY, null);
    });

    scroller.addEventListener(
      "touchmove",
      (event) => {
        if (!isDragging || event.touches.length !== 1) {
          return;
        }

        const touch = event.touches[0];
        handleDragMove(touch.clientX, touch.clientY, event);
      },
      { passive: false }
    );

    scroller.addEventListener("touchend", finishDrag);
    scroller.addEventListener("touchcancel", finishDrag);
  }

  window.addEventListener("resize", updateSlider);

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      requestCloseModal();
    }

    if (event.key === "ArrowLeft") {
      goToImage(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      goToImage(currentIndex + 1);
    }
  });

  window.addEventListener("popstate", syncModalWithUrl);
  syncModalWithUrl();
});
