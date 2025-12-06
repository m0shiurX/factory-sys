<!-- eslint-disable no-undef -->
<template>
    <Head title="Sales - Lavloss" />

    <main class="tw-mx-auto tw-w-full tw-max-w-7xl">
        <!-- List filter and search -->
        <div
            class="tw-flex sm:tw-flex-row tw-flex-col tw-justify-between tw-items-center tw-gap-3 tw-mb-5 tw-w-full"
        >
            <SearchFilter
                v-model="form.search"
                class="tw-rounded-lg tw-w-full sm:tw-w-auto"
                @reset="resetSearch"
            >
            </SearchFilter>
            <div class="tw-flex tw-justify-between tw-gap-x-2 tw-w-full">
                <Link
                    as="button"
                    class="sm:tw-ml-auto tw-btn-create tw-group"
                    :href="route('admin.sales.create')"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        aria-hidden="true"
                        class="group-hover:tw-text-zinc-100 group-hover:tw-bg-emerald-500 group-hover:tw-rounded-full tw-size-6"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 12h14m-7-7v14"
                        ></path>
                    </svg>
                    New Sale
                </Link>
                <div class="tw-w-fit tw-max-w-fit flex-1">
                    <div
                        class="tw-flex !tw-flex-row tw-items-center tw-rounded-md"
                    >
                        <Link
                            tabindex="0"
                            class="tw-box-content tw-flex tw-flex-1 tw-items-center tw-gap-x-2 tw-border-2 tw-border-emerald-800 hover:tw-border-emerald-500 tw-bg-emerald-900 hover:tw-bg-emerald-600 tw-px-2 tw-py-2 tw-border-r-0 tw-rounded-l-md tw-text-base tw-text-white"
                            :href="route('admin.sale-returns.index')"
                            as="button"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                class="tw-mr-1 tw-size-5 additional-class"
                                width="1em"
                                height="1em"
                                viewBox="0 0 256 256"
                            >
                                <g fill="currentColor">
                                    <path
                                        d="M168 96v112a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h112a8 8 0 0 1 8 8"
                                        opacity=".2"
                                    ></path>
                                    <path
                                        d="M64 216a8 8 0 0 1-8 8h-8a16 16 0 0 1-16-16v-8a8 8 0 0 1 16 0v8h8a8 8 0 0 1 8 8m48-8H96a8 8 0 0 0 0 16h16a8 8 0 0 0 0-16m-72-40a8 8 0 0 0 8-8v-16a8 8 0 0 0-16 0v16a8 8 0 0 0 8 8m128 24a8 8 0 0 0-8 8v8h-8a8 8 0 0 0 0 16h8a16 16 0 0 0 16-16v-8a8 8 0 0 0-8-8m0-80a8 8 0 0 0 8-8v-8a16 16 0 0 0-16-16h-8a8 8 0 0 0 0 16h8v8a8 8 0 0 0 8 8M56 80h-8a16 16 0 0 0-16 16v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16m152-48H96a16 16 0 0 0-16 16v40a4 4 0 0 0 0 .55A8 8 0 0 0 88 96h24a8 8 0 0 0 0-16H96V48h112v112h-32v-16a8 8 0 0 0-16 0v24a8 8 0 0 0 8 8h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16"
                                    ></path>
                                </g>
                            </svg>
                            Sale Returns
                        </Link>
                        <Link
                            :href="route('admin.sale-returns.create')"
                            tabindex="0"
                            class="tw-flex tw-justify-center tw-items-center tw-border-2 tw-border-amber-400 tw-bg-amber-300 hover:tw-bg-amber-400 tw-px-2 tw-py-2.5 tw-border-l-0 tw-rounded-r-md tw-w-12 tw-text-amber-950 tw-text-base"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true"
                                class="tw-size-5"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 12h14m-7-7v14"
                                ></path>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <div class="tw-flex tw-flex-col tw-gap-y-5">
            <template v-for="sale in props.sales.data" :key="sale.id">
                <!-- Card -->
                <div
                    class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-12 tw-grid-rows-5 sm:tw-grid-rows-1 tw-bg-white tw-shadow tw-p-2 tw-rounded-md tw-h-40 tw-w-full sm:tw-h-16"
                >
                    <!-- Top row -->
                    <div
                        class="tw-flex tw-items-center tw-gap-3 tw-border-accent sm:tw-border-0 sm:tw-col-span-3 tw-row-span-2 sm:tw-row-span-1 tw-ml-2 tw-border-b"
                    >
                        <img
                            class="tw-size-12"
                            src="/public/assets/invoice.png"
                            alt=""
                        />
                        <div class="tw-text-slate-500">
                            <h4 class="tw-font-semibold">
                                <span class="sm:tw-hidden"> BILL NO: </span
                                >{{ sale.bill_no }}
                            </h4>
                            <p class="tw-font-medium">
                                <span class="sm:tw-hidden">Date: </span
                                >{{ sale.sale_date }}
                            </p>
                        </div>
                        <div class="sm:tw-hidden tw-ml-auto pr-2">
                            <Link
                                :href="route('admin.sales.show', sale.id)"
                                as="button"
                                type="button"
                                class="tw-rounded-md tw-btn tw-btn-secondary tw-h-10 tw-w-full sm:tw-w-32 tw-min-h-10"
                            >
                                Preview
                            </Link>
                        </div>
                    </div>
                    <!-- Bottom row phone-->
                    <div
                        class="tw-flex tw-flex-col tw-gap-2 sm:tw-hidden tw-mt-1"
                    >
                        <div
                            class="tw-flex tw-justify-between tw-items-center tw-px-2 tw-h-8 tw-w-full"
                        >
                            <span class="tw-font-semibold">Customer</span>
                            <span>{{ sale.customer.name }}</span>
                        </div>
                        <div
                            class="tw-flex tw-justify-between tw-items-center tw-px-2 tw-h-8 tw-w-full"
                        >
                            <span class="tw-font-semibold">Total Amount</span>
                            <span>BDT {{ sale.grand_total }}</span>
                        </div>
                        <div
                            class="tw-flex tw-justify-between tw-items-center tw-px-2 tw-h-8 tw-w-full"
                        >
                            <span class="tw-font-semibold">Paid Amount</span>
                            <span>BDT {{ sale.paid_amount }} </span>
                        </div>
                    </div>

                    <!-- Bottom row tablet+ -->
                    <div
                        class="sm:tw-flex tw-flex-col tw-justify-center tw-items-start tw-gap-y-1 tw-hidden tw-col-span-3 tw-text-sm pl-1"
                    >
                        <p>{{ sale.customer.name }}</p>
                        <p>{{ sale.customer.address }}</p>
                    </div>
                    <div
                        class="sm:tw-flex tw-flex-col tw-justify-center tw-items-end tw-hidden tw-col-span-3 tw-p-2"
                    >
                        <p
                            class="tw-font-semibold tw-text-base tw-text-gray-600 tw-leading-none"
                        >
                            Total: {{ sale.grand_total }} BDT
                        </p>
                        <p
                            class="tw-ml-1 tw-text-gray-400 tw-text-sm tw-leading-snug"
                        >
                            Paid: {{ sale.paid_amount }} BDT
                        </p>
                    </div>
                    <div
                        class="sm:tw-flex tw-justify-end tw-items-center tw-gap-2 tw-hidden tw-col-span-3 tw-p-2"
                    >
                        <Link
                            :href="route('admin.sales.show', sale.id)"
                            as="button"
                            type="button"
                            class="tw-rounded-md tw-btn tw-btn-secondary tw-h-10 tw-w-full sm:tw-w-32 tw-min-h-10"
                        >
                            Preview
                        </Link>
                        <Menu class="tw-relative" as="div">
                            <MenuButton>
                                <Icon
                                    class="tw-fill-slate-500"
                                    icon="vertical-dots"
                                />
                            </MenuButton>

                            <MenuItems
                                class="tw-right-0 tw-z-30 tw-absolute tw-flex tw-flex-col tw-bg-white tw-shadow tw-mr-2 tw-rounded-md tw-w-24"
                            >
                                <MenuItem v-slot="{ active }">
                                    <Link
                                        class="hover:tw-bg-orange-600 tw-px-4 tw-py-4 tw-rounded-t-md tw-w-full focus:tw-outline-none tw-text-xs hover:tw-text-white focus:tw-text-orange-200 tw-cursor-pointer"
                                        :class="{
                                            'tw-bg-orange-600 tw-text-white':
                                                active,
                                        }"
                                        :href="
                                            route('admin.sales.edit', sale.id)
                                        "
                                        as="button"
                                    >
                                        Edit
                                    </Link>
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                    <button
                                        class="hover:tw-bg-orange-600 tw-px-4 tw-py-4 tw-rounded-b-md tw-w-full focus:tw-outline-none tw-text-xs hover:tw-text-white focus:tw-text-orange-200 tw-cursor-pointer"
                                        :class="{
                                            'tw-bg-orange-600 tw-text-white':
                                                active,
                                        }"
                                        @click="destroyItem(sale.id)"
                                    >
                                        Delete
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>
                <!-- Card -->
            </template>
        </div>
        <Pagination class="my-3" :links="props.sales.links" />
    </main>
</template>
<script setup>
import { Head, Link, useForm, router } from '@inertiajs/vue3';
import { watch } from 'vue';
import pickBy from '@/lib/pickBy';
import Icon from '@/Shared/Icon.vue';
import debounce from '@/lib/debounce';
import Pagination from '@/Shared/Pagination.vue';
import SearchFilter from '@/Shared/SearchFilter.vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';

const props = defineProps({
    sales: Object,
    filters: Object,
});

const form = useForm({
    search: props.filters.search,
});

watch(
    form,
    debounce(() => {
        // eslint-disable-next-line no-undef
        router.get(route('admin.sales.index'), pickBy(form), {
            preserveState: true,
            replace: true,
        });
    }, 500),
    { deep: true },
);

const destroyItem = (item) => {
    // eslint-disable-next-line no-undef
    router.delete(route('admin.sales.destroy', item));
};

const resetSearch = () => {
    form.reset();
};
</script>
