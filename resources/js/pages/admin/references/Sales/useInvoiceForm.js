import { onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue';

/**
 * Focus an element and scroll it into view
 * @param {string} selector - CSS selector for the element
 */
export function focusElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Navigate to a specific cell in the items grid
 * @param {number} index - Row index
 * @param {string} field - Field name (quantity, rate, discount)
 * @param {number} itemsLength - Total number of items
 */
export function navigateTo(index, field, itemsLength) {
    if (index >= 0 && index < itemsLength) {
        focusElement(`#input-${index}-${field} input`);
    } else {
        focusElement(index < 0 ? '#search-product' : '#invoice-discount input');
    }
}

/**
 * Create keyboard navigation handlers for invoice forms
 * @param {Object} options - Configuration options
 * @param {Function} options.onSave - Callback when Ctrl+Enter is pressed
 * @param {number} options.itemsLength - Number of items in the form
 * @returns {Object} - Navigation functions and event handlers
 */
export function useKeyboardNavigation(options = {}) {
    const { onSave = () => { }, itemsLength = () => 0 } = options;

    const handleKeydown = (event) => {
        // Ctrl+Enter to save
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            onSave();
        }
        // / to focus search
        if (event.key === '/') {
            focusElement('#search-product');
        }
        // Shift+Enter to focus discount
        if (event.shiftKey && event.key === 'Enter') {
            event.preventDefault();
            focusElement('#invoice-discount input');
        }
    };

    const navigateToCell = (index, field) => {
        const length = typeof itemsLength === 'function' ? itemsLength() : itemsLength;
        navigateTo(index, field, length);
    };

    const goToProductArea = (currentLength) => {
        nextTick(() => focusElement(`#input-${currentLength - 1}-quantity input`));
    };

    const setupListeners = () => {
        document.addEventListener('keydown', handleKeydown);
    };

    const removeListeners = () => {
        document.removeEventListener('keydown', handleKeydown);
    };

    return {
        handleKeydown,
        navigateToCell,
        goToProductArea,
        setupListeners,
        removeListeners,
        focusElement,
    };
}

/**
 * Setup item calculations (subtotals, grand total, etc.)
 * @param {Object} form - Inertia form object
 * @param {string} itemsKey - Key for items array in form (e.g., 'sales_items', 'return_items')
 * @param {Object} options - Additional options
 * @param {boolean} options.hasPayment - Whether form has payment fields
 * @returns {Object} - Computed values and update function
 */
export function useItemCalculations(form, itemsKey, options = {}) {
    const { hasPayment = true } = options;

    const updateSubtotals = () => {
        form[itemsKey].forEach(item => {
            const discount = isNaN(item.discount) ? 0 : parseFloat(item.discount) / 100;
            item.sub_total = (item.unit_price * item.quantity * (1 - discount)).toFixed(2);
        });
    };

    // Setup watcher for items
    watch(() => form[itemsKey], updateSubtotals, { deep: true });

    // Setup computed totals
    form.sub_total = computed(() =>
        form[itemsKey].reduce((acc, item) => acc + parseFloat(item.sub_total || 0), 0).toFixed(2)
    );

    form.grand_total = computed(() => {
        const { sub_total, discount, extra_fees } = form;
        return (parseFloat(sub_total) + parseFloat(extra_fees || 0) - parseFloat(discount || 0)).toFixed(2);
    });

    if (hasPayment) {
        form.due_amount = computed(() =>
            (parseFloat(form.grand_total) - parseFloat(form.paid_amount || 0)).toFixed(2)
        );
    }

    return {
        updateSubtotals,
    };
}

/**
 * Create a product item for invoice
 * @param {Object} product - Product data
 * @param {string} priceField - Which price field to use ('sales_price' or 'purchase_price')
 * @returns {Object} - Item object ready for form
 */
export function createInvoiceItem(product, priceField = 'sales_price') {
    return {
        product_id: product.id,
        title: product.title,
        unit_price: parseFloat(product[priceField]),
        quantity: 1,
        stock: product.stock,
        unit: product.unit,
        discount: parseFloat(product.discount || 0),
        sub_total: parseFloat(product[priceField]),
    };
}

/**
 * Full composable for invoice form setup
 * @param {Object} form - Inertia form object
 * @param {Object} options - Configuration
 * @param {string} options.itemsKey - Key for items array
 * @param {boolean} options.hasPayment - Whether form has payment section
 * @param {Function} options.onSave - Save callback
 * @param {string} options.priceField - Price field to use for items
 * @returns {Object} - All functions and computed values
 */
export function useInvoiceForm(form, options = {}) {
    const {
        itemsKey = 'items',
        hasPayment = true,
        onSave = () => { },
        priceField = 'sales_price',
    } = options;

    // Setup keyboard navigation
    const keyboard = useKeyboardNavigation({
        onSave,
        itemsLength: () => form[itemsKey].length,
    });

    // Setup calculations
    const calculations = useItemCalculations(form, itemsKey, { hasPayment });

    // Add product to invoice (no limit)
    const addProductToInvoice = (product) => {
        const item = createInvoiceItem(product, priceField);
        form[itemsKey].push(item);
        keyboard.goToProductArea(form[itemsKey].length);
    };

    // Remove item from invoice
    const removeItem = (index) => {
        form[itemsKey].splice(index, 1);
    };

    // Lifecycle hooks
    onMounted(() => {
        // Focus the customer/supplier combobox on mount
        const initialFocus = document.querySelector('#customer-select') || document.querySelector('#supplier-select');
        if (initialFocus) {
            initialFocus.focus();
        }
        keyboard.setupListeners();
    });

    onBeforeUnmount(() => {
        keyboard.removeListeners();
    });

    return {
        // Keyboard navigation
        focusElement: keyboard.focusElement,
        navigateTo: keyboard.navigateToCell,
        goToProductArea: keyboard.goToProductArea,

        // Item management
        addProductToInvoice,
        removeItem,

        // Calculations
        updateSubtotals: calculations.updateSubtotals,
    };
}
