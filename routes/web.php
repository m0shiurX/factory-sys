<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\SupportTicketController as AdminSupportTicketController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserEmailResetNotification;
use App\Http\Controllers\UserEmailVerification;
use App\Http\Controllers\UserEmailVerificationNotificationController;
use App\Http\Controllers\UserPasswordController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\UserTwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect()->route('login'))->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('dashboard', fn() => Inertia::render('admin/dashboard'))->name('dashboard');
    Route::prefix('dashboard')->group(function (): void {
        // Support tickets management
        Route::get('support', new AdminSupportTicketController()->index(...))->name('admin.support.index');
        Route::get('support/{ticket}', new AdminSupportTicketController()->show(...))->name('admin.support.show');
        Route::put('support/{ticket}', new AdminSupportTicketController()->update(...))->name('admin.support.update');
        Route::delete('support/{ticket}', new AdminSupportTicketController()->destroy(...))->name('admin.support.destroy');

        // Orders management
        Route::get('orders', new AdminOrderController()->index(...))->name('admin.orders.index');
        Route::get('orders/create', new AdminOrderController()->create(...))->name('admin.orders.create');
        Route::post('orders', new AdminOrderController()->store(...))->name('admin.orders.store');
        Route::get('orders/{orderNumber}', new AdminOrderController()->show(...))->name('admin.orders.show');
        Route::get('orders/{orderNumber}/edit', new AdminOrderController()->edit(...))->name('admin.orders.edit');
        Route::put('orders/{orderNumber}', new AdminOrderController()->update(...))->name('admin.orders.update');
        Route::delete('orders/{orderNumber}', new AdminOrderController()->destroy(...))->name('admin.orders.destroy');

        // Payments management
        Route::get('payments', new AdminPaymentController()->index(...))->name('admin.payments.index');
        Route::get('payments/{payment}', new AdminPaymentController()->show(...))->name('admin.payments.show');
        Route::get('payments/{payment}/edit', new AdminPaymentController()->edit(...))->name('admin.payments.edit');
        Route::put('payments/{payment}', new AdminPaymentController()->update(...))->name('admin.payments.update');
        Route::post('payments/{payment}/verify', new AdminPaymentController()->verify(...))->name('admin.payments.verify');

        // Customers management
        Route::get('customers', new AdminCustomerController()->index(...))->name('admin.customers.index');
        Route::get('customers/create', new AdminCustomerController()->create(...))->name('admin.customers.create');
        Route::post('customers', new AdminCustomerController()->store(...))->name('admin.customers.store');
        Route::get('customers/{customer}', new AdminCustomerController()->show(...))->name('admin.customers.show');
        Route::get('customers/{customer}/edit', new AdminCustomerController()->edit(...))->name('admin.customers.edit');
        Route::put('customers/{customer}', new AdminCustomerController()->update(...))->name('admin.customers.update');
        Route::delete('customers/{customer}', new AdminCustomerController()->destroy(...))->name('admin.customers.destroy');
    });
});

// Role management routes
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
});

Route::middleware('auth')->group(function (): void {
    // User...
    Route::delete('user', [UserController::class, 'destroy'])->name('user.destroy');

    // User Profile...
    Route::redirect('settings', '/settings/profile');
    Route::get('settings/profile', [UserProfileController::class, 'edit'])->name('user-profile.edit');
    Route::patch('settings/profile', [UserProfileController::class, 'update'])->name('user-profile.update');

    // User Password...
    Route::get('settings/password', [UserPasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [UserPasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    // Appearance...
    Route::get('settings/appearance', fn() => Inertia::render('admin/settings/appearance'))->name('appearance.edit');

    // User Two-Factor Authentication...
    Route::get('settings/two-factor', [UserTwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});

Route::middleware('guest')->group(function (): void {
    // User Password...
    Route::get('reset-password/{token}', [UserPasswordController::class, 'create'])
        ->name('password.reset');
    Route::post('reset-password', [UserPasswordController::class, 'store'])
        ->name('password.store');

    // User Email Reset Notification...
    Route::get('forgot-password', [UserEmailResetNotification::class, 'create'])
        ->name('password.request');
    Route::post('forgot-password', [UserEmailResetNotification::class, 'store'])
        ->name('password.email');

    // Session...
    Route::get('login', [SessionController::class, 'create'])
        ->name('login');
    Route::post('login', [SessionController::class, 'store'])
        ->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    // User Email Verification...
    Route::get('verify-email', [UserEmailVerificationNotificationController::class, 'create'])
        ->name('verification.notice');
    Route::post('email/verification-notification', [UserEmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // User Email Verification...
    Route::get('verify-email/{id}/{hash}', [UserEmailVerification::class, 'update'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    // Session...
    Route::post('logout', [SessionController::class, 'destroy'])
        ->name('logout');
});
