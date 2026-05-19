<?php

$pusherHost = env('PUSHER_HOST');

return [
    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    */
    'default' => env('BROADCAST_CONNECTION', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Broadcast Connections
    |--------------------------------------------------------------------------
    */
    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => array_filter([
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'host' => $pusherHost ?: null,
                'port' => $pusherHost ? env('PUSHER_PORT', 443) : null,
                'scheme' => $pusherHost ? env('PUSHER_SCHEME', 'https') : null,
                'encrypted' => true,
                'useTLS' => env('PUSHER_SCHEME', 'https') === 'https',
            ], fn ($value) => $value !== null),
            'client_options' => [],
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],
    ],
];
