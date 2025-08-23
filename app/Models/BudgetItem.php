<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'category_id',
        'name',
        'projected_amount',
        'is_recurring',
        'notes',
    ];

    protected $casts = [
        'projected_amount' => 'decimal:2',
        'is_recurring' => 'boolean',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // Accessor for calculated actual amount
    public function getActualAmountAttribute(): float
    {
        return $this->transactions()->sum('amount');
    }

    // Accessor for difference
    public function getDifferenceAttribute(): float
    {
        return $this->projected_amount - $this->actual_amount;
    }
}