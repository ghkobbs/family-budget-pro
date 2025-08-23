<?php

namespace App\Http\Resources;

use App\Enums\CategoryType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection; // Ensure Collection is imported
use Illuminate\Support\Facades\Log;

class BudgetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Ensure budgetItems are loaded. If not, this might cause N+1 query issues
        // It's crucial that 'budgetItems.category' and 'budgetItems.transactions' are loaded in the controller.
        $rawBudgetItems = $this->whenLoaded('budgetItems'); // This is an Eloquent Collection

        // If no budget items, initialize an empty collection to prevent errors
        if (!$rawBudgetItems) {
            $rawBudgetItems = new Collection();
        }

        // Calculate summary values directly from the Eloquent Collection
        $incomeItems = $rawBudgetItems->filter(fn ($item) => $item->category->type === CategoryType::Income);
        $expenseItems = $rawBudgetItems->filter(fn ($item) => $item->category->type === CategoryType::Expense);

        $totalProjectedIncome = $incomeItems->sum('projected_amount');
        $totalActualIncome = $incomeItems->sum(fn ($item) => $item->actual_amount); // actual_amount is an accessor
        // Use 'amount' sum from transactions for actual for expenses, if not already rolled up in actual_amount accessor
        $totalProjectedExpense = $expenseItems->sum('projected_amount');
        $totalActualExpense = $expenseItems->sum(fn ($item) => $item->actual_amount); // actual_amount is an accessor

        $projectedBalance = $totalProjectedIncome - $totalProjectedExpense;
        $actualBalance = $totalActualIncome - $totalActualExpense;
        $balanceDifference = $projectedBalance - $actualBalance;

        // Now, transform the budget items into resources for the nested structure
        $budgetItemsResources = BudgetItemResource::collection($rawBudgetItems);


        // Group budget items by category for frontend display
        // We'll iterate over the *transformed resources* here
        $groupedItems = $budgetItemsResources->groupBy(fn ($item) => $item['category']['name'])
                                             ->map(function ($items, $categoryName) use ($rawBudgetItems) {
                                                // Find the original category from raw items to get its type correctly
                                                $firstRawItem = $rawBudgetItems->where('category.name', $categoryName)->first();
                                                $categoryType = $firstRawItem ? $firstRawItem->category->type : null;

                                                $categoryProjected = $items->sum('projected_amount');
                                                $categoryActual = $items->sum('actual_amount');
                                                $categoryDifference = $categoryProjected - $categoryActual;

                                                return [
                                                    'id' => $items->first()['category']['id'], // Use category ID from resource
                                                    'name' => $categoryName,
                                                    'type' => $categoryType, // Use the actual enum value
                                                    'projected_amount' => $categoryProjected,
                                                    'actual_amount' => $categoryActual,
                                                    'difference' => $categoryDifference,
                                                    'items' => $items->values()->toArray(),
                                                ];
                                            })
                                            ->values();

        $incomeCategories = $groupedItems->filter(fn($cat) => $cat['type'] === CategoryType::Income)->values();
        $expenseCategories = $groupedItems->filter(fn($cat) => $cat['type'] === CategoryType::Expense)->values();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'month_year' => $this->month_year->format('F Y'),
            'summary' => [
                'total_projected_income' => $totalProjectedIncome,
                'total_actual_income' => $totalActualIncome,
                'total_projected_expense' => $totalProjectedExpense,
                'total_actual_expense' => $totalActualExpense,
                'projected_balance' => $projectedBalance,
                'actual_balance' => $actualBalance,
                'balance_difference' => $balanceDifference,
            ],
            'income_categories' => $incomeCategories,
            'expense_categories' => $expenseCategories,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}