<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales_returns', function (Blueprint $table) {
            $table->boolean('is_scrap_purchase')->default(false)->after('return_date');
        });

        Schema::table('sales_return_items', function (Blueprint $table) {
            $table->string('description')->nullable()->after('product_id');
            $table->unsignedBigInteger('product_id')->nullable()->change();
            $table->integer('bundles')->default(0)->change();
            $table->integer('extra_pieces')->default(0)->change();
            $table->integer('total_pieces')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_returns', function (Blueprint $table) {
            $table->dropColumn('is_scrap_purchase');
        });

        Schema::table('sales_return_items', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
            $table->integer('bundles')->default(null)->change();
            $table->integer('extra_pieces')->default(null)->change();
            $table->integer('total_pieces')->default(null)->change();
        });
    }
};
