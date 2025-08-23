<?php
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ProfileController;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = Auth::user();

        // Get last month's budget with related data
        $previousBudget = Budget::with(['budgetItems.transactions', 'budgetItems.category'])
            ->where('user_id', $user->id)
						->whereMonth('month_year', now()->subMonth()->month)
						->whereYear('month_year', now()->subMonth()->year)
						->first();

        // Get current month's budget with related data
        $currentBudget = Budget::with(['budgetItems.transactions', 'budgetItems.category'])
            ->where('user_id', $user->id)
            ->whereMonth('month_year', now()->month)
            ->whereYear('month_year', now()->year)
            ->first();

				$incomeTrendValue = null;
				$expenseTrendValue = null;
				$netBalanceTrendValue = null;

				// Calculate income trend
				if ($previousBudget && $currentBudget) {
					$previousIncome = $previousBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'income')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					$currentIncome = $currentBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'income')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					if ($previousIncome > 0) {
						$incomeTrendValue = round((($currentIncome - $previousIncome) / abs($previousIncome)) * 100, 2);
					} elseif ($currentIncome > 0) {
						$incomeTrendValue = 100; // From 0 to some income is a 100% increase
					} else {
						$incomeTrendValue = 0; // No change
					}
				}

				// Calculate expense trend
				if ($previousBudget && $currentBudget) {
					$previousExpense = $previousBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'expense')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					$currentExpense = $currentBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'expense')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					if ($previousExpense > 0) {
						$expenseTrendValue = round((($currentExpense - $previousExpense) / abs($previousExpense)) * 100, 2);
					} elseif ($currentExpense > 0) {
						$expenseTrendValue = 100; // From 0 to some expense is a 100% increase
					} else {
						$expenseTrendValue = 0; // No change
					}
				}

				// Calculate net balance trend
				if ($previousBudget && $currentBudget) {
					$previousIncome = $previousBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'income')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					$previousExpense = $previousBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'expense')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					$currentIncome = $currentBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'income')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					$currentExpense = $currentBudget->budgetItems
						->filter(fn($item) => $item->category?->type?->value === 'expense')
						->reduce(fn($total, $item) => $total + $item->transactions->sum('amount'), 0);
					$previousNet = $previousIncome - $previousExpense;
					$currentNet = $currentIncome - $currentExpense;
					if ($previousNet > 0) {
						$netBalanceTrendValue = round((($currentNet - $previousNet) / abs($previousNet)) * 100, 2);
					} elseif ($currentNet > 0) {
						$netBalanceTrendValue = 100; // From 0 to some net balance is a 100% increase
					} else {
						$netBalanceTrendValue = 0; // No change
					}
				}

        if ($currentBudget) {
            Log::info('Budget Items:', ['items' => $currentBudget->budgetItems->toArray()]);
            
            // Calculate summary
            $totalActualIncome = $currentBudget->budgetItems
                ->filter(function ($item) {
                    return $item->category?->type?->value === 'income';
                })
                ->reduce(function ($total, $item) {
                    $transactionSum = $item->transactions->sum('amount');
                    Log::info('Income item', [
                        'item' => $item->name,
                        'category' => $item->category?->name,
                        'type' => $item->category?->type?->value,
                        'transactions_sum' => $transactionSum
                    ]);
                    return $total + $transactionSum;
                }, 0);

            $totalActualExpense = $currentBudget->budgetItems
                ->filter(function ($item) {
                    return $item->category?->type?->value === 'expense';
                })
                ->reduce(function ($total, $item) {
                    $transactionSum = $item->transactions->sum('amount');
                    Log::info('Expense item', [
                        'item' => $item->name,
                        'category' => $item->category?->name,
                        'type' => $item->category?->type?->value,
                        'transactions_sum' => $transactionSum
                    ]);
                    return $total + $transactionSum;
                }, 0);

            $totalProjectedExpense = $currentBudget->budgetItems
                ->filter(function ($item) {
                    return $item->category?->type?->value === 'expense';
                })
                ->sum('projected_amount');

            // Group items by category for the dashboard
            $expenseCategories = $currentBudget->budgetItems
                ->filter(function ($item) {
                    return $item->category?->type?->value === 'expense';
                })
                ->groupBy('category_id')
                ->map(function ($items) {
                    $category = $items->first()->category;
                    $actualAmount = $items->reduce(function ($total, $item) {
                        $sum = $item->transactions->sum('amount');
                        Log::info('Category item transactions', [
                            'item' => $item->name,
                            'category' => $item->category?->name,
                            'transactions_sum' => $sum
                        ]);
                        return $total + $sum;
                    }, 0);
                    
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'actual_amount' => $actualAmount,
                        'projected_amount' => $items->sum('projected_amount'),
                    ];
                })
                ->values();

            $currentBudget = [
                'id' => $currentBudget->id,
                'summary' => [
                    'total_actual_income' => [
											"value" => $totalActualIncome,
											"trendValue" => $incomeTrendValue
										],
                    'total_actual_expense' => [
											"value" => $totalActualExpense,
											"trendValue" => $expenseTrendValue
										],
                    'budget_utilization' => [
											"value" => $totalProjectedExpense > 0 ? 
                        ($totalActualExpense / $totalProjectedExpense) * 100 : 0
										],
										'net_balance' => [
												"value" => $totalActualIncome - $totalActualExpense,
												"trendValue" => $netBalanceTrendValue
										]
                ],
                'expense_categories' => $expenseCategories
            ];
        }

        // Get recent transactions with type
        $recentTransactions = Transaction::with(['budgetItem.category'])
            ->whereHas('budgetItem.budget', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'amount' => $transaction->amount,
                    'description' => $transaction->description,
                    'transaction_date' => $transaction->transaction_date,
                    'type' => $transaction->budgetItem->category->type,
                    'budget_item' => [
                        'id' => $transaction->budgetItem->id,
                        'name' => $transaction->budgetItem->name,
                    ],
                ];
            });

        return Inertia::render('Dashboard', [
            'currentBudget' => $currentBudget,
            'recentTransactions' => $recentTransactions
        ]);
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Budget Routes
    Route::prefix('budgets')->name('budgets.')->group(function () {
        Route::get('/', [BudgetController::class, 'index'])->name('index');
        Route::get('/{budget}', [BudgetController::class, 'show'])->name('show');
        Route::post('/', [BudgetController::class, 'store'])->name('store');

        // Budget Items
        Route::post('/{budget}/items', [BudgetController::class, 'addItem'])->name('items.store');
        Route::put('/items/{budgetItem}', [BudgetController::class, 'updateItem'])->name('items.update');
        Route::delete('/items/{budgetItem}', [BudgetController::class, 'destroyItem'])->name('items.destroy');
    });

    // Categories
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');
        Route::post('/', [CategoryController::class, 'store'])->name('store');
        Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
    });

    // Transactions
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::post('/{budgetItem}', [TransactionController::class, 'store'])->name('store');
        Route::put('/{transaction}', [TransactionController::class, 'update'])->name('update');
        Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__.'/auth.php';