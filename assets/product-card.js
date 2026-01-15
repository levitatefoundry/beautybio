document.addEventListener('DOMContentLoaded', function() {
  const detailsButtons = document.querySelectorAll('.product-bundle-card__button--details');
  
  detailsButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const productHandle = this.getAttribute('data-product-handle');
      
      if (!productHandle) return;
      
      try {
        // Show loading state
        const loadingPopup = createLoadingPopup();
        document.body.appendChild(loadingPopup);
        
        // Fetch product data from Shopify API
        const response = await fetch(`/products/${productHandle}.js`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        
        // Remove loading popup
        loadingPopup.remove();
        
        // Create and show product popup
        const popup = createProductPopup(productData);
        document.body.appendChild(popup);
        
        // Show popup with animation
        requestAnimationFrame(() => {
          popup.classList.add('active');
        });
        
      } catch (error) {
        console.error('Error fetching product details:', error);
        const loadingPopup = document.querySelector('.product-details-popup--loading');
        if (loadingPopup) loadingPopup.remove();
      }
    });
  });
});

function createLoadingPopup() {
  const popup = document.createElement('div');
  popup.className = 'product-details-popup product-details-popup--loading active';
  popup.innerHTML = `
    <div class="product-details-popup__overlay"></div>
    <div class="product-details-popup__content">
      <div class="product-details-popup__loader">
        <div class="spinner"></div>
      </div>
    </div>
  `;
  return popup;
}

function createProductPopup(product) {
  // Create popup container
  const popup = document.createElement('div');
  popup.className = 'product-details-popup';
  popup.setAttribute('data-product-id', product.id);
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'product-details-popup__overlay';
  
  // Create popup content container
  const popupContent = document.createElement('div');
  popupContent.className = 'product-details-popup__content';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'product-details-popup__close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close popup');
  
  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'product-details-popup__body';
  
  // Build product content
  contentWrapper.innerHTML = buildProductHTML(product);
  
  // Assemble popup structure
  popupContent.appendChild(closeButton);
  popupContent.appendChild(contentWrapper);
  popup.appendChild(overlay);
  popup.appendChild(popupContent);
  
  // Add close functionality
  const closePopup = () => {
    popup.classList.remove('active');
    setTimeout(() => {
      popup.remove();
    }, 300);
  };
  
  closeButton.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);
  
  // Close on ESC key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closePopup();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Initialize product functionality after popup is created
  setTimeout(() => {
    initializeProductScripts(popup, product);
  }, 50);
  
  return popup;
}

function buildProductHTML(product) {
  const currentVariant = product.variants[0];
  const hasMultipleImages = product.images.length > 1;
  
  // Build image gallery
  let imageGalleryHTML = '';
  if (product.images.length > 0) {
    imageGalleryHTML = `
      <div class="product-popup__gallery">
        <div class="product-popup__main-image">
          <img src="${product.featured_image}" alt="${product.title}" id="popup-main-image">
        </div>
        ${hasMultipleImages ? `
          <div class="product-popup__thumbnails">
            ${product.images.map((img, index) => `
              <button type="button" class="product-popup__thumbnail ${index === 0 ? 'active' : ''}" data-image-url="${img}">
                <img src="${img}" alt="${product.title}">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // Build variant options
  let variantOptionsHTML = '';

  if (product.options && product.options.length > 0 && product.options[0].name !== 'Title') {
    variantOptionsHTML = product.options.map((option, optionIndex) => {
      const optionValues = [...new Set(product.variants.map(v => v.options[optionIndex]))];
      
      return `
        <div class="product-popup__option">
          <label class="product-popup__option-label">${option.name}</label>
          <div class="product-popup__option-values">
            ${optionValues.map(value => `
              <button type="button" class="product-popup__option-value" data-option-index="${optionIndex}" data-option-value="${value}">
                ${value}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Build product HTML
  return `
    <div class="product-popup__container">
      <div class="product-popup__media">
        ${imageGalleryHTML}
      </div>
      <div class="product-popup__details">
        <h2 class="product-popup__title">${product.title}</h2>
        
        <div class="product-popup__price" id="popup-price">
          ${currentVariant.compare_at_price && currentVariant.compare_at_price > currentVariant.price ? `
            <span class="product-popup__price--sale">${formatMoney(currentVariant.price)}</span>
            <span class="product-popup__price--compare">${formatMoney(currentVariant.compare_at_price)}</span>
          ` : `
            <span class="product-popup__price--regular">${formatMoney(currentVariant.price)}</span>
          `}
        </div>
        
        ${product.description ? `
          <div class="product-popup__description">
            ${product.description}
          </div>
        ` : ''}
        
        <a href="/products/${product.handle}" class="product-popup__full-details-link">
          See Full Product Details →
        </a>
        
        <form class="product-popup__form" id="popup-product-form">
          ${variantOptionsHTML}
          
          <input type="hidden" name="id" value="${currentVariant.id}" id="popup-variant-id">
          
          <div class="product-popup__quantity">
            <label class="product-popup__quantity-label">Quantity</label>
            <div class="product-popup__quantity-selector">
              <button type="button" class="product-popup__quantity-button product-popup__quantity-button--minus">-</button>
              <input type="number" name="quantity" value="1" min="1" class="product-popup__quantity-input" id="popup-quantity">
              <button type="button" class="product-popup__quantity-button product-popup__quantity-button--plus">+</button>
            </div>
          </div>
          
          <button type="submit" class="product-popup__add-to-cart" id="popup-add-to-cart" ${!currentVariant.available ? 'disabled' : ''}>
            ${currentVariant.available ? 'ADD TO BAG' : 'SOLD OUT'}
          </button>
        </form>
      </div>
    </div>
  `;
}

function initializeProductScripts(popup, product) {
  const form = popup.querySelector('#popup-product-form');
  const variantIdInput = popup.querySelector('#popup-variant-id');
  const priceContainer = popup.querySelector('#popup-price');
  const addToCartButton = popup.querySelector('#popup-add-to-cart');
  const quantityInput = popup.querySelector('#popup-quantity');
  const mainImage = popup.querySelector('#popup-main-image');
  
  // Initialize variant selection
  const optionButtons = popup.querySelectorAll('.product-popup__option-value');
  const selectedOptions = product.variants[0].options.slice();
  
  // Set initial active state
  optionButtons.forEach(button => {
    const optionIndex = parseInt(button.getAttribute('data-option-index'));
    const optionValue = button.getAttribute('data-option-value');
    if (selectedOptions[optionIndex] === optionValue) {
      button.classList.add('active');
    }
  });
  
  optionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const optionIndex = parseInt(this.getAttribute('data-option-index'));
      const optionValue = this.getAttribute('data-option-value');
      
      // Update selected options
      selectedOptions[optionIndex] = optionValue;
      
      // Update active state for this option group
      popup.querySelectorAll(`[data-option-index="${optionIndex}"]`).forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Find matching variant
      const matchingVariant = product.variants.find(variant => {
        return variant.options.every((opt, idx) => opt === selectedOptions[idx]);
      });
      
      if (matchingVariant) {
        updateVariant(matchingVariant);
      }
    });
  });
  
  function updateVariant(variant) {
    // Update hidden input
    variantIdInput.value = variant.id;
    
    // Update price
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      priceContainer.innerHTML = `
        <span class="product-popup__price--sale">${formatMoney(variant.price)}</span>
        <span class="product-popup__price--compare">${formatMoney(variant.compare_at_price)}</span>
      `;
    } else {
      priceContainer.innerHTML = `
        <span class="product-popup__price--regular">${formatMoney(variant.price)}</span>
      `;
    }
    
    // Update add to cart button
    if (variant.available) {
      addToCartButton.disabled = false;
      addToCartButton.textContent = 'ADD TO BAG';
    } else {
      addToCartButton.disabled = true;
      addToCartButton.textContent = 'SOLD OUT';
    }
    
    // Update main image if variant has featured image
    if (variant.featured_image && mainImage) {
      mainImage.src = variant.featured_image.src;
    }
  }
  
  // Initialize quantity buttons
  const minusButton = popup.querySelector('.product-popup__quantity-button--minus');
  const plusButton = popup.querySelector('.product-popup__quantity-button--plus');
  
  if (minusButton) {
    minusButton.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  }
  
  if (plusButton) {
    plusButton.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
  }
  
  // Initialize thumbnail gallery
  const thumbnails = popup.querySelectorAll('.product-popup__thumbnail');
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', function() {
      const imageUrl = this.getAttribute('data-image-url');
      if (mainImage) {
        mainImage.src = imageUrl;
      }
      
      // Update active state
      thumbnails.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    
    // Disable button during submission
    addToCartButton.disabled = true;
    addToCartButton.textContent = 'ADDING...';
    
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('Product added to cart:', data);
      
      // Trigger cart update event
      document.dispatchEvent(new CustomEvent('cart:updated'));
      
      // Update cart if theme has cart functionality
      if (typeof window.theme !== 'undefined' && window.theme.cart) {
        window.theme.cart.refresh();
      }
      
      // Show success state
      addToCartButton.textContent = 'ADDED!';
      
      // Close popup after short delay
      setTimeout(() => {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
      }, 1000);
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      addToCartButton.disabled = false;
      addToCartButton.textContent = 'ADD TO BAG';
      alert('Error adding product to cart. Please try again.');
    });
  });
}

function formatMoney(cents) {
  if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
    return Shopify.formatMoney(cents);
  }
  // Fallback formatting
  return '$' + (cents / 100).toFixed(2);
}