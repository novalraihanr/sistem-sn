<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines which domains are allowed to access your
    | application's resources via JavaScript in a browser.
    |
    | You may enable CORS for all origins and all HTTP methods. This is
    | useful during development, but you should restrict it in production.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8000', 'http://localhost:3000'], // Adjust this to your frontend URL

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
