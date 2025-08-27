import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Assuming you install FA
import { faPlus, faEdit, faTrash, faClipboardList, faRecycle } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import { Toaster, toast } from 'sonner';

// Helper for currency formatting
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

function BudgetSummary({ summary }) {
    const balanceDifferenceClass = clsx(
        'font-bold',
        summary.balance_difference < 0 ? 'text-red-600' : 'text-green-600'
    );

    return (
        <div className="bg-white p-4 shadow-sm rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-3">Monthly Family Budget Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                <div>
                    <p>Projected Income:</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(summary.total_projected_income)}</p>
                </div>
                <div>
                    <p>Actual Income:</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(summary.total_actual_income)}</p>
                </div>
                 <div>
                    <p>Projected Expenses:</p>
                    <p className="text-lg font-bold text-red-700">{formatCurrency(summary.total_projected_expense)}</p>
                </div>
                <div>
                    <p>Actual Expenses:</p>
                    <p className="text-lg font-bold text-red-700">{formatCurrency(summary.total_actual_expense)}</p>
                </div>
            </div>

            <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-2">Balance Overview</h4>
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                    <div>
                        <p>Projected Balance:</p>
                        <p className="text-xl font-bold">{formatCurrency(summary.projected_balance)}</p>
                    </div>
                    <div>
                        <p>Actual Balance:</p>
                        <p className="text-xl font-bold">{formatCurrency(summary.actual_balance)}</p>
                    </div>
                    <div>
                        <p>Balance Difference:</p>
                        <p className={balanceDifferenceClass}>
                            {summary.balance_difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(summary.balance_difference))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddBudgetItemModal({ show, onClose, budgetId, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        category_id: '',
        name: '',
        projected_amount: 0,
        is_recurring: false,
        notes: '',
    });

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    const submit = (e) => {
        e.preventDefault();
        post(route('budgets.items.store', budgetId), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Budget Item</h2>

                <div className="mt-4">
                    <label htmlFor="item_category_id" className="block font-medium text-sm text-gray-700">Category</label>
                    <select
                        id="item_category_id"
                        value={data.category_id}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => setData('category_id', e.target.value)}
                    >
                        <option value="">Select a Category</option>
                        <optgroup label="Income">
                            {incomeCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </optgroup>
                         <optgroup label="Expenses">
                            {expenseCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </optgroup>
                    </select>
                    <InputError message={errors.category_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label htmlFor="item_name" className="block font-medium text-sm text-gray-700">Item Name</label>
                    <TextInput
                        id="item_name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label htmlFor="item_projected_amount" className="block font-medium text-sm text-gray-700">Projected Amount</label>
                    <TextInput
                        id="item_projected_amount"
                        type="number"
                        step="0.01"
                        className="mt-1 block w-full"
                        value={data.projected_amount}
                        onChange={(e) => setData('projected_amount', e.target.value)}
                    />
                    <InputError message={errors.projected_amount} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_recurring"
                            checked={data.is_recurring}
                            onChange={(e) => setData('is_recurring', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Recurring Item</span>
                    </label>
                    <InputError message={errors.is_recurring} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label htmlFor="item_notes" className="block font-medium text-sm text-gray-700">Notes</label>
                    <textarea
                        id="item_notes"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    ></textarea>
                    <InputError message={errors.notes} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton className="ml-3" disabled={processing}>Add Item</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}


function TransactionModal({ show, onClose, budgetItem, type }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        amount: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        description: '',
    });
    const [isEdit, setIsEdit] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState(null);

    useEffect(() => {
        if (!show) {
            reset();
            setIsEdit(false);
            setEditingTransactionId(null);
        }
    }, [show]);

    const handleEditClick = (transaction) => {
        setIsEdit(true);
        setEditingTransactionId(transaction.id);
        setData({
            amount: transaction.amount,
            transaction_date: transaction.transaction_date,
            description: transaction.description || '',
        });
    };

    const handleNewTransactionClick = () => {
        setIsEdit(false);
        setEditingTransactionId(null);
        reset();
    };


    const submitTransaction = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'transactions.update' : 'transactions.store';
        const routeParams = isEdit ? editingTransactionId : budgetItem.id;
        const action = isEdit ? 'updated' : 'added';

        const method = isEdit ? put : post;
        
        toast.promise(
            method(route(routeName, routeParams), {
                preserveScroll: true,
                data: {
                    ...data,
                    budget_id: budgetItem.budget_id
                },
                onSuccess: () => {
                    reset();
                    setIsEdit(false);
                    setEditingTransactionId(null);
                },
            }),
            {
                loading: `${isEdit ? 'Updating' : 'Adding'} transaction...`,
                success: `Transaction ${action} successfully!`,
                error: `Error ${isEdit ? 'updating' : 'adding'} transaction.`,
            }
        );
    };

    const deleteTransaction = (transactionId) => {
        toast((t) => (
            <div>
                <p className="mb-2">Are you sure you want to delete this transaction?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.promise(
                                router.delete(route('transactions.destroy', transactionId), {
                                    preserveScroll: true
                                }),
                                {
                                    loading: 'Deleting transaction...',
                                    success: 'Transaction deleted successfully!',
                                    error: 'Error deleting transaction.'
                                }
                            );
                            toast.dismiss(t.id);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{budgetItem.name} Transactions</h2>

                <form onSubmit={submitTransaction} className="border-b pb-4 mb-4">
                    <h3 className="font-semibold mb-2">{isEdit ? 'Edit Transaction' : 'Add New Transaction'}</h3>
                    <div>
                        <label htmlFor="amount" className="block font-medium text-sm text-gray-700">Amount</label>
                        <TextInput
                            id="amount"
                            type="number"
                            step="0.01"
                            className="mt-1 block w-full"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            required
                        />
                        <InputError message={errors.amount} className="mt-2" />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="transaction_date" className="block font-medium text-sm text-gray-700">Date</label>
                        <TextInput
                            id="transaction_date"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.transaction_date}
                            onChange={(e) => setData('transaction_date', e.target.value)}
                            required
                        />
                        <InputError message={errors.transaction_date} className="mt-2" />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="description" className="block font-medium text-sm text-gray-700">Description</label>
                        <textarea
                            id="description"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        ></textarea>
                        <InputError message={errors.description} className="mt-2" />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <SecondaryButton type="button" onClick={handleNewTransactionClick} className="mr-2">New</SecondaryButton>
                        <PrimaryButton disabled={processing}>{isEdit ? 'Update' : 'Add'}</PrimaryButton>
                    </div>
                </form>

                <h3 className="font-semibold mb-2 mt-4">Transaction History</h3>
                {budgetItem.transactions && budgetItem.transactions.length > 0 ? (
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {budgetItem.transactions.map(transaction => (
                            <li key={transaction.id} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatCurrency(transaction.amount)} ({transaction.transaction_date})
                                    </p>
                                    <p className="text-xs text-gray-500">{transaction.description}</p>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => handleEditClick(transaction)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteTransaction(transaction.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No transactions recorded yet.</p>
                )}

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}

function BudgetItemRow({ item, budgetId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        projected_amount: item.projected_amount,
        is_recurring: item.is_recurring,
        notes: item.notes || '',
    });

    // Update form data if item prop changes (e.g., after save/refresh)
    useEffect(() => {
        setData({
            projected_amount: item.projected_amount,
            is_recurring: item.is_recurring,
            notes: item.notes || '',
        });
    }, [item]);


    const submitUpdate = () => {
        toast.promise(
            put(route('budgets.items.update', item.id), {
                preserveScroll: true,
                onSuccess: () => setIsEditing(false),
                onError: (err) => console.error('Error updating budget item:', err),
            }),
            {
                loading: 'Updating budget item...',
                success: 'Budget item updated successfully!',
                error: 'Error updating budget item.'
            }
        );
    };

    const deleteItem = () => {
        toast((t) => (
            <div>
                <p className="mb-2">Are you sure you want to delete this budget item?</p>
                <p className="text-sm text-red-500 mb-2">All associated transactions will also be deleted.</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.promise(
                                router.delete(route('budgets.items.destroy', item.id), {
                                    preserveScroll: true
                                }),
                                {
                                    loading: 'Deleting budget item...',
                                    success: 'Budget item deleted successfully!',
                                    error: 'Error deleting budget item.'
                                }
                            );
                            toast.dismiss(t.id);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    const differenceClass = clsx(
        'font-medium',
        item.difference < 0 ? 'text-red-600' : 'text-green-600'
    );

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {isEditing ? (
                    <TextInput
                        type="number"
                        step="0.01"
                        value={data.projected_amount}
                        onChange={(e) => setData('projected_amount', e.target.value)}
                        className="w-24 text-right"
                    />
                ) : (
                    formatCurrency(item.projected_amount)
                )}
                 <InputError message={errors.projected_amount} className="mt-2" />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(item.actual_amount)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={differenceClass}>
                    {item.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.difference))}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {isEditing ? (
                    <input
                        type="checkbox"
                        checked={data.is_recurring}
                        onChange={(e) => setData('is_recurring', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                ) : (
                    item.is_recurring ? <FontAwesomeIcon icon={faRecycle} className="text-gray-500" /> : '-'
                )}
            </td>
             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[150px] overflow-hidden text-ellipsis">
                {isEditing ? (
                    <textarea
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm resize-y"
                        rows="1"
                    ></textarea>
                ) : (
                    item.notes || '-'
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {isEditing ? (
                    <>
                        <PrimaryButton onClick={submitUpdate} disabled={processing}>Save</PrimaryButton>
                        <SecondaryButton onClick={() => setIsEditing(false)} className="ml-2">Cancel</SecondaryButton>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Edit Item"
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                         <button
                            onClick={() => setShowTransactionModal(true)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Add/View Transactions"
                        >
                            <FontAwesomeIcon icon={faClipboardList} />
                        </button>
                        <button
                            onClick={deleteItem}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Item"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </>
                )}
            </td>
            <TransactionModal
                show={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                budgetItem={item}
                type={item.category.type}
            />
        </tr>
    );
}

function BudgetCategorySection({ category, budgetId }) {
    const categoryDifferenceClass = clsx(
        'font-bold',
        category.difference < 0 ? 'text-red-600' : 'text-green-600'
    );

    // Sort items by name for consistent display
    const sortedItems = useMemo(() => {
        return [...category.items].sort((a, b) => a.name.localeCompare(b.name));
    }, [category.items]);


    return (
        <div className="bg-white p-4 shadow-sm rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-3">{category.name}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedItems.map((item) => (
                            <BudgetItemRow key={item.id} item={item} budgetId={budgetId} />
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-bold">
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">Total {category.name}</td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(category.projected_amount)}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(category.actual_amount)}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                <span className={categoryDifferenceClass}>
                                    {category.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(category.difference))}
                                </span>
                            </td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

export default function BudgetIndex({ auth, budgets, selectedBudget, categories }) {
	const [showAddItemModal, setShowAddItemModal] = useState(false);
	
		const currentMonthYear = new Date(selectedBudget.data.month_year + '-01'); // Ensure date parsing is correct
		const nextMonth = new Date(currentMonthYear.getFullYear(), currentMonthYear.getMonth() + 1, 1);
		const nextMonthDate = nextMonth.toISOString().slice(0, 10); // YYYY-MM-DD
	
    const { data, post, processing } = useForm({
        month_year: nextMonthDate
		});
	
    const createNextMonthBudget = () => {
			if (!selectedBudget) return;
        
        toast.promise(
            post(route('budgets.store'), {
							onSuccess: () => {
									toast.success('Next month\'s budget created successfully!');
                },
							onError: (err) => {
									toast.error(err.month_year || 'Error creating next month\'s budget.');
                }
            }),
            {
                loading: 'Creating next month\'s budget...'
            }
        );
    };

    if (!selectedBudget) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Monthly Budget</h2>}
            >
                <Head title="Monthly Budget" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-900 text-center">
                            <p className="mb-4">No budget found for this user.</p>
                            <PrimaryButton onClick={() => createNextMonthBudget()} disabled={processing}>
                                Create First Budget (Current Month)
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }
    // Sort categories alphabetically for consistent display
    const sortedExpenseCategories = useMemo(() => {
        return [...selectedBudget.data.expense_categories].sort((a, b) => a.name.localeCompare(b.name));
    }, [selectedBudget.data.expense_categories]);

    // Income is often a single block, but could be multiple if needed.
    // For now, let's keep it as a distinct block.
    const sortedIncomeCategories = useMemo(() => {
        return [...selectedBudget.data.income_categories].sort((a, b) => a.name.localeCompare(b.name));
    }, [selectedBudget.data.income_categories]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Monthly Budget</h2>}
        >
            <Toaster position="top-right" richColors />
            <Head title="Monthly Budget" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-900 mb-6 flex flex-col sm:flex-row justify-between items-center">
                        <h1 className="text-2xl font-bold mb-4 sm:mb-0">{selectedBudget.data.name}</h1>
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <label htmlFor="budget-selector" className="sr-only">Select Budget</label>
                                <select
                                    id="budget-selector"
                                    onChange={(e) => router.get(route('budgets.show', e.target.value))}
                                    value={selectedBudget.data.id}
                                    className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    {budgets.map((budget) => (
                                        <option key={budget.id} value={budget.id}>
                                            {budget.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            <PrimaryButton onClick={createNextMonthBudget} disabled={processing} className="w-full sm:w-auto">
                                Create Next Month's Budget
                            </PrimaryButton>
                             <SecondaryButton onClick={() => setShowAddItemModal(true)} className="w-full sm:w-auto">
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Item
                            </SecondaryButton>
                        </div>
                    </div>

                    <BudgetSummary summary={selectedBudget.data.summary} />

                    <div className="grid grid-cols-1 gap-6">
                        {/* Income Section */}
                        {sortedIncomeCategories.map((category) => (
                            <BudgetCategorySection
                                key={category.id}
                                category={category}
                                budgetId={selectedBudget.data.id}
                            />
                        ))}

                        {/* Expense Sections */}
                        {sortedExpenseCategories.map((category) => (
                            <BudgetCategorySection
                                key={category.id}
                                category={category}
                                budgetId={selectedBudget.data.id}
                            />
                        ))}
                    </div>

                </div>
            </div>
            <AddBudgetItemModal
                show={showAddItemModal}
                onClose={() => setShowAddItemModal(false)}
                budgetId={selectedBudget.data.id}
                categories={categories.data}
            />
        </AuthenticatedLayout>
    );
}