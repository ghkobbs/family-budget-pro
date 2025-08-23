// app/Providers/AuthServiceProvider.php
<?php

namespace App\Providers;

use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Category;
use App\Models\Transaction;
use App\Policies\BudgetPolicy;
use App\Policies\BudgetItemPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\TransactionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Budget::class => BudgetPolicy::class,
        BudgetItem::class => BudgetItemPolicy::class,
        Category::class => CategoryPolicy::class,
        Transaction::class => TransactionPolicy::class,
    ];

    public function boot(): void {}
}