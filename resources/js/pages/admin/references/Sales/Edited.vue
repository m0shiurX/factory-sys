<!-- eslint-disable no-undef -->
<template>
    <Head title="Edit Sale - Lavloss" />
    <div
        class="tw-gap-2 tw-grid tw-grid-cols-4 tw-mx-auto tw-pb-12 tw-max-w-7xl"
    >
        <!-- Navigation -->
        <div
            class="tw-flex tw-justify-start tw-items-start tw-space-x-5 print:tw-hidden tw-col-span-2 xl:tw-col-span-1"
        >
            <Link
                :href="route('admin.sales.index')"
                as="button"
                tabindex="0"
                class="tw-flex-1 tw-bg-slate-300 tw-px-8 tw-py-2 tw-rounded-md tw-dash-ring tw-h-full tw-min-w-fit tw-max-w-32 tw-font-semibold tw-text-slate-800"
            >
                Back
            </Link>
        </div>
        <div
            class="tw-col-span-4 tw-bg-base-100 tw-p-3 tw-border tw-rounded-sm"
        >
            <form @submit.prevent="saveItem">
                <!-- Invoice heading -->
                <div
                    class="tw-gap-x-5 tw-grid tw-grid-cols-4 tw-bg-primary tw-mt-4 tw-px-4 tw-p-4 tw-rounded-md tw-text-primary-content"
                >
                    <div class="tw-col-span-1">
                        <div class="tw-font-bold tw-text-sm tw-uppercase">
                            Invoice no: <span> {{ bill_no }}</span>
                        </div>
                        <div class="tw-w-full tw-max-w-sm">
                            <v-select
                                class="tw-bg-white tw-rounded-sm"
                                placeholder="Choose a Customer"
                                v-model.number="form.customer_id"
                                :options="props.customers"
                                :reduce="(customer) => customer.id"
                                label="name"
                            />
                            <div
                                class="tw-text-error"
                                v-if="errors.customer_id"
                            >
                                {{ errors.customer_id }}
                            </div>
                        </div>
                    </div>
                    <div class="tw-col-span-2 tw-text-center">
                        <template v-if="customer !== ''">
                            <h3 class="tw-font-semibold tw-text-xl">
                                {{ customer.name }}
                            </h3>
                            <p>
                                {{ customer.address }} <br />
                                Contact No: {{ customer.phone }}
                            </p>
                            <p class="b">Total Due: {{ customer.total_due }}</p>
                        </template>
                    </div>

                    <div
                        class="tw-col-span-1 tw-col-start-4 print:tw-text-black"
                    >
                        <div class="tw-mt-0">
                            <label class="tw-mb-0 tw-font-semibold">
                                Invoice Date:
                            </label>
                            <Datepicker
                                v-model="form.sale_date"
                                id="sale_date"
                            />
                        </div>
                    </div>
                </div>

                <!-- Product search -->
                <div class="tw-relative tw-flex-1 print:tw-hidden tw-mt-5">
                    <div>
                        <label
                            class="tw-flex tw-items-center tw-gap-3 tw-mb-[3px] tw-rounded-none tw-input tw-input-accent focus:tw-ring-offset-0 focus-within:tw-outline-offset-0"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                class="tw-opacity-70 tw-fill-accent tw-size-5"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <input
                                name="search"
                                v-model="search"
                                placeholder="Type product name or code"
                                type="text"
                                autocomplete="off"
                                class="tw-rounded-none tw-w-full placeholder:tw-text-accent"
                                @keydown.up.prevent="highlightPrevious"
                                @keydown.down.prevent="highlightNext"
                                @focus="searchResultShown = true"
                                @keydown.esc="searchResultShown = false"
                                @input="softResetSearch"
                                @keydown.enter.prevent="selectItem"
                            />
                            <div
                                v-if="search.length > 0"
                                class="tw-cursor-pointer"
                                @click="resetSearch"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="tw-size-5 tw-stroke-danger"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z"
                                    />
                                </svg>
                            </div>
                        </label>
                    </div>
                    <transition name="fade">
                        <div
                            v-if="search.length > 0 && searchResultShown"
                            class="tw-tw-left-0 tw-z-50 tw-absolute tw-w-full tw-overflow-y-auto"
                        >
                            <ul class="tw-bg-primary tw-overflow-auto">
                                <li
                                    v-for="(product, index) in filteredProduct"
                                    :key="product.id"
                                    class="tw-relative tw-border-accent tw-border-y hover:tw-border-y hover:tw-border-accent-content hover:tw-bg-primary focus:tw-bg-accent tw-py-2 tw-pl-4 tw-w-full tw-font-medium tw-text-slate-900 tw-cursor-pointer"
                                    role="option"
                                    tabindex="-1"
                                    value="0"
                                    :class="{
                                        'tw-border-y tw-border-accent-content tw-bg-accent-content':
                                            index === highlightedIndex,
                                    }"
                                    @click="clickedItem(index)"
                                >
                                    <span
                                        class="tw-block tw-font-normal tw-capitalize"
                                        >{{ product.title }} -
                                        {{ product.unit }}</span
                                    >
                                </li>
                            </ul>
                        </div>
                    </transition>
                </div>
                <div class="tw-pl-2 tw-text-error" v-if="errors.sales_items">
                    {{ errors.sales_items }}
                </div>
                <!-- Invoice table  -->
                <table class="tw-my-3 tw-table-auto tw-w-full">
                    <thead>
                        <tr
                            class="tw-border-gray-400 tw-bg-slate-200 tw-border tw-rounded-lg tw-h-12 focus:tw-outline-none tw-text-base tw-text-gray-500"
                        >
                            <th
                                class="tw-border-gray-400 tw-border-x tw-pr-2 tw-pl-5 tw-w-3 tw-text-left"
                            >
                                SL
                            </th>
                            <th
                                class="tw-border-gray-400 tw-pr-2 tw-pl-5 tw-border-r tw-w-60 tw-text-left"
                            >
                                Product Name
                            </th>
                            <th
                                class="tw-border-gray-400 tw-border-x tw-pl-5 tw-w-28 tw-text-center"
                            >
                                Rate
                            </th>
                            <th
                                class="tw-border-gray-400 tw-border-x tw-pl-5 tw-w-28 tw-text-center"
                            >
                                Quantity
                            </th>
                            <th
                                class="tw-border-gray-400 tw-border-x tw-pl-5 tw-w-28 tw-text-center"
                            >
                                Discount
                            </th>
                            <th
                                class="tw-border-gray-400 tw-border-x tw-pl-5 tw-w-32 tw-text-center"
                            >
                                Total
                            </th>
                            <th
                                class="tw-border-gray-400 tw-border-x tw-pr-3 tw-pl-5 tw-w-8 tw-text-center"
                            >
                                ACT
                            </th>
                        </tr>
                        <tr class="tw-h-2"></tr>
                    </thead>
                    <tbody>
                        <template
                            v-for="(formRow, index) in form.sales_items"
                            :key="formRow.id"
                        >
                            <tr
                                class="tw-border-secondary-200 tw-bg-secondary-50 hover:tw-bg-secondary-100 tw-border tw-rounded tw-ease-in tw-h-12 tw-transition-colors tw-duration-200 tw-group"
                            >
                                <td
                                    class="tw-border-gray-300 tw-border-x tw-pr-2 tw-pl-5 tw-w-3 tw-text-left"
                                >
                                    {{ index + 1 }}
                                </td>
                                <td
                                    class="tw-border-gray-300 tw-pr-2 tw-pl-5 tw-border-r tw-text-left"
                                >
                                    {{ formRow.title }} - {{ formRow.unit }}
                                </td>
                                <td
                                    class="tw-border-gray-300 tw-border-x tw-w-32 tw-text-center"
                                >
                                    <CurrencyInput
                                        v-model="formRow.unit_price"
                                        :disabled="false"
                                        :step="1"
                                    />
                                </td>
                                <td
                                    class="tw-border-gray-300 tw-border-x tw-w-32 tw-text-center"
                                >
                                    <CurrencyInput
                                        v-model="formRow.quantity"
                                        :disabled="false"
                                    />
                                </td>
                                <td
                                    class="tw-border-gray-300 tw-border-x tw-w-32 tw-text-center"
                                >
                                    <CurrencyInput
                                        v-model="formRow.discount"
                                        :disabled="false"
                                    />
                                </td>
                                <td
                                    class="tw-border-gray-300 tw-border-x tw-w-32 tw-text-center"
                                >
                                    <CurrencyInput
                                        v-model="formRow.sub_total"
                                        :disabled="true"
                                        :step="1"
                                    />
                                </td>
                                <td>
                                    <button
                                        @click="removeItem(index)"
                                        type="button"
                                        class="tw-place-items-center tw-grid focus:tw-bg-danger/20 tw-h-12 tw-w-full focus:tw-outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="1.5"
                                            stroke="currentColor"
                                            class="tw-size-5 tw-stroke-danger"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                            />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                            <tr class="tw-h-2"></tr>
                        </template>
                    </tbody>
                </table>

                <!-- Invoice footer -->
                <div class="tw-gap-x-12 tw-grid tw-grid-cols-6 tw-p-4">
                    <div
                        class="tw-space-y-3 tw-col-span-6 sm:tw-col-span-3 xl:tw-col-span-4"
                    >
                        <!-- Invoice Notes -->
                        <label
                            class="tw-form-control"
                            v-if="form.extra_fees > 0"
                        >
                            <div class="tw-label">
                                <span class="tw-label-text tw-font-semibold"
                                    >Extra fees details</span
                                >
                            </div>
                            <textarea
                                v-model="form.sale_note"
                                class="tw-textarea-bordered tw-textarea h-24"
                                placeholder="Max. 300 characters"
                            ></textarea>
                        </label>
                    </div>

                    <!-- Invoice Summary -->
                    <div
                        class="tw-col-span-6 sm:tw-col-span-3 xl:tw-col-span-2"
                    >
                        <div class="tw-flex tw-flex-col tw-h-full">
                            <div class="tw-space-y-2 tw-mb-6">
                                <div
                                    class="tw-flex tw-justify-between tw-items-center"
                                >
                                    <p class="tw-grow tw-font-semibold">
                                        Subtotal ৳
                                    </p>
                                    <p class="tw-w-28">
                                        <CurrencyInput
                                            classes="tw-input-bordered tw-input-sm"
                                            v-model.number="form.sub_total"
                                            :disabled="true"
                                            :step="1"
                                        />
                                    </p>
                                </div>
                                <div
                                    class="tw-flex tw-justify-between tw-items-center"
                                >
                                    <p class="tw-grow tw-font-semibold">
                                        Discount
                                    </p>
                                    <p class="tw-w-28">
                                        <CurrencyInput
                                            classes="tw-input-bordered tw-input-sm"
                                            v-model.number="form.discount"
                                            :disabled="false"
                                            :step="1"
                                        />
                                    </p>
                                </div>
                                <div
                                    class="tw-flex tw-justify-between tw-items-center"
                                >
                                    <p class="tw-grow tw-font-semibold">
                                        Extra Fees
                                    </p>
                                    <p class="tw-w-28">
                                        <CurrencyInput
                                            classes="tw-input-bordered tw-input-sm"
                                            v-model.number="form.extra_fees"
                                            :disabled="false"
                                            :step="1"
                                        />
                                    </p>
                                </div>
                                <div
                                    class="tw-flex tw-justify-between tw-items-center tw-pt-3 tw-border-t"
                                >
                                    <p class="tw-grow tw-font-bold">
                                        Grand Total
                                    </p>
                                    <p class="tw-w-28">
                                        <CurrencyInput
                                            classes="tw-input-bordered tw-input-sm"
                                            v-model.number="form.grand_total"
                                            :disabled="true"
                                            :step="1"
                                        />
                                    </p>
                                </div>
                            </div>
                            <div class="tw-mt-auto">
                                <div
                                    class="tw-flex tw-justify-between tw-items-center tw-gap-x-3 tw-pt-6"
                                >
                                    <Link
                                        :href="route('admin.sales.index')"
                                        as="button"
                                        tabindex="0"
                                        class="tw-flex-1 tw-bg-slate-300 tw-px-8 tw-py-2 tw-rounded-md tw-h-10 tw-min-w-fit tw-font-semibold tw-text-slate-800"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="button"
                                        @click="saveItem"
                                        class="tw-flex-1 tw-rounded-md tw-btn tw-btn-secondary tw-h-10 tw-w-full sm:tw-w-32 tw-min-w-fit tw-min-h-10"
                                    >
                                        Update Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
<script setup>
import { Head, useForm, Link } from '@inertiajs/vue3';
import { ref, computed, watch, onMounted } from 'vue';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import debounce from '@/lib/debounce';
import CurrencyInput from '@/Shared/CurrencyInput.vue';
import Datepicker from '@/Components/DatePicker.vue';
import dayjs from 'dayjs';

const props = defineProps({
    sale: Object,
    customers: Object,
    errors: Object,
});

const {
    id,
    bill_no,
    sale_date,
    customer_id,
    sub_total,
    discount,
    extra_fees,
    grand_total,
    sale_note,
    delivery_note,
    due_amount,
    sales_items,
} = props.sale;

const form = useForm({
    bill_no,
    sale_date: dayjs(sale_date).format('YYYY-MM-DD'),
    customer_id,
    sub_total,
    discount,
    extra_fees,
    grand_total,
    sale_note,
    delivery_note,
    due_amount,
    sales_items: [...sales_items],
});

// Customers
const customer = ref('');

const changeCustomer = (id) => {
    const detail = props.customers.find((item) => item.id === id);
    if (detail) {
        customer.value = detail;
    }
};

watch(
    () => form.customer_id,
    (customer_id) => changeCustomer(customer_id),
);

onMounted(() => {
    changeCustomer(form.customer_id);
});

const search = ref('');
const filteredProduct = ref([]);
const selectedProduct = ref();

watch(
    search,
    debounce((txt) => {
        txt.length > 1 &&
            // eslint-disable-next-line no-undef
            axios
                // eslint-disable-next-line no-undef
                .get(route('admin.products.search'), {
                    params: { query: txt },
                })
                .then((result) => (filteredProduct.value = result.data));
    }, 500),
);

const searchResultShown = ref(false);
const highlightedIndex = ref(0);

const resetSearch = () => {
    search.value = '';
    highlightedIndex.value = 0;
};
const softResetSearch = () => {
    searchResultShown.value = true;
    highlightedIndex.value = 0;
};

const selectItem = () => {
    if (filteredProduct.value.length > 0) {
        let item = filteredProduct.value[highlightedIndex.value];
        selectedProduct.value = item;
        resetSearch();
    }
};
const clickedItem = (index) => {
    let item = filteredProduct.value[index];
    selectedProduct.value = item;
    resetSearch();
};
const highlightNext = () => {
    if (highlightedIndex.value < filteredProduct.value.length - 1) {
        highlightedIndex.value++;
    } else {
        highlightedIndex.value = 0;
    }
};
const highlightPrevious = () => {
    highlightedIndex.value > 0 && highlightedIndex.value--;
};

// Manage table rows with form
watch(selectedProduct, (item) => {
    item.product_id = item.id;
    item.quantity = 1;
    item.unit_price = parseFloat(item.sales_price);
    item.discount = parseFloat(item.discount);
    item.sub_total = parseFloat(item.quantity * item.unit_price);
    form.sales_items.push(item);
});

// Calculate individual fields
watch(
    () => form.sales_items,
    (items) => {
        items.forEach((item) => {
            let discountDecimal = parseFloat(item.discount) / 100;
            // Check if the discount is not a valid number or finite
            if (isNaN(discountDecimal) || !isFinite(discountDecimal)) {
                discountDecimal = 0;
            }

            // Calculate subtotal
            const subTotal =
                parseFloat(item.unit_price) *
                item.quantity *
                (1 - discountDecimal);
            item.sub_total = subTotal.toFixed(2);
        });
    },
    { deep: true },
);

// Sub total
form.sub_total = computed(() => {
    return parseFloat(
        form.sales_items
            .reduce(
                (accumulator, current) =>
                    accumulator + parseFloat(current.sub_total),
                0,
            )
            .toFixed(2),
    );
});

form.grand_total = computed({
    get() {
        if (form.sales_items.length == 0) return 0;
        const subTotal = parseFloat(form.sub_total);
        const discount = parseFloat(form.discount || 0);
        const extraFees = parseFloat(form.extra_fees || 0);

        const totalBeforeDiscount = subTotal + extraFees;
        const discountedTotal = totalBeforeDiscount - discount;
        return discountedTotal.toFixed(2);
    },
});

const removeItem = (index) => {
    form.sales_items.splice(index, 1);
};

const saveItem = () => {
    !form.processing &&
        // eslint-disable-next-line no-undef
        form.put(route('admin.sales.update', { sale: id }), {
            preserveScroll: true,
            onSuccess: () => {
                window.print();
            },
        });
};

// eslint-disable-next-line no-unused-vars
const reset = () => {
    form.sales_items = [];
    form.reset();
};
</script>

<style>
.style-chooser .vs__search::placeholder,
.style-chooser .vs__dropdown-toggle,
.style-chooser .vs__dropdown-menu {
    background: #dfe5fb;
    border: none;
    color: #394066;
    text-transform: lowercase;
    font-variant: small-caps;
}

.style-chooser .vs__clear,
.style-chooser .vs__open-indicator {
    fill: #394066;
}
</style>
