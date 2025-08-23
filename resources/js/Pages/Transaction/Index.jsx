import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faFilter } from '@fortawesome/free-solid-svg-icons';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { router } from '@inertiajs/react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function Index({ auth, transactions, filters, categories }) {
    const [showFilters, setShowFilters] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filterData, setFilterData] = useState({
        type: filters.type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        category: filters.category || '',
    });

    const applyFilters = () => {
        router.get(route('transactions.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData({
            type: '',
            date_from: '',
            date_to: '',
            category: '',
        });
        router.get(route('transactions.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilters(false);
    };

    const handleDelete = (transaction) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            router.delete(route('transactions.destroy', transaction.id));
        }
    };

    const updateTransaction = (e) => {
        e.preventDefault();
        router.put(route('transactions.update', editingTransaction.id), editingTransaction, {
            onSuccess: () => setEditingTransaction(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Transactions</h2>}
        >
            <Head title="Transactions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">All Transactions</h3>
                                <SecondaryButton onClick={() => setShowFilters(true)}>
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Filters
                                </SecondaryButton>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Item</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.data.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(transaction.transaction_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {transaction.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        transaction.budget_item.category.type === 'income' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {transaction.budget_item.category.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {transaction.budget_item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={transaction.budget_item.category.type === 'income' 
                                                        ? 'text-green-600' 
                                                        : 'text-red-600'
                                                    }>
                                                        {transaction.budget_item.category.type === 'income' ? '+' : '-'}
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => setEditingTransaction(transaction)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transaction)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="mt-4">
                                    {transactions.links && (
                                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                            <div className="flex flex-1 justify-between sm:hidden">
                                                {transactions.prev_page_url && (
                                                    <a href={transactions.prev_page_url} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</a>
                                                )}
                                                {transactions.next_page_url && (
                                                    <a href={transactions.next_page_url} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            <Modal show={showFilters} onClose={() => setShowFilters(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Transactions</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                id="type"
                                value={filterData.type}
                                onChange={e => setFilterData({ ...filterData, type: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="category"
                                value={filterData.category}
                                onChange={e => setFilterData({ ...filterData, category: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="date_from" className="block text-sm font-medium text-gray-700">Date From</label>
                            <TextInput
                                id="date_from"
                                type="date"
                                value={filterData.date_from}
                                onChange={e => setFilterData({ ...filterData, date_from: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <label htmlFor="date_to" className="block text-sm font-medium text-gray-700">Date To</label>
                            <TextInput
                                id="date_to"
                                type="date"
                                value={filterData.date_to}
                                onChange={e => setFilterData({ ...filterData, date_to: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={resetFilters}>
                            Reset
                        </SecondaryButton>
                        <PrimaryButton onClick={applyFilters}>
                            Apply Filters
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Edit Transaction Modal */}
            {editingTransaction && (
                <Modal show={true} onClose={() => setEditingTransaction(null)}>
                    <form onSubmit={updateTransaction} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Transaction</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                                <TextInput
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={editingTransaction.amount}
                                    onChange={e => setEditingTransaction({
                                        ...editingTransaction,
                                        amount: e.target.value
                                    })}
                                    className="mt-1 block w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700">Date</label>
                                <TextInput
                                    id="transaction_date"
                                    type="date"
                                    value={editingTransaction.transaction_date}
                                    onChange={e => setEditingTransaction({
                                        ...editingTransaction,
                                        transaction_date: e.target.value
                                    })}
                                    className="mt-1 block w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    value={editingTransaction.description || ''}
                                    onChange={e => setEditingTransaction({
                                        ...editingTransaction,
                                        description: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <SecondaryButton type="button" onClick={() => setEditingTransaction(null)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit">
                                Update Transaction
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
