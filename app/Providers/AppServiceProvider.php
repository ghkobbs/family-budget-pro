<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
				// Force HTTPS if the APP_ENV is 'production' OR
        // if the request is coming via Ngrok (or any proxy where you want HTTPS)
        if (
					$this->app->environment('production') ||
					// A common way to check for Ngrok is if the APP_URL is an ngrok URL
					// Or you can check specific headers like X-Forwarded-Proto
					str_contains(env('APP_URL'), 'ngrok')
			) {
					URL::forceScheme('https');
			}
    }
}
