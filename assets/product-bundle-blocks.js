(function() {
  const bundleSection = document.querySelector('[data-bundle-section]');
  if (!bundleSection) return;

  const filterContainer = bundleSection.querySelector('[data-bundle-filter]');
  const removeFilterBtn = bundleSection.querySelector('[data-filter-remove]');
  const bundleWrappers = bundleSection.querySelectorAll('.product-bundle-block-wrapper');
  const bundleBlocks = bundleSection.querySelectorAll('.product-bundle-block');
  const resultCountEl = bundleSection.querySelector('[data-filter-result-count]');
  
  // Mobile popup elements
  const filterTrigger = bundleSection.querySelector('[data-filter-trigger]');
  const filterPopup = bundleSection.querySelector('[data-filter-popup]');
  const filterPopupOverlay = bundleSection.querySelector('[data-filter-popup-overlay]');
  const filterPopupClose = bundleSection.querySelector('[data-filter-popup-close]');
  const filterPopupOptions = bundleSection.querySelector('[data-filter-popup-options]');
  const filterPopupClear = bundleSection.querySelector('[data-filter-popup-clear]');
  const filterPopupApply = bundleSection.querySelector('[data-filter-popup-apply]');

  let selectedFilters = new Set(['all']);

  // Count products in each bundle
  function countProductsInBundle(filterId) {
    let count = 0;
    bundleBlocks.forEach(block => {
      const blockFilterId = block.getAttribute('data-filter-id');
      if (blockFilterId === filterId) {
        const products = block.querySelectorAll('.product-bundle-card, .product-card-alt');
        count += products.length;
      }
    });
    return count;
  }

  // Check if a bundle has products
  function bundleHasProducts(block) {
    const products = block.querySelectorAll('.product-bundle-card, .product-card-alt');
    return products.length > 0;
  }

  // Hide empty bundles
  function hideEmptyBundles() {
    bundleBlocks.forEach((block, index) => {
      const wrapper = bundleWrappers[index];
      if (!bundleHasProducts(block)) {
        wrapper.style.display = 'none';
        wrapper.setAttribute('data-empty', 'true');
      }
    });
  }

  // Count all products (only from non-empty bundles)
  function countAllProducts() {
    let count = 0;
    bundleBlocks.forEach(block => {
      if (bundleHasProducts(block)) {
        const products = block.querySelectorAll('.product-bundle-card, .product-card-alt');
        count += products.length;
      }
    });
    return count;
  }

  // Update result count display
  function updateResultCount(visibleCount, totalCount) {
    if (resultCountEl) {
      const productText = totalCount !== 1 ? 'products' : 'product';
      resultCountEl.textContent = `Showing ${visibleCount} of ${totalCount}`;
    }
  }

  // Generate filter buttons dynamically from bundle blocks
  function generateFilterButtons() {
    if (!filterContainer) return;

    const filters = new Map(); // Use Map to store unique filters with their titles
    
    // Collect unique filters from bundle blocks (only non-empty bundles)
    bundleBlocks.forEach(block => {
      const filterId = block.getAttribute('data-filter-id');
      const filterTitle = block.getAttribute('data-filter-title');
      
      // Only add filter if bundle has products
      if (filterId && filterTitle && !filters.has(filterId) && bundleHasProducts(block)) {
        filters.set(filterId, filterTitle);
      }
    });

    // Generate desktop filter buttons
    if (filters.size > 0) {
      filters.forEach((title, id) => {
        // Create separator
        const separator = document.createElement('span');
        separator.className = 'bundle-filter__separator';
        separator.textContent = '|';
        
        // Create filter button
        const button = document.createElement('button');
        button.className = 'bundle-filter__item';
        button.setAttribute('data-filter', id);
        button.setAttribute('aria-pressed', 'false');
        button.textContent = title;
        
        // Insert before remove button if it exists, otherwise append
        if (removeFilterBtn) {
          filterContainer.insertBefore(separator, removeFilterBtn);
          filterContainer.insertBefore(button, removeFilterBtn);
        } else {
          filterContainer.appendChild(separator);
          filterContainer.appendChild(button);
        }
      });
    }

    // Generate mobile popup filter options
    if (filterPopupOptions && filters.size > 0) {
      filters.forEach((title, id) => {
        const label = document.createElement('label');
        label.className = 'bundle-filter-popup__option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'filter';
        checkbox.value = id;
        checkbox.setAttribute('data-filter-checkbox', '');
        
        const span = document.createElement('span');
        span.className = 'bundle-filter-popup__option-text';
        span.textContent = title;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        filterPopupOptions.appendChild(label);
      });
    }

    // Initialize result count
    const totalCount = countAllProducts();
    updateResultCount(totalCount, totalCount);

    // Hide filter section if no products or no filters
    if (totalCount === 0 || filters.size === 0) {
      hideFilterSection();
    }
  }

  // Hide the entire filter section
  function hideFilterSection() {
    const filterTriggerEl = bundleSection.querySelector('.product-bundle-blocks__filter-trigger');
    const filterEl = bundleSection.querySelector('.product-bundle-blocks__filter');
    
    if (filterTriggerEl) {
      filterTriggerEl.style.display = 'none';
    }
    if (filterEl) {
      filterEl.style.display = 'none';
    }
  }

  // Initialize filter functionality
  function initFilters() {
    // Desktop: Add click event delegation to filter container
    if (filterContainer) {
      filterContainer.addEventListener('click', function(e) {
        const button = e.target.closest('[data-filter]');
        if (button) {
          const filterValue = button.getAttribute('data-filter');
          applyFilter(filterValue);
          const childProductCards = document.querySelectorAll('.product-bundle-card__hidden')
          const viewMoreContainers = document.querySelectorAll('.product-bundle-block__view-more-container')
          if (filterValue == 'all') {
            childProductCards.forEach(prod => {
              prod.style.display = 'none'
            })
            viewMoreContainers.forEach(btn => {
              btn.style.display = 'flex'
            })
          } else {
            childProductCards.forEach(prod => {
              prod.style.display = 'flex'
            })
            viewMoreContainers.forEach(btn => {
              btn.style.display = 'none'
            })
          }
          updateActiveButton(button);
        }
      });
    }

    //Add view more click event
    const viewMoreButtons = bundleSection.querySelectorAll('.product-bundle-block__view-more')
    if(viewMoreButtons) {
      viewMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const filterValue = e.target.getAttribute('data-filter')
          const childProductCards = document.querySelectorAll('.product-bundle-card__hidden')
          childProductCards.forEach(prod => {
            prod.style.display = 'flex'
          })
          const viewMoreContainers = document.querySelectorAll('.product-bundle-block__view-more-container')
          viewMoreContainers.forEach(btn => {
            btn.style.display = 'none'
          })
          applyFilter(filterValue)
          if(filterContainer) {
            const filterContainerBtn = filterContainer.querySelector(`[data-filter="${filterValue}"]`)
            updateActiveButton(filterContainerBtn)
          }
          const filterCheckBoxes = bundleSection.querySelectorAll('.bundle-filter-popup [data-filter-checkbox]')
          if (filterCheckBoxes)
          filterCheckBoxes.forEach(checkbox => {
            const checkboxFilterValue = checkbox.getAttribute('value')
            if (checkboxFilterValue === 'all') checkbox.checked = false;
            if (checkboxFilterValue === filterValue) checkbox.checked = true;
          })
        })
      })
    }

    // Add click event to remove filter button
    if (removeFilterBtn) {
      removeFilterBtn.addEventListener('click', function() {
        resetFilters();
      });
    }

    // Mobile: Popup functionality
    if (filterTrigger) {
      filterTrigger.addEventListener('click', openPopup);
    }

    if (filterPopupClose) {
      filterPopupClose.addEventListener('click', closePopup);
    }

    if (filterPopupOverlay) {
      filterPopupOverlay.addEventListener('click', closePopup);
    }

    if (filterPopupClear) {
      filterPopupClear.addEventListener('click', clearPopupFilters);
    }

    if (filterPopupApply) {
      filterPopupApply.addEventListener('click', applyPopupFilters);
    }

    // Handle checkbox changes in popup
    if (filterPopupOptions) {
      filterPopupOptions.addEventListener('change', handlePopupCheckboxChange);
    }
  }

  // Mobile popup functions
  function openPopup() {
    if (filterPopup) {
      filterPopup.classList.add('bundle-filter-popup--active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closePopup() {
    if (filterPopup) {
      filterPopup.classList.remove('bundle-filter-popup--active');
      document.body.style.overflow = '';
    }
  }

  function handlePopupCheckboxChange(e) {
    const checkbox = e.target;
    if (!checkbox.matches('[data-filter-checkbox]')) return;

    const allCheckbox = filterPopupOptions.querySelector('[value="all"]');
    
    if (checkbox.value === 'all') {
      // If "View All" is checked, uncheck all others
      if (checkbox.checked) {
        const otherCheckboxes = filterPopupOptions.querySelectorAll('[data-filter-checkbox]:not([value="all"])');
        otherCheckboxes.forEach(cb => cb.checked = false);
      }
    } else {
      // If any other checkbox is checked, uncheck "View All"
      if (checkbox.checked && allCheckbox) {
        allCheckbox.checked = false;
      }
      
      // If no checkboxes are checked, check "View All"
      const anyChecked = Array.from(filterPopupOptions.querySelectorAll('[data-filter-checkbox]:not([value="all"])')).some(cb => cb.checked);
      if (!anyChecked && allCheckbox) {
        allCheckbox.checked = true;
      }
    }
  }

  function clearPopupFilters() {
    const allCheckbox = filterPopupOptions.querySelector('[value="all"]');
    const otherCheckboxes = filterPopupOptions.querySelectorAll('[data-filter-checkbox]:not([value="all"])');
    
    if (allCheckbox) allCheckbox.checked = true;
    otherCheckboxes.forEach(cb => cb.checked = false);
  }

  function applyPopupFilters() {
    const checkboxes = filterPopupOptions.querySelectorAll('[data-filter-checkbox]:checked');
    const checkedValues = Array.from(checkboxes).map(cb => cb.value);
    
    if (checkedValues.includes('all') || checkedValues.length === 0) {
      applyFilter('all');
      const childProductCards = document.querySelectorAll('.product-bundle-card__hidden')
      childProductCards.forEach(prod => {
        prod.style.display = 'none'
      })
      const viewMoreContainers = document.querySelectorAll('.product-bundle-block__view-more-container')
      viewMoreContainers.forEach(btn => {
        btn.style.display = 'flex'
      })
    } else {
      applyMultipleFilters(checkedValues);
      const childProductCards = document.querySelectorAll('.product-bundle-card__hidden')
      childProductCards.forEach(prod => {
        prod.style.display = 'flex'
      })
      const viewMoreContainers = document.querySelectorAll('.product-bundle-block__view-more-container')
      viewMoreContainers.forEach(btn => {
        btn.style.display = 'none'
      })
    }
    
    closePopup();
  }

  // Apply filter to show/hide bundles
  function applyFilter(filterValue) {
    let visibleProductCount = 0;
    const totalCount = countAllProducts();

    if (filterValue === 'all') {
      // Show all bundles
      bundleWrappers.forEach(wrapper => {
        wrapper.classList.remove('bundle-hidden');
      });
      
      visibleProductCount = totalCount;
      
      // Hide remove filter button
      if (removeFilterBtn) {
        removeFilterBtn.style.display = 'none';
      }
    } else {
      // Filter bundles based on filter-id
      bundleBlocks.forEach((block, index) => {
        const blockFilterId = block.getAttribute('data-filter-id');
        const wrapper = bundleWrappers[index];
        
        if (blockFilterId === filterValue) {
          wrapper.classList.remove('bundle-hidden');
          const products = block.querySelectorAll('.product-bundle-card, .product-card-alt');
          visibleProductCount += products.length;
        } else {
          wrapper.classList.add('bundle-hidden');
        }
      });

      // Show remove filter button
      if (removeFilterBtn) {
        removeFilterBtn.style.display = 'block';
      }
    }

    // Update result count
    updateResultCount(visibleProductCount, totalCount);
  }

  // Apply multiple filters (for mobile popup)
  function applyMultipleFilters(filterValues) {
    let visibleProductCount = 0;
    const totalCount = countAllProducts();

    bundleBlocks.forEach((block, index) => {
      const blockFilterId = block.getAttribute('data-filter-id');
      const wrapper = bundleWrappers[index];
      
      if (filterValues.includes(blockFilterId)) {
        wrapper.classList.remove('bundle-hidden');
        const products = block.querySelectorAll('.product-bundle-card, .product-card-alt');
        visibleProductCount += products.length;
      } else {
        wrapper.classList.add('bundle-hidden');
      }
    });

    // Show remove filter button
    if (removeFilterBtn) {
      removeFilterBtn.style.display = 'block';
    }

    // Update result count
    updateResultCount(visibleProductCount, totalCount);
  }

  // Update active state of filter buttons
  function updateActiveButton(activeButton) {
    const allButtons = filterContainer.querySelectorAll('[data-filter]');
    allButtons.forEach(button => {
      button.classList.remove('bundle-filter__item--active');
      button.setAttribute('aria-pressed', 'false');
    });

    activeButton.classList.add('bundle-filter__item--active');
    activeButton.setAttribute('aria-pressed', 'true');
  }

  // Reset filters to show all
  function resetFilters() {
    const allButton = bundleSection.querySelector('[data-filter="all"]');
    if (allButton) {
      applyFilter('all');
      const childProductCards = document.querySelectorAll('.product-bundle-card__hidden')
      childProductCards.forEach(prod => {
        prod.style.display = 'none'
      })
      const viewMoreContainers = document.querySelectorAll('.product-bundle-block__view-more-container')
      viewMoreContainers.forEach(btn => {
        btn.style.display = 'flex'
      })
      updateActiveButton(allButton);
    }
  }

  // Initialize on load
  hideEmptyBundles();
  generateFilterButtons();
  initFilters();
})();
