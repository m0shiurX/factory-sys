<?php

declare(strict_types=1);

use App\Models\User;

uses()->group('middleware');

it('shares app name from config', function (): void {
    $response = $this->get('/');

    $page = $response->viewData('page');
    $shared = $page['props'];

    expect($shared)->toHaveKey('name')
        ->and($shared['name'])->toBe(config('app.name'));
});

it('shares inspiring quote with message and author', function (): void {
    $response = $this->get('/');

    $page = $response->viewData('page');
    $shared = $page['props'];

    expect($shared)->toHaveKey('quote')
        ->and($shared['quote'])->toHaveKeys(['message', 'author'])
        ->and($shared['quote']['message'])->toBeString()->not->toBeEmpty()
        ->and($shared['quote']['author'])->toBeString()->not->toBeEmpty();
});

it('shares null user when guest', function (): void {
    $response = $this->get('/');

    $page = $response->viewData('page');
    $shared = $page['props'];

    expect($shared)->toHaveKey('auth')
        ->and($shared['auth'])->toHaveKey('user')
        ->and($shared['auth']['user'])->toBeNull();
});

it('shares authenticated user data', function (): void {
    $user = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);

    $response = $this->actingAs($user)->get('/');

    $page = $response->viewData('page');
    $shared = $page['props'];

    expect($shared['auth']['user'])->not->toBeNull()
        ->and($shared['auth']['user']['id'])->toBe($user->id)
        ->and($shared['auth']['user']['name'])->toBe('Test User')
        ->and($shared['auth']['user']['email'])->toBe('test@example.com');
});

it('defaults sidebarOpen to true when no cookie', function (): void {
    $response = $this->get('/');

    $page = $response->viewData('page');
    $shared = $page['props'];

    expect($shared)->toHaveKey('sidebarOpen')
        ->and($shared['sidebarOpen'])->toBeTrue();
});

it('sets sidebarOpen to true when cookie is true', function (): void {
    $response = $this->call('GET', '/', [], ['sidebar_state' => 'true']);

    $page = $response->viewData('page');
    $shared = $page['props'];

    expect($shared['sidebarOpen'])->toBeTrue();
});

it('sets sidebarOpen to false when cookie is false', function (): void {
    $response = $this->call('GET', '/', [], ['sidebar_state' => 'false']);

    $page = $response->viewData('page');
    $shared = $page['props'];

    expect($shared['sidebarOpen'])->toBeFalse();
});

it('includes parent shared data', function (): void {
    $response = $this->get('/');

    $page = $response->viewData('page');
    $shared = $page['props'];

    // Parent Inertia middleware shares 'errors' by default
    expect($shared)->toHaveKey('errors');
});
