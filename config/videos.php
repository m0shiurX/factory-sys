<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Video CDN Base URL
    |--------------------------------------------------------------------------
    |
    | The base URL for your video CDN (Cloudflare R2 public URL).
    | Set this in your .env file as VIDEO_CDN_URL.
    | Example: https://pub-xxxxx.r2.dev
    |
    */
    'cdn_url' => env('VIDEO_CDN_URL', 'https://367be3a2035528943240074d0096e0cd.r2.cloudflarestorage.com'),

    /*
    |--------------------------------------------------------------------------
    | Video Files
    |--------------------------------------------------------------------------
    |
    | Define your video files here. The full URL will be constructed as:
    | {cdn_url}/{path}
    |
    | If cdn_url is empty, paths starting with '/' will be served locally.
    |/fls-a0768cf1-3ef5-424c-bd3b-fef5b366bb62/lavloss-vid-2k.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=7138d24b7d98c98c4c2d4d8332adebf2/20251128/wnam/s3/aws4_request&X-Amz-Date=20251128T081834Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=dac50496c072da7355b2717237bfa0d70cbc21242cc4e5a0e80b7328f75568e2
    */
    'files' => [
        'demo' => env('VIDEO_DEMO', '/fls-a0768cf1-3ef5-424c-bd3b-fef5b366bb62/lavloss-vid-2k.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=7138d24b7d98c98c4c2d4d8332adebf2/20251128/wnam/s3/aws4_request&X-Amz-Date=20251128T081834Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=dac50496c072da7355b2717237bfa0d70cbc21242cc4e5a0e80b7328f75568e2'),
        // Add more videos as needed:
        // 'tutorial' => env('VIDEO_TUTORIAL', '/videos/tutorial.mp4'),
        // 'features' => env('VIDEO_FEATURES', '/videos/features.mp4'),
    ],
];
