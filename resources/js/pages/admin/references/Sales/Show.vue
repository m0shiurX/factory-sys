<template>
    <Head :title="sale.bill_no + ' - Lavloss'" />

    <!-- Screen Layout - Responsive -->
    <div
        class="screen-only tw-mx-auto tw-pb-12 tw-max-w-full tw-px-3 sm:tw-px-4"
    >
        <!-- Top Navigation -->
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
            <Link
                :href="route('admin.sales.index')"
                class="tw-inline-flex tw-items-center tw-gap-2 tw-text-gray-600 hover:tw-text-gray-900 tw-transition-colors"
            >
                <svg
                    class="tw-w-5 tw-h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span class="tw-font-medium">Back to Sales</span>
            </Link>
            <button
                type="button"
                @click="printInvoice"
                class="tw-inline-flex tw-items-center tw-gap-2 tw-bg-gray-900 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium hover:tw-bg-gray-800 tw-transition-colors tw-shadow-sm"
            >
                <svg
                    class="tw-w-4 tw-h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                </svg>
                Print
            </button>
        </div>

        <!-- Invoice Card -->
        <div
            class="tw-bg-white tw-min-h-[80vh] tw-shadow-sm tw-rounded-md tw-overflow-hidden tw-border tw-border-gray-100"
        >
            <!-- Header with Status Badge -->
            <div
                class="tw-bg-gradient-to-r tw-from-emerald-500 tw-to-emerald-600 tw-px-5 tw-py-4"
            >
                <div
                    class="tw-flex tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-3"
                >
                    <div>
                        <div class="tw-flex tw-items-center tw-gap-3">
                            <h1
                                class="tw-text-xl sm:tw-text-2xl tw-font-bold tw-text-white"
                            >
                                {{ sale.bill_no }}
                            </h1>
                        </div>
                        <p class="tw-text-emerald-100 tw-text-sm tw-mt-1">
                            {{ sale.sale_date }}
                        </p>
                    </div>
                    <div class="tw-text-left sm:tw-text-right">
                        <p
                            class="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-white"
                        >
                            ৳{{ sale.grand_total }}
                        </p>
                        <p
                            class="tw-text-emerald-100 tw-text-xs tw-uppercase tw-tracking-wide"
                        >
                            Grand Total
                        </p>
                    </div>
                </div>
            </div>

            <!-- Customer Info -->
            <div class="tw-px-5 tw-py-4 tw-border-b tw-border-gray-100">
                <div class="tw-flex tw-flex-row tw-gap-4">
                    <!-- Customer Details -->
                    <div class="tw-flex tw-items-start tw-gap-3 tw-flex-1">
                        <div
                            class="tw-w-10 tw-h-10 tw-rounded-full tw-bg-emerald-100 tw-hidden sm:tw-flex tw-items-center tw-justify-center tw-flex-shrink-0"
                        >
                            <svg
                                class="tw-w-5 tw-h-5 tw-text-emerald-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <div class="tw-min-w-0">
                            <h3
                                class="tw-text-2xl tw-font-semibold tw-text-gray-900"
                            >
                                {{ sale.customer.name }}
                            </h3>
                            <p class="tw-text-sm tw-text-gray-500">
                                {{ sale.customer.address }}
                            </p>
                            <p class="tw-text-sm tw-text-gray-500">
                                {{ sale.customer.phone }}
                            </p>
                        </div>
                    </div>
                    <!-- Customer Due -->
                    <div
                        class="tw-flex-shrink-0 tw-text-left sm:tw-text-right tw-pl-13 sm:tw-pl-0"
                    >
                        <p
                            class="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wide"
                        >
                            Total Due
                        </p>
                        <p
                            class="tw-text-2xl tw-font-bold"
                            :class="
                                sale.customer.total_due > 0
                                    ? 'tw-text-red-600'
                                    : 'tw-text-emerald-600'
                            "
                        >
                            ৳{{ sale.customer.total_due }}
                        </p>
                        <p class="tw-text-xs tw-text-gray-400">
                            Overall balance
                        </p>
                    </div>
                </div>
            </div>

            <!-- Items Section -->
            <div class="tw-px-5 tw-py-4">
                <!-- Desktop Table -->
                <div
                    class="tw-hidden sm:tw-block tw-overflow-hidden tw-rounded-lg tw-border tw-border-gray-200"
                >
                    <table class="tw-w-full">
                        <thead>
                            <tr class="tw-bg-gray-50">
                                <th
                                    class="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider"
                                >
                                    #
                                </th>
                                <th
                                    class="tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider"
                                >
                                    Product
                                </th>
                                <th
                                    class="tw-px-4 tw-py-3 tw-text-right tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider"
                                >
                                    Rate
                                </th>
                                <th
                                    class="tw-px-4 tw-py-3 tw-text-center tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider"
                                >
                                    Qty
                                </th>
                                <th
                                    class="tw-px-4 tw-py-3 tw-text-right tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider"
                                >
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody class="tw-divide-y tw-divide-gray-100">
                            <tr
                                v-for="(item, index) in sale.sale_items"
                                :key="item.id"
                                class="hover:tw-bg-gray-50 tw-transition-colors"
                            >
                                <td
                                    class="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-400"
                                >
                                    {{ index + 1 }}
                                </td>
                                <td class="tw-px-4 tw-py-3">
                                    <span
                                        class="tw-font-medium tw-text-gray-900"
                                        >{{ item.title }}</span
                                    >
                                </td>
                                <td
                                    class="tw-px-4 tw-py-3 tw-text-right tw-text-sm tw-text-gray-600"
                                >
                                    ৳{{ item.unit_price }}
                                </td>
                                <td class="tw-px-4 tw-py-3 tw-text-center">
                                    <span
                                        class="tw-inline-flex tw-items-center tw-gap-1 tw-text-sm"
                                    >
                                        <span
                                            class="tw-font-medium tw-text-gray-900"
                                            >{{ item.quantity }}</span
                                        >
                                        <span class="tw-text-gray-400">{{
                                            item.unit
                                        }}</span>
                                    </span>
                                </td>
                                <td
                                    class="tw-px-4 tw-py-3 tw-text-right tw-font-semibold tw-text-gray-900"
                                >
                                    ৳{{ item.sub_total }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Cards -->
                <div class="sm:tw-hidden tw-space-y-2">
                    <div
                        v-for="(item, index) in sale.sale_items"
                        :key="item.id"
                        class="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-border tw-border-gray-100"
                    >
                        <div class="tw-flex tw-justify-between tw-items-start">
                            <div class="tw-flex-1">
                                <p class="tw-font-medium tw-text-gray-900">
                                    {{ item.title }}
                                </p>
                                <p
                                    class="tw-text-sm tw-text-gray-500 tw-mt-0.5"
                                >
                                    ৳{{ item.unit_price }} × {{ item.quantity }}
                                    {{ item.unit }}
                                </p>
                            </div>
                            <p class="tw-font-bold tw-text-gray-900">
                                ৳{{ item.sub_total }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Section -->
            <div
                class="tw-px-5 tw-py-4 tw-bg-gray-50 tw-border-t tw-border-gray-100"
            >
                <div
                    class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between tw-gap-4"
                >
                    <!-- Note & Amount in Words (Left on desktop) -->
                    <div
                        v-if="sale.sale_note || amountInWords"
                        class="tw-hidden sm:tw-block tw-flex-1"
                    >
                        <div class="tw-space-y-3">
                            <div v-if="sale.sale_note">
                                <p
                                    class="tw-text-xs tw-font-medium tw-text-gray-400 tw-uppercase"
                                >
                                    Note
                                </p>
                                <p class="tw-text-sm tw-text-gray-600">
                                    {{ sale.sale_note }}
                                </p>
                            </div>
                            <div>
                                <p
                                    class="tw-text-xs tw-font-medium tw-text-gray-400 tw-uppercase"
                                >
                                    In Words
                                </p>
                                <p
                                    class="tw-text-sm tw-text-gray-600 tw-capitalize"
                                >
                                    {{ amountInWords }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <!-- Totals (Right on desktop) -->
                    <div class="tw-w-full sm:tw-w-64 tw-space-y-2">
                        <div class="tw-flex tw-justify-between tw-text-sm">
                            <span class="tw-text-gray-500">Subtotal</span>
                            <span class="tw-text-gray-700"
                                >৳{{ sale.sub_total }}</span
                            >
                        </div>
                        <div
                            v-if="sale.discount > 0"
                            class="tw-flex tw-justify-between tw-text-sm"
                        >
                            <span class="tw-text-gray-500">Discount</span>
                            <span class="tw-text-emerald-600"
                                >-৳{{ sale.discount }}</span
                            >
                        </div>
                        <div
                            v-if="sale.extra_fees > 0"
                            class="tw-flex tw-justify-between tw-text-sm"
                        >
                            <span class="tw-text-gray-500">Extra Fees</span>
                            <span class="tw-text-gray-700"
                                >+৳{{ sale.extra_fees }}</span
                            >
                        </div>
                        <div
                            class="tw-flex tw-justify-between tw-pt-2 tw-border-t tw-border-gray-200"
                        >
                            <span class="tw-font-semibold tw-text-gray-900"
                                >Grand Total</span
                            >
                            <span
                                class="tw-font-bold tw-text-lg tw-text-gray-900"
                                >৳{{ sale.grand_total }}</span
                            >
                        </div>
                        <div class="tw-flex tw-justify-between tw-text-sm">
                            <span class="tw-text-gray-500">Paid</span>
                            <span class="tw-text-emerald-600 tw-font-medium"
                                >৳{{ sale.paid_amount }}</span
                            >
                        </div>
                        <div
                            v-if="sale.due_amount > 0"
                            class="tw-flex tw-justify-between tw-pt-2 tw-border-t tw-border-gray-200"
                        >
                            <span class="tw-font-semibold tw-text-red-600"
                                >Due</span
                            >
                            <span class="tw-font-bold tw-text-red-600"
                                >৳{{ sale.due_amount }}</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <!-- Note & Amount in Words -->
            <div
                v-if="sale.sale_note || amountInWords"
                class="tw-px-5 tw-block sm:tw-hidden tw-py-4 tw-border-t tw-border-gray-100"
            >
                <div class="tw-space-y-3">
                    <div v-if="sale.sale_note" class="tw-flex tw-gap-2">
                        <div>
                            <p
                                class="tw-text-xs tw-font-medium tw-text-gray-400 tw-uppercase"
                            >
                                Note
                            </p>
                            <p class="tw-text-sm tw-text-gray-600">
                                {{ sale.sale_note }}
                            </p>
                        </div>
                    </div>
                    <div class="tw-flex tw-gap-2">
                        <div>
                            <p
                                class="tw-text-xs tw-font-medium tw-text-gray-400 tw-uppercase"
                            >
                                In Words
                            </p>
                            <p
                                class="tw-text-sm tw-text-gray-600 tw-capitalize"
                            >
                                {{ amountInWords }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Print Layout - Uses reusable component -->
    <PrintInvoice
        type="sale"
        :invoiceNo="sale.bill_no"
        :invoiceDate="sale.sale_date"
        :partyName="sale.customer.name"
        :partyAddress="sale.customer.address"
        :partyPhone="sale.customer.phone"
        :partyDue="sale.customer.total_due"
        :items="sale.sale_items"
        :subTotal="sale.sub_total"
        :discount="sale.discount"
        :extraFees="sale.extra_fees"
        :grandTotal="sale.grand_total"
        :paidAmount="sale.paid_amount"
        :dueAmount="sale.due_amount"
        :note="sale.sale_note"
    />
</template>

<script setup>
import { Head, Link, usePage } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import { ToWords } from 'to-words';
import PrintInvoice from '@/Components/PrintInvoice.vue';

const toWords = new ToWords({
    localeCode: 'en-BD',
    converterOptions: {
        currency: true,
        ignoreDecimal: true,
    },
});

const props = defineProps({
    sale: Object,
});

// Fetching Company information
const page = usePage();
const company = computed(() => page.props.company);

let amountInWords = ref('');

onMounted(() => {
    convertAmountToWords();
});

const convertAmountToWords = () => {
    amountInWords.value = toWords.convert(props.sale.grand_total);
};

const printInvoice = () => {
    window.print();
};
</script>

<style>
/* Hide print component on screen */
@media screen {
    .screen-only {
        display: grid;
    }
}

/* Hide screen layout when printing */
@media print {
    .screen-only {
        display: none !important;
    }
}
</style>
