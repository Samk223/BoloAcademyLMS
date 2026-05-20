#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running migrations..."
php artisan migrate --force

echo "Checking if database needs seeding..."
php -r "
  require 'vendor/autoload.php';
  \$app = require_once 'bootstrap/app.php';
  \$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
  \$kernel->bootstrap();
  if (App\Models\User::count() === 0) {
      echo \"Database is empty. Seeding...\\n\";
      Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
      echo Illuminate\Support\Facades\Artisan::output();
  } else {
      echo \"Database already seeded.\\n\";
  }
"
