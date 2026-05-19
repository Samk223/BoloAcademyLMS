<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Favicons -->
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon.png">
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
        <link rel="shortcut icon" href="/favicon.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png">
        <meta name="msapplication-TileImage" content="/favicon.png">
        <meta name="theme-color" content="#3D4F35">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="bg-[#FFF8E7] text-[#1E1E1E] selection:bg-[#E9D5FF] font-sans antialiased overflow-x-hidden">
        @inertia
    </body>
</html>
