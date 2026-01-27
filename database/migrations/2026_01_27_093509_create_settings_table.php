<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            ['key' => 'company_name', 'value' => 'Lavloss', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'company_address', 'value' => 'Uposhohor Main Road, Bogura Sadar', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'company_phone', 'value' => '+8801XXXXXXXXX', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'invoice_footer_message', 'value' => 'Thank you for your business!', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'invoice_developed_by', 'value' => 'Developed by lavloss.com', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
