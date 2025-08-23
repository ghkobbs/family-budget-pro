<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransactionResource;
use App\Models\BudgetItem;
use App\Models\Transaction;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a list of transactions.
     */
    public function index(Request $request)
    {
        $query = Transaction::query()
            ->with(['budgetItem.category', 'budgetItem.budget'])
            ->whereHas('budgetItem.budget', function ($query) {
                $query->where('user_id', Auth::id());
            });

        // Apply filters
        if ($request->has('type')) {
            $query->whereHas('budgetItem.category', function ($q) use ($request) {
                $q->where('type', $request->type);
            });
        }

        if ($request->has('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        if ($request->has('category')) {
            $query->whereHas('budgetItem', function ($q) use ($request) {
                $q->where('category_id', $request->category);
            });
        }

        $transactions = $query
            ->orderBy('transaction_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return inertia('Transaction/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'date_from', 'date_to', 'category']),
            'categories' => Auth::user()->categories()->select('id', 'name', 'type')->get()
        ]);
    }

    /**
     * Store a new transaction for a budget item.
     */
    public function store(Request $request, BudgetItem $budgetItem): RedirectResponse
    {
        $this->authorize('create', $budgetItem);

        $validated = $request->validate([
            'amount' => 'required|numeric|gt:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:500',
        ]);

        // Determine transaction type based on the budget item's category type
        $transactionType = match ($budgetItem->category->type) {
            CategoryType::Income => TransactionType::Credit,
            CategoryType::Expense => TransactionType::Debit,
        };

        $budgetItem->transactions()->create([
            'amount' => $validated['amount'],
            'type' => $transactionType, // Use the determined enum value
            'transaction_date' => $validated['transaction_date'],
            'description' => $validated['description'],
        ]);

        return back(303);
    }

    /**
     * Update an existing transaction.
     */
    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorize('update', $transaction);

        $validated = $request->validate([
            'amount' => 'required|numeric|gt:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:500',
        ]);

        $transaction->update($validated);

        return back(303);
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Transaction $transaction): RedirectResponse
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();
        return back(303);
    }
}