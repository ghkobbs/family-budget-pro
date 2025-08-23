<?php

namespace App\Policies;

use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Log;

class BudgetItemPolicy
{
    public function view(User $user, BudgetItem $budgetItem): bool { return $user->id === $budgetItem->budget->user_id; }
    public function create(User $user, BudgetItem $budgetItem): bool {
			return $user->id === $budgetItem->budget->user_id; 
		} // When creating, check budget owner
    public function update(User $user, BudgetItem $budgetItem): bool { return $user->id === $budgetItem->budget->user_id; }
    public function delete(User $user, BudgetItem $budgetItem): bool { return $user->id === $budgetItem->budget->user_id; }
}