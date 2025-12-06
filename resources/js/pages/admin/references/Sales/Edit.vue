<template>

    <Head title="Edit Sale - Lavloss" />
    <div
        class="tw-border-white tw-bg-white/50 tw-shadow-gray-50 tw-shadow-sm tw-p-3 tw-border tw-rounded-none tw-min-w-[600px]">
        <!-- Header -->
        <div
            class="tw-flex print:tw-flex-row sm:tw-flex-row tw-flex-col-reverse tw-justify-between tw-gap-5 tw-bg-gradient-to-bl tw-from-amber-400 tw-via-yellow-300 tw-to-amber-300 tw-p-3 tw-min-h-32">
            <!-- First Column -->
            <div
                class="tw-space-y-2 tw-bg-amber-100/60 tw-p-2 tw-pt-3 tw-pr-5 sm:tw-w-1/3 tw-text-center sm:tw-text-left">
                <div class="tw-border-white/80 tw-bg-gray-100/30 tw-p-2 tw-border tw-font-semibold tw-leading-5">
                    MEMO: {{ form.bill_no }}
                </div>
                <div
                    class="tw-border-white/80 tw-bg-gray-100/70 tw-p-2 tw-border tw-font-semibold tw-capitalize tw-leading-5">
                    Customer: {{ customer.name }}
                </div>
            </div>
            <!-- Second Column -->
            <div class="sm:tw-text-right tw-bg-amber-100/60 tw-p-2 sm:tw-w-1/3 tw-text-center">
                <div class="tw-inline-flex tw-items-baseline tw-font-normal tw-text-sm">
                    <span class="tw-mr-2">{{ form.sale_date }}</span>
                    <span class="fa fa-calendar"></span>
                </div>
                <h2 class="sm:tw-text-right -tw-mt-1.5 tw-font-light tw-text-amber-900">
                    Current Due <span class="tw-font-bold tw-text-4xl"><br>{{ customer.total_due }}</span>
                </h2>
            </div>
            <!-- Third Column - Customer Details -->
            <div class="sm:tw-text-right tw-bg-amber-100/60 tw-p-2 sm:tw-w-1/3 tw-text-center">
                <template v-if="customer">
                    <div class="tw-font-light tw-text-sm">Customer Details</div>
                    <h3 class="tw-font-semibold tw-text-xl tw-truncate tw-capitalize">{{ customer.name }}</h3>
                    <p>{{ customer.address }}<br>Phone: {{ customer.phone }}</p>
                </template>
            </div>
        </div>
        <!-- Header END-->
        <div class="tw-flex tw-items-center tw-gap-x-3">
            <div class="tw-flex tw-items-center tw-w-2/3">
                <ProductSearch @product-selected="addProductToInvoice" @goto-products-area="goToProductArea" />
                <Link as="button" href="#"
                    class="tw-flex tw-justify-center tw-items-center tw-border-emerald-400 tw-bg-emerald-400 hover:tw-bg-emerald-500 tw-shadow tw-my-3 tw-px-2.5 tw-border tw-h-12 tw-w-16 tw-text-white tw-text-xl">
                +
                </Link>
                <div v-if="errors.sales_items" class="tw-pl-2 tw-text-error">{{ errors.sales_items }}</div>
            </div>
            <div class="tw-flex tw-justify-center tw-items-center tw-bg-amber-400 tw-h-12 tw-w-1/3">
                {{ }}
            </div>
        </div>

        <!-- Testing new layout -->
        <div class="tw-gap-0.5 tw-grid tw-grid-cols-[32px_1fr_90px_90px_90px_90px_30px]">
            <!-- Header (sticky) -->
            <div class="tw-h-8 tw-text-center __thead">SL</div>
            <div class="tw-justify-start tw-pl-3 tw-h-8 tw-min-w-28 tw-truncate __thead">
                Product Name
            </div>
            <div class="tw-h-8 tw-text-center __thead">QTY</div>
            <div class="tw-h-8 tw-text-center __thead">RATE</div>
            <div class="tw-h-8 tw-text-center __thead">DISC</div>
            <div class="tw-h-8 tw-text-center __thead">TOTAL</div>
            <div class="tw-h-8 tw-text-center __thead">
                <Icon icon="delete" class="tw-size-4 tw-stroke-white" />
            </div>
            <!-- End of Header -->

            <!-- Child grid rows -->
            <div
                class="tw-place-content-start tw-gap-y-0.5 tw-grid tw-grid-cols-subgrid tw-col-span-full tw-bg-slate-400 tw-h-[calc(36px*6)] tw-scrollbar-thin tw-scrollbar-track-emerald-700 tw-overflow-x-hidden tw-overflow-y-auto">
                <template v-for="(product, index) in form.sales_items" :key="product.id">
                    <div class="tw-h-8 __tbody">{{ index + 1 }}</div>
                    <div class="tw-justify-start tw-pl-3 tw-h-8 tw-truncate tw-uppercase __tbody">
                        {{ product.title }}
                    </div>
                    <div class="tw-h-8 __tbody">
                        <CurrencyInput classes="tw-input-sm tw-h-8" v-model="product.quantity"
                            :id="`input-${index}-quantity`" @keydown.up.prevent="navigateTo(index - 1, 'quantity')"
                            @keydown.down.prevent="navigateTo(index + 1, 'quantity')"
                            @keydown.enter.prevent="navigateTo(index, 'rate')"
                            @keydown.right.prevent="navigateTo(index, 'rate')" />
                    </div>
                    <div class="tw-h-8 __tbody">
                        <CurrencyInput classes="tw-input-sm tw-h-8" v-model="product.unit_price"
                            :id="`input-${index}-rate`" @keydown.up.prevent="navigateTo(index - 1, 'rate')"
                            @keydown.down.prevent="navigateTo(index + 1, 'rate')"
                            @keydown.left.prevent="navigateTo(index, 'quantity')"
                            @keydown.right.prevent="navigateTo(index, 'discount')"
                            @keydown.enter.prevent="navigateTo(index, 'discount')" />
                    </div>
                    <div class="tw-h-8 __tbody">
                        <CurrencyInput classes="tw-input-sm tw-h-8" v-model="product.discount"
                            :id="`input-${index}-discount`" @keydown.up.prevent="navigateTo(index - 1, 'discount')"
                            @keydown.down.prevent="navigateTo(index + 1, 'discount')"
                            @keydown.left.prevent="navigateTo(index, 'rate')"
                            @keydown.enter.prevent="focusElement('#search-product')" />
                    </div>
                    <div class="tw-h-8 __tbody">
                        <CurrencyInput classes="tw-input-sm tw-h-8" v-model="product.sub_total" :disabled="true" />
                    </div>
                    <div class="tw-h-8 __tbody">
                        <button type="button"
                            class="tw-place-items-center tw-grid focus:tw-bg-danger/60 tw-h-8 tw-outline-none tw-w-full focus:tw-outline-offset-0 focus:tw-outline-red-900"
                            @click="removeItem(index)">
                            <Icon icon="delete" class="tw-size-4 tw-stroke-red-950" />
                        </button>
                    </div>
                </template>
            </div>
            <!-- End of Child grid rows -->

            <!-- Sub Grid Row -->
            <div
                class="tw-place-content-end tw-gap-0.5 tw-grid tw-grid-cols-subgrid tw-col-span-3 tw-row-span-6 tw-bg-gray-100">
                <!-- Subgrid items using parent's columns -->
                <div v-show="form.paid_amount > 0"
                    class="tw-gap-3 tw-grid tw-grid-cols-2 tw-col-span-full md:tw-col-span-2 tw-row-span-2 tw-p-2">

                    <!-- Payment Methods -->
                    <PaymentMethods class="tw-w-full" :payment_types="payment_types"
                        v-model:paymentType="form.payment_type" :disabled="true" />

                    <div v-if="form.payment_type?.ref_name" class="tw-form-control">
                        <label class="tw-mb-0 tw-pt-0 tw-label">
                            <span class="tw-label-text tw-font-normal tw-text-sm">{{ form.payment_type?.ref_name
                            }}</span>
                        </label>
                        <input type="text" v-model="form.payment_ref"
                            class="focus-within:tw-border-emerald-500 tw-input-bordered tw-rounded-none tw-h-9 tw-input focus-within:tw-outline-offset-0 focus-within:tw-outline-emerald-500"
                            required />
                    </div>

                    <!-- END: Payment Methods -->

                </div>
                <div class="tw-col-span-full md:tw-col-span-2 tw-row-span-4 tw-p-2">
                    <label class="tw-form-control tw-mb-3">
                        <div class="tw-label">
                            <span class="tw-label-text tw-font-normal tw-text-sm">Notes</span>
                        </div>
                        <textarea v-model="form.sale_note"
                            class="focus-within:tw-border-emerald-500 tw-textarea-bordered tw-rounded-none tw-h-12 tw-textarea focus:tw-outline-offset-0 focus-within:tw-outline-emerald-500"
                            placeholder="Labour Fee"></textarea>
                    </label>
                </div>
            </div>


            <div class="tw-gap-0.5 tw-grid tw-grid-cols-subgrid tw-col-span-4 tw-row-span-6">
                <!-- Total -->
                <div class="__tfoot_sum_type">Total</div>
                <div class="__tfoot_sum_amount">
                    <CurrencyInput classes="tw-h-8 tw-content-center tw-font-black" v-model="form.sub_total"
                        :disabled="true" />
                </div>
                <div class="tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-h-8 tw-text-xs">BDT</div>

                <!-- Discount -->
                <div class="__tfoot_sum_type">Discount</div>
                <div class="__tfoot_sum_amount">
                    <CurrencyInput id="invoice-discount" v-model.number="form.discount"
                        @keydown.up.prevent="focusElement('#search-product')"
                        @keydown.down.prevent="focusElement('#extra-fees input')"
                        @keydown.enter.prevent="focusElement('#extra-fees input')"
                        classes="tw-h-8 tw-content-center tw-font-black" />
                </div>
                <div class="tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-h-8 tw-text-xs">BDT</div>

                <!-- Extra Fees -->
                <div class="__tfoot_sum_type">Extra Fees</div>
                <div class="__tfoot_sum_amount">
                    <CurrencyInput id="extra-fees" v-model.number="form.extra_fees"
                        @keydown.up.prevent="focusElement('#invoice-discount input')"
                        @keydown.down.prevent="focusElement('#paid-amount input')"
                        @keydown.enter.prevent="focusElement('#paid-amount input')"
                        classes="tw-h-8 tw-content-center tw-font-black" />
                </div>
                <div class="tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-h-8 tw-text-xs">BDT</div>

                <!-- Grand Total -->
                <div class="__tfoot_sum_type">Grand Total</div>
                <div class="__tfoot_sum_amount">
                    <CurrencyInput v-model.number="form.grand_total" :disabled="true"
                        classes="tw-h-8 tw-content-center tw-font-black" />
                </div>
                <div class="tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-h-8 tw-text-xs">BDT</div>


                <!-- Paid Amount -->
                <div class="__tfoot_sum_type">Paid Amount</div>
                <div class="__tfoot_sum_amount">
                    <CurrencyInput id="paid-amount" v-model.number="form.paid_amount" :disabled="true"
                        classes="tw-h-8 tw-content-center tw-font-black"
                        @keydown.up.prevent="focusElement('#extra-fees input')"
                        @keydown.enter.prevent="focusElement('#save-button')"
                        @keydown.down.prevent="focusElement('#save-button')" />
                </div>
                <div class="tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-h-8 tw-text-xs">BDT</div>



                <!-- Grand Total -->
                <div class="__tfoot_sum_type">Invoice Due</div>
                <div class="__tfoot_sum_amount">
                    <CurrencyInput v-model.number="form.due_amount" :disabled="true"
                        classes="tw-h-8 tw-content-center tw-font-black" />
                </div>
                <div class="tw-flex tw-justify-center tw-items-center tw-bg-gray-100 tw-h-8 tw-text-xs">BDT</div>


            </div>
            <!-- End of Sub Grid Row -->
        </div>
        <!-- Testing new layout -->

        <!-- Action buttons -->
        <div class="tw-gap-1 tw-grid tw-grid-cols-[1fr_310px] tw-mt-3">

            <div class="xl:tw-flex tw-flex-wrap tw-items-center tw-gap-x-5 tw-hidden">
                <div>
                    Search: <kbd>/</kbd>
                </div>
                <div>
                    Discount: <kbd class="">shift</kbd> + <kbd>/</kbd>
                </div>
                <div>
                    Save: <kbd>ctrl</kbd> + <kbd>Enter</kbd>
                </div>
            </div>

            <div
                class="tw-flex tw-flex-wrap tw-justify-between tw-gap-x-2 tw-col-span-2 sm:tw-col-span-1 sm:tw-col-start-2 tw-max-w-full">
                <Link :href="route('admin.sales.index')" as="button" tabindex="0"
                    class="tw-flex-1 tw-bg-slate-300 tw-px-8 tw-py-2 tw-dash-ring tw-min-w-fit tw-font-semibold tw-text-black tw-uppercase">
                Cancel
                </Link>
                <button :disabled="form.processing || !form.sales_items.length" id="save-button" type="button"
                    @click.prevent="saveInvoice" @keydown.up.prevent="focusElement('#paid-amount input')"
                    class="tw-flex-1 tw-bg-secondary tw-px-8 tw-py-2 tw-dash-ring tw-grow tw-min-w-fit tw-font-semibold tw-text-white tw-uppercase">
                    Save Invoice
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Head, useForm, Link } from '@inertiajs/vue3';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import CurrencyInput from '@/Shared/CurrencyInput.vue';
// import dayjs from 'dayjs';
import ProductSearch from '@/Components/ProductSearch.vue';
import Icon from '@/Shared/Icon.vue';
import PaymentMethods from '@/Components/PaymentMethods.vue';

const props = defineProps({
    sale: Object,
    customers: Array,
    payment_types: Array,
    errors: Object,
});

const form = useForm({
    id: props.sale.id,
    bill_no: props.sale.bill_no,
    // sale_date: dayjs(props.sale.sale_date).format('MMM DD, YYYY'),
    customer_id: props.sale.customer_id,
    payment_type_id: props.sale.payment_type_id,
    payment_type: null,
    payment_ref: null,
    sub_total: props.sale.sub_total,
    discount: props.sale.discount,
    extra_fees: props.sale.extra_fees,
    grand_total: props.sale.grand_total,
    paid_amount: props.sale.paid_amount,
    due_amount: props.sale.due_amount,
    sale_note: props.sale.sale_note,
    sales_items: props.sale.sales_items,
});

const handleKeydown = (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
        saveInvoice();
    }
    if (event.key === '/') {
        focusElement('#search-product');
    }
    if (event.shiftKey && event.key === 'Enter') {
        focusElement('#invoice-discount input');
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
});

const navigateTo = (index, field) => {
    if (index >= 0 && index < form.sales_items.length) {
        focusElement(`#input-${index}-${field} input`);
    } else {
        focusElement(index < 0 ? '#search-product' : '#invoice-discount input');
    }
};

const focusElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

const addProductToInvoice = (product) => {
    const item = {
        product_id: product.id,
        title: product.title,
        unit_price: parseFloat(product.sales_price),
        quantity: 1,
        stock: product.stock,
        unit: product.unit,
        discount: parseFloat(product.discount),
        sub_total: parseFloat(product.sales_price),
    };
    if (form.sales_items.length < 25) {
        form.sales_items.push(item);
        goToProductArea();
    }
};

const goToProductArea = () => {
    nextTick(() => focusElement(`#input-${form.sales_items.length - 1}-quantity input`));
};

const customer = ref(props.customers.find(item => item.id === form.customer_id) || '');

const updateSubtotals = () => {
    form.sales_items.forEach(item => {
        const discount = isNaN(item.discount) ? 0 : parseFloat(item.discount) / 100;
        item.sub_total = (item.unit_price * item.quantity * (1 - discount)).toFixed(2);
    });
};

watch(() => form.sales_items, updateSubtotals, { deep: true });
watch(() => form.payment_type, (type) => {
    form.payment_type_id = type ? type.id : null;
});
watch(() => form.customer, (newCustomer) => {
    form.customer_id = newCustomer ? newCustomer.id : null;
});

form.sub_total = computed(() => form.sales_items.reduce((acc, item) => acc + parseFloat(item.sub_total), 0).toFixed(2));
form.grand_total = computed(() => {
    const { sub_total, discount, extra_fees } = form;
    return (parseFloat(sub_total) + parseFloat(extra_fees) - parseFloat(discount)).toFixed(2);
});
form.due_amount = computed(() => (parseFloat(form.grand_total) - parseFloat(form.paid_amount)).toFixed(2));

const removeItem = (index) => form.sales_items.splice(index, 1);

const saveInvoice = () => {
    if (!form.processing) {
        form.put(route('admin.sales.update', form.id), {
            preserveScroll: true,
            onSuccess: () => window.print(),
        });
    }
};
</script>
