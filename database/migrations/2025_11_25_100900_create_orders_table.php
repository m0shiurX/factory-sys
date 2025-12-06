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
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('order_number')->unique(); // e.g., ORD-2025-00001

            // Plan info (snapshot at time of order)
            $table->string('plan_slug'); // yearly, mega-savings
            $table->string('plan_name'); // বার্ষিক প্ল্যান
            $table->string('plan_duration'); // ১ বছর, ৩ বছর
            $table->unsignedInteger('amount'); // in BDT (no decimals for Taka)

            // Business name (optional, for hardware store)
            $table->string('business_name')->nullable();

            // Order status: pending -> verified -> processing -> completed / failed / refunded
            $table->enum('status', ['pending', 'verified', 'processing', 'completed', 'failed', 'refunded'])
                ->default('pending');

            // Subscription period (set when order is completed)
            $table->date('subscription_starts_at')->nullable();
            $table->date('subscription_ends_at')->nullable();

            // Admin notes
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            // Indexes for common queries
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
