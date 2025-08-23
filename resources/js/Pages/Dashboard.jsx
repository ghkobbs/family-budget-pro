import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faDollarSign, 
    faChartLine, 
    faWallet, 
    faArrowUp, 
    faArrowDown 
} from '@fortawesome/free-solid-svg-icons';

// Helper for currency formatting
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const StatCard = ({ title, value, valueFormat = 'money', icon, trend, trendValue, className }) => {
    const trendIcon = trendValue >= 0 ? faArrowUp : faArrowDown;
    const trendColor = trendValue >= 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-gray-500">{title}</div>
                <div className="text-gray-400">
                    <FontAwesomeIcon icon={icon} size="lg" />
                </div>
            </div>
            <div className="text-2xl font-bold mb-2">{valueFormat === 'money' ? formatCurrency(value) : value.toFixed(2) + '%'}</div>
            {trend && (
                <div className={`flex items-center ${trendColor} text-sm`}>
                    <FontAwesomeIcon icon={trendIcon} className="mr-1" />
                    <span>{Math.abs(trendValue)}% vs last month</span>
                </div>
            )}
        </div>
    );
};

const RecentTransactionCard = ({ transaction }) => {
    const isExpense = transaction.type === 'expense';
    
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center">
                <div className={`rounded-full p-2 mr-4 ${isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <FontAwesomeIcon icon={isExpense ? faArrowDown : faArrowUp} />
                </div>
                <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.budget_item.name}</div>
                </div>
            </div>
            <div>
                <div className={`font-medium ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                    {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm text-gray-500">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

const BudgetProgressCard = ({ category }) => {
    const actualAmount = category.actual_amount || 0;
    const projectedAmount = category.projected_amount || 0;
    const percentage = projectedAmount > 0 ? (actualAmount / projectedAmount) * 100 : 0;
    const isOverBudget = percentage > 100;
    
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{category.name}</h3>
                <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {percentage.toFixed(1)}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{formatCurrency(category.actual_amount)}</span>
                <span>{formatCurrency(category.projected_amount)}</span>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, currentBudget, recentTransactions }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Quick Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Monthly Income"
                            value={currentBudget?.summary?.total_actual_income.value || 0}
                            icon={faDollarSign}
                            trend
                            trendValue={currentBudget?.summary?.total_actual_income.trendValue || 0}
                        />
                        <StatCard
                            title="Monthly Expenses"
                            value={currentBudget?.summary?.total_actual_expense.value || 0}
                            icon={faWallet}
                            trend
                            trendValue={currentBudget?.summary?.total_actual_expense.trendValue || 0}
                        />
                        <StatCard
                            title="Net Balance"
                            value={(currentBudget?.summary?.net_balance.value || 0)}
                            icon={faChartLine}
                            trend
                            trendValue={currentBudget?.summary?.net_balance.trendValue || 0}
                        />
                        <StatCard
                            title="Budget Progress"
                            value={currentBudget?.summary?.budget_utilization.value || 0}
                            icon={faChartLine}
														valueFormat="percentage"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Budget Categories Progress */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold">Budget Overview</h2>
                                {currentBudget && (
                                    <Link
                                        href={route('budgets.show', currentBudget.id)}
                                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                                    >
                                        View Details
                                    </Link>
                                )}
                            </div>
                            <div className="space-y-4">
                                {currentBudget?.expense_categories?.map(category => (
                                    <BudgetProgressCard key={category.id} category={category} />
                                ))}
                            </div>
                            {!currentBudget && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No budget found for the current month.</p>
                                    <Link
                                        href={route('budgets.index')}
                                        className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block"
                                    >
                                        Create a Budget
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold">Recent Transactions</h2>
                                {currentBudget && (
                                    <Link
                                        href={route('budgets.show', currentBudget.id)}
                                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                                    >
                                        View All
                                    </Link>
                                )}
                            </div>
                            <div className="space-y-4">
                                {recentTransactions?.length > 0 ? (
                                    recentTransactions.map(transaction => (
                                        <RecentTransactionCard key={transaction.id} transaction={transaction} />
                                    ))
                                ) : (
                                    <p className="text-center py-4 text-gray-500">
                                        No recent transactions found.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
