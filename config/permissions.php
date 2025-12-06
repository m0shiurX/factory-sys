<?php

declare(strict_types=1);

return [
    'platform' => [
        'backups' => [
            'access_backup',
            'create_backup',
            'delete_backup',
            'restore_backup',
        ],
        'roles' => [
            'access_roles',
            'create_roles',
            'update_roles',
            'delete_roles',
        ],
        'users' => [
            'access_users',
            'create_users',
            'update_users',
            'delete_users',
        ],
        'appearance' => [
            'access_appearance',
            'update_appearance',
        ],
    ],
    'settings' => [
        'common' => [
            'general',
            'admin_appearance',
        ],
        'others' => [
            'analytics',
        ],
    ],
    'crud' => [],
];
