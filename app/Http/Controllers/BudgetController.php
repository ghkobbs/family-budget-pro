<?php

namespace App\Http\Controllers;

use App\Enums\CategoryType;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\CategoryResource;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class BudgetController extends Controller
{
		use AuthorizesRequests;
    /**
     * Display a listing of the user's budgets and the selected one.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $budgetsQuery = $user->budgets()->orderBy('month_year', 'desc');

        // Check if there are any budgets. If not, create a default one.
        if (!$budgetsQuery->exists()) {
            $this->createNewBudget($user, Carbon::now()->startOfMonth());
        }

        $allBudgets = $budgetsQuery->get();
        $selectedBudget = $allBudgets->first(); // Default to the latest budget

        // Load relations for the selected budget
        if ($selectedBudget) {
            $selectedBudget->load([
                'budgetItems.category',
                'budgetItems.transactions' => function ($query) {
                    $query->orderBy('transaction_date', 'desc');
                }
            ]);
        }
				
        return Inertia::render('Budget/Index', [
            'budgets' => $allBudgets->map(fn ($b) => ['id' => $b->id, 'name' => $b->name, 'month_year' => $b->month_year->format('Y-m-d')]),
            'selectedBudget' => $selectedBudget ? new BudgetResource($selectedBudget) : null,
            'categories' => CategoryResource::collection(Category::whereNull('user_id')->orWhere('user_id', $user->id)->get()),
        ]);
    }

    /**
     * Show a specific budget.
     */
    public function show(Budget $budget): Response
    {
        $this->authorize('view', $budget);

        $budget->load([
            'budgetItems.category',
            'budgetItems.transactions' => function ($query) {
                $query->orderBy('transaction_date', 'desc');
            }
        ]);

        return Inertia::render('Budget/Index', [
            'budgets' => Auth::user()->budgets()->orderBy('month_year', 'desc')->get()->map(fn ($b) => ['id' => $b->id, 'name' => $b->name, 'month_year' => $b->month_year->format('Y-m-d')]),
            'selectedBudget' => BudgetResource::make($budget),
            'categories' => CategoryResource::collection(Category::whereNull('user_id')->orWhere('user_id', Auth::id())->get()),
        ]);
    }

    /**
     * Create a new budget for a specific month (e.g., "Create next month's budget").
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month_year' => 'required|date_format:Y-m-d',
        ]);

        $monthYear = Carbon::parse($validated['month_year'])->startOfMonth();
        $user = Auth::user();

        // Prevent duplicate budgets for the same month and user
        if ($user->budgets()->where('month_year', $monthYear)->exists()) {
            return back()->withErrors(['month_year' => 'A budget for this month already exists.']);
        }

        $budget = $this->createNewBudget($user, $monthYear);

        return redirect()->route('budgets.show', $budget->id)->with('success', 'Budget created successfully!');
    }

    /**
     * Update a specific budget item's projected amount or recurring status.
     */
    public function updateItem(Request $request, BudgetItem $budgetItem): RedirectResponse
    {
        $this->authorize('update', $budgetItem);

        $validated = $request->validate([
            'projected_amount' => 'required|numeric|min:0',
            'is_recurring' => 'boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        $budgetItem->update($validated);

        return back(303); // Redirect back with 303 for Inertia
    }

    /**
     * Add a new budget item to the current budget.
     */
    public function addItem(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorize('update', $budget); // User must own the budget to add items

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'projected_amount' => 'numeric|min:0',
            'is_recurring' => 'boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        $category = Category::findOrFail($validated['category_id']);
        $this->authorize('view', $category); // Ensure user can view/use this category

        $budget->budgetItems()->create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'projected_amount' => $validated['projected_amount'] ?? 0,
            'is_recurring' => $validated['is_recurring'] ?? false,
            'notes' => $validated['notes'],
        ]);

        return back(303);
    }

    /**
     * Delete a budget item.
     */
    public function destroyItem(BudgetItem $budgetItem): RedirectResponse
    {
        $this->authorize('delete', $budgetItem);
        $budgetItem->delete();
        return back(303);
    }

    /**
     * Helper to create a new budget and populate it.
     */
    private function createNewBudget(User $user, Carbon $monthYear): Budget
    {
        $budget = $user->budgets()->create([
            'name' => $monthYear->format('F Y') . ' Budget',
            'month_year' => $monthYear,
        ]);

        // Attempt to copy from the previous month's budget
        $previousMonth = $monthYear->copy()->subMonth()->startOfMonth();
        $previousBudget = $user->budgets()->where('month_year', $previousMonth)->first();

        if ($previousBudget) {
            foreach ($previousBudget->budgetItems()->where('is_recurring', true)->get() as $item) {
                $budget->budgetItems()->create([
                    'category_id' => $item->category_id,
                    'name' => $item->name,
                    'projected_amount' => $item->projected_amount,
                    'is_recurring' => $item->is_recurring,
                    'notes' => $item->notes,
                ]);
            }
        } else {
            // Populate from default template if no previous budget
            $this->populateBudgetFromTemplate($budget);
        }

        return $budget;
    }

    /**
     * Populates a budget with default items based on system categories.
     */
    private function populateBudgetFromTemplate(Budget $budget): void
    {
        $systemCategories = Category::whereNull('user_id')->get();

        $itemTemplates = [
            'Income' => ['Income 1', 'Income 2', 'Extra Income'],
            'Housing' => ['Mortgage or rent', 'Phone', 'Electricity', 'Gas', 'Water and sewer', 'Cable', 'Waste removal', 'Maintenance or repairs', 'Supplies', 'Other Housing'],
            'Transportation' => ['Vehicle 1 payment', 'Fuel', 'Insurance', 'Maintenance'],
            'Food' => ['Groceries', 'Dining out'],
            'Insurance' => ['Home Insurance', 'Health Insurance', 'Life Insurance'],
            'Loans' => ['Personal Loan', 'Student Loan', 'Credit card 1'],
            'Children' => ['School tuition', 'Child care', 'Toys/games'],
            'Entertainment' => ['Streaming apps', 'Movies', 'Concerts'],
            'Taxes' => ['Federal Tax', 'State Tax'],
            'Personal care' => ['Hair/nails', 'Clothing (Personal)', 'Health club'],
            'Pets' => ['Pet Food', 'Pet Medical'],
            'Savings/Investments' => ['Retirement account', 'Investment account'],
            'Gifts and donations' => ['Charity 1'],
            'Legal' => ['Attorney fees', 'Alimony']
        ];

        foreach ($itemTemplates as $categoryName => $items) {
            $category = $systemCategories->firstWhere('name', $categoryName);
            if ($category) {
                foreach ($items as $itemName) {
                    $budget->budgetItems()->firstOrCreate(
                        ['category_id' => $category->id, 'name' => $itemName],
                        ['projected_amount' => 0.00, 'is_recurring' => false]
                    );
                }
            }
        }
    }
}