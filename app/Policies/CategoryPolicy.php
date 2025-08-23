<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CategoryPolicy
{
    public function viewAny(User $user): bool { return true; } // Can view all system categories, and own custom ones
    public function view(User $user, Category $category): bool {
        return $category->user_id === null || $user->id === $category->user_id; // System or owned
    }
    public function create(User $user): bool { return true; } // Can create custom categories
    public function update(User $user, Category $category): bool {
        return $user->id === $category->user_id; // Only update own custom categories
    }
    public function delete(User $user, Category $category): bool {
        return $user->id === $category->user_id; // Only delete own custom categories
    }
}