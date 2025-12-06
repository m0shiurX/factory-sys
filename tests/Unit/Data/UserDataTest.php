<?php

declare(strict_types=1);

use App\Data\UserData;
use App\Models\User;
use Spatie\LaravelData\Support\Validation\ValidationContext;
use Spatie\LaravelData\Support\Validation\ValidationPath;

it('can instantiate with all properties', function (): void {
    $data = UserData::from([
        'id' => 1,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
    ]);

    expect($data->id)->toBe(1)
        ->and($data->name)->toBe('John Doe')
        ->and($data->email)->toBe('john@example.com')
        ->and($data->password)->toBe('password123');
});

it('can create from an existing user model', function (): void {
    $user = User::factory()->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);

    $data = UserData::fromModel($user);

    expect($data->id)->toBe($user->id)
        ->and($data->name)->toBe('Jane Doe')
        ->and($data->email)->toBe('jane@example.com')
        ->and($data->password)->toBeNull();
});

it('has validation rules without user id', function (): void {
    $payload = ['email' => 'test@example.com', 'password' => 'secret'];
    $context = new ValidationContext($payload, $payload, new ValidationPath());
    $rules = UserData::rules($context);

    expect($rules)->toBeArray()
        ->and($rules)->toHaveKey('email')
        ->and($rules)->toHaveKey('password');
});

it('has validation rules with user id for email uniqueness', function (): void {
    $user = User::factory()->create();
    $payload = ['id' => $user->id, 'email' => 'new@example.com', 'password' => 'secret'];
    $context = new ValidationContext($payload, $payload, new ValidationPath());
    $rules = UserData::rules($context);

    expect($rules)->toBeArray()
        ->and($rules)->toHaveKey('email')
        ->and($rules)->toHaveKey('password');
});
