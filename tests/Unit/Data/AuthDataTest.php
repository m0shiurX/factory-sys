<?php

declare(strict_types=1);

use App\Data\AuthData;
use Spatie\LaravelData\Support\Validation\ValidationContext;
use Spatie\LaravelData\Support\Validation\ValidationPath;

it('can instantiate with required password and optional fields', function (): void {
    $data = AuthData::from([
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    expect($data->password)->toBe('password123')
        ->and($data->email)->toBeNull()
        ->and($data->token)->toBeNull()
        ->and($data->currentPassword)->toBeNull();
});

it('can instantiate with all properties', function (): void {
    $data = AuthData::from([
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
        'email' => 'user@example.com',
        'token' => 'reset-token-123',
        'currentPassword' => 'oldpassword123',
    ]);

    expect($data->password)->toBe('newpassword123')
        ->and($data->email)->toBe('user@example.com')
        ->and($data->token)->toBe('reset-token-123')
        ->and($data->currentPassword)->toBe('oldpassword123');
});

it('has validation rules', function (): void {
    $payload = ['password' => 'secret123', 'password_confirmation' => 'secret123'];
    $context = new ValidationContext($payload, $payload, new ValidationPath());
    $rules = AuthData::rules($context);

    expect($rules)->toBeArray()
        ->and($rules)->toHaveKey('password');
});
