<?php

declare(strict_types=1);

use App\Actions\UpdateUser;
use App\Data\UserData;
use App\Models\User;

it('updates a user with non-null values', function (): void {
    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@email.com',
    ]);

    app(UpdateUser::class)->handle($user, UserData::from([
        'name' => 'New Name',
    ]));

    expect($user->refresh()->name)->toBe('New Name')
        ->and($user->email)->toBe('old@email.com');
});

it('resets email verification when email changes', function (): void {
    $user = User::factory()->create([
        'email' => 'old@email.com',
        'email_verified_at' => now(),
    ]);

    app(UpdateUser::class)->handle($user, UserData::from([
        'email' => 'new@email.com',
    ]));

    expect($user->refresh()->email)->toBe('new@email.com')
        ->and($user->email_verified_at)->toBeNull();
});

it('keeps email verification when email stays the same', function (): void {
    $verifiedAt = now();

    $user = User::factory()->create([
        'email' => 'same@email.com',
        'email_verified_at' => $verifiedAt,
    ]);

    app(UpdateUser::class)->handle($user, UserData::from([
        'email' => 'same@email.com',
        'name' => 'Updated Name',
    ]));

    expect($user->refresh()->email_verified_at)->not->toBeNull()
        ->and($user->name)->toBe('Updated Name');
});

it('does not update when all data is null', function (): void {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'original@email.com',
    ]);

    app(UpdateUser::class)->handle($user, UserData::from([
        'name' => null,
        'email' => null,
    ]));

    expect($user->refresh()->name)->toBe('Original Name')
        ->and($user->email)->toBe('original@email.com');
});

it('does not reset email verification when email is empty string', function (): void {
    $user = User::factory()->create([
        'email' => 'original@email.com',
        'email_verified_at' => now(),
    ]);

    app(UpdateUser::class)->handle($user, UserData::from([
        'email' => '',
    ]));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});
