<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'projected_amount' => $this->projected_amount,
            'actual_amount' => $this->actual_amount, // Accessor
            'difference' => $this->difference, // Accessor
            'is_recurring' => $this->is_recurring,
            'notes' => $this->notes,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'transactions' => TransactionResource::collection($this->whenLoaded('transactions')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}