<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Category;
use App\Models\User;
use App\Enums\TransactionType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CategoryAndBudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure a user exists
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => Hash::make('password')]
        );

        // Define default categories
        $defaultCategories = [
            CategoryType::Income->value => [
                'Income 1', 'Income 2', 'Extra Income',
            ],
            CategoryType::Expense->value => [
                'Housing' => [
                    'Mortgage or rent', 'Second mortgage or rent', 'Phone', 'Electricity', 'Gas',
                    'Water and sewer', 'Cable', 'Waste removal', 'Maintenance or repairs', 'Supplies', 'Other Housing',
                ],
                'Transportation' => [
                    'Vehicle 1 payment', 'Vehicle 2 payment', 'Bus/taxi fare', 'Insurance', 'Licensing',
                    'Fuel', 'Maintenance', 'Other Transportation',
                ],
                'Insurance' => [
                    'Home Insurance', 'Health Insurance', 'Life Insurance', 'Other Insurance',
                ],
                'Food' => [
                    'Groceries', 'Dining out', 'Other Food',
                ],
                'Children' => [
                    'Medical (Children)', 'Clothing (Children)', 'School tuition', 'School supplies',
                    'Organization dues/fees', 'Lunch money', 'Child care', 'Toys/games', 'Other Children',
                ],
                'Legal' => [
                    'Attorney fees', 'Alimony', 'Payments', 'Other Legal',
                ],
                'Loans' => [
                    'Personal Loan', 'Student Loan', 'Credit card 1', 'Credit card 2', 'Credit card 3', 'Other Loans',
                ],
                'Entertainment' => [
                    'Streaming apps', 'Online games', 'Movies', 'Concerts', 'Sporting events',
                    'Live theater', 'Other Entertainment',
                ],
                'Taxes' => [
                    'Federal Tax', 'State Tax', 'Local Tax', 'Other Taxes',
                ],
                'Personal care' => [
                    'Medical (Personal)', 'Hair/nails', 'Clothing (Personal)', 'Dry cleaning',
                    'Health club', 'Organization dues/fees', 'Other Personal Care',
                ],
                'Pets' => [
                    'Pet Food', 'Pet Medical', 'Pet Grooming', 'Pet Toys', 'Other Pets',
                ],
                'Savings/Investments' => [
                    'Retirement account', 'Investment account', 'College Savings', 'Other Investments',
                ],
                'Gifts and donations' => [
                    'Charity 1', 'Charity 2', 'Charity 3', 'Other Gifts/Donations',
                ],
            ],
        ];

        // --- Create categories ---
        $incomeCategory = Category::firstOrCreate(
            ['name' => 'Income', 'type' => CategoryType::Income->value, 'user_id' => null]
        );
        $expenseCategories = [];
        foreach ($defaultCategories[CategoryType::Expense->value] as $catName => $items) {
             $expenseCategories[$catName] = Category::firstOrCreate(
                ['name' => $catName, 'type' => CategoryType::Expense->value, 'user_id' => null]
            );
        }


        // Create a default budget for the current month
        $currentMonth = now()->startOfMonth();
        $budget = Budget::firstOrCreate(
            [
                'user_id' => $user->id,
                'month_year' => $currentMonth,
            ],
            [
                'name' => $currentMonth->format('F Y') . ' Budget',
            ]
        );

        // Populate Budget Items
        foreach ($defaultCategories as $type => $categories) {
            if ($type === CategoryType::Income->value) {
                foreach ($categories as $incomeItemName) {
                    BudgetItem::firstOrCreate(
                        [
                            'budget_id' => $budget->id,
                            'category_id' => $incomeCategory->id,
                            'name' => $incomeItemName,
                        ],
                        [
                            'projected_amount' => 0.00,
                            'is_recurring' => true,
                        ]
                    );
                }
            } else { // Expense categories
                foreach ($categories as $catName => $items) {
                    $category = $expenseCategories[$catName];
                    foreach ($items as $itemName) {
                        BudgetItem::firstOrCreate(
                            [
                                'budget_id' => $budget->id,
                                'category_id' => $category->id,
                                'name' => $itemName,
                            ],
                            [
                                'projected_amount' => 0.00,
                                'is_recurring' => false, // Default to not recurring, can be changed
                            ]
                        );
                    }
                }
            }
        }

        // Example transactions for initial view
        $housingRent = BudgetItem::where('budget_id', $budget->id)
                                ->whereHas('category', fn($q) => $q->where('name', 'Housing'))
                                ->where('name', 'Mortgage or rent')
                                ->first();

        if ($housingRent) {
            $housingRent->update(['projected_amount' => 1000.00, 'is_recurring' => true]);
            $housingRent->transactions()->create([
                'amount' => 1000.00,
                'type' => TransactionType::Debit, // Corrected: expense category -> debit transaction
                'transaction_date' => $currentMonth->format('Y-m-10'),
                'description' => 'Monthly Rent Payment',
            ]);
        }

        $phoneBill = BudgetItem::where('budget_id', $budget->id)
                                ->whereHas('category', fn($q) => $q->where('name', 'Housing'))
                                ->where('name', 'Phone')
                                ->first();

        if ($phoneBill) {
            $phoneBill->update(['projected_amount' => 62.00, 'is_recurring' => true]);
            $phoneBill->transactions()->create([
                'amount' => 100.00,
                'type' => TransactionType::Debit, // Corrected: expense category -> debit transaction
                'transaction_date' => $currentMonth->format('Y-m-15'),
                'description' => 'Phone Bill - Exceeded data plan',
            ]);
        }
        $electricity = BudgetItem::where('budget_id', $budget->id)
                                ->whereHas('category', fn($q) => $q->where('name', 'Housing'))
                                ->where('name', 'Electricity')
                                ->first();

        if ($electricity) {
            $electricity->update(['projected_amount' => 44.00]);
            $electricity->transactions()->create([
                'amount' => 125.00,
                'type' => TransactionType::Debit, // Corrected: expense category -> debit transaction
                'transaction_date' => $currentMonth->format('Y-m-20'),
                'description' => 'Electricity bill - AC ran too much',
            ]);
        }

        $income1 = BudgetItem::where('budget_id', $budget->id)
                             ->whereHas('category', fn($q) => $q->where('name', 'Income'))
                             ->where('name', 'Income 1')
                             ->first();
        if ($income1) {
            $income1->update(['projected_amount' => 4000.00]);
            $income1->transactions()->create([
                'amount' => 4000.00,
                'type' => TransactionType::Credit, // Corrected: income category -> credit transaction
                'transaction_date' => $currentMonth->format('Y-m-01'),
                'description' => 'Monthly Salary',
            ]);
        }

        $income2 = BudgetItem::where('budget_id', $budget->id)
                             ->whereHas('category', fn($q) => $q->where('name', 'Income'))
                             ->where('name', 'Income 2')
                             ->first();
        if ($income2) {
            $income2->update(['projected_amount' => 1200.00]);
            $income2->transactions()->create([
                'amount' => 1200.00,
                'type' => TransactionType::Credit, // Corrected: income category -> credit transaction
                'transaction_date' => $currentMonth->format('Y-m-15'),
                'description' => 'Side Gig Pay',
            ]);
        }

         $extraIncome = BudgetItem::where('budget_id', $budget->id)
                             ->whereHas('category', fn($q) => $q->where('name', 'Income'))
                             ->where('name', 'Extra Income')
                             ->first();
        if ($extraIncome) {
            $extraIncome->update(['projected_amount' => 300.00]);
            $extraIncome->transactions()->create([
                'amount' => 300.00,
                'type' => TransactionType::Credit, // Corrected: income category -> credit transaction
                'transaction_date' => $currentMonth->format('Y-m-25'),
                'description' => 'Freelance work',
            ]);
        }

    }
}