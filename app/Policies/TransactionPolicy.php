<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TransactionPolicy
{
    public function view(User $user, Transaction $transaction): bool { return $user->id === $transaction->budgetItem->budget->user_id; }
    public function create(User $user, BudgetItem $budgetItem): bool { return $user->id === $budgetItem->budget->user_id; } // When creating, check budget item owner
    public function update(User $user, Transaction $transaction): bool { return $user->id === $transaction->budgetItem->budget->user_id; }
    public function delete(User $user, Transaction $transaction): bool { return $user->id === $transaction->budgetItem->budget->user_id; }
}