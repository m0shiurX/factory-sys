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
        Schema::create('sales_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('bundles')->default(0);
            $table->unsignedInteger('extra_pieces')->default(0);
            $table->unsignedInteger('total_pieces')->default(0);
            $table->decimal('weight_kg', 10, 2)->default(0);
            $table->decimal('rate_per_kg', 10, 2)->default(0);
            $table->decimal('sub_total', 12, 2)->default(0);
            $table->timestamps();

            $table->index('sales_return_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_return_items');
    }
};
