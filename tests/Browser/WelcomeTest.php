<?php

declare(strict_types=1);

it('has home page', function (): void {
    $page = visit('/');

    $page->assertSee('দোকান বন্ধের পরেও হিসাব করতে বসে যেতে হয়?');
});
