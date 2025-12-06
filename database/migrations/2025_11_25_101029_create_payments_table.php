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
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            // Payment method: bkash, nagad, upay, bank
            $table->enum('method', ['bkash', 'nagad', 'upay', 'bank']);

            // Payment details from customer
            $table->string('gateway_number'); // Customer's bKash/Nagad/Upay number or Bank account
            $table->string('transaction_id'); // TrxID from gateway or bank reference

            // Amount (should match order amount for initial, can differ for renewals)
            $table->unsignedInteger('amount');

            // Payment status: pending -> verified -> failed
            $table->enum('status', ['pending', 'verified', 'failed'])->default('pending');

            // Verification info
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();

            // Admin notes (reason for failure, etc.)
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('method');
            $table->index('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
