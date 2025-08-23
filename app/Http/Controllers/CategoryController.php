<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Auth::user()->categories()
            ->withCount(['budgetItems'])
            ->get();

        return Inertia::render('Category/Index', [
            'categories' => $categories
        ]);
    }

    public function store(CategoryRequest $request)
    {
        $category = Auth::user()->categories()->create($request->validated());

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(CategoryRequest $request, Category $category)
    {
        if (!Auth::user()->can('update', $category)) {
            abort(403);
        }
        
        $category->update($request->validated());

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if (!Auth::user()->can('delete', $category)) {
            abort(403);
        }

        // Check if category has budget items
        if ($category->budgetItems()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category with existing budget items.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
