import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head>
                <title>Family Budget Pro - Take Control of Your Family Finances</title>
                <meta name="description" content="Effortlessly manage your family budget, track expenses, and achieve your financial goals together. Smart insights, easy planning, and complete control of your money." />
                <meta name="keywords" content="family budget, expense tracking, financial planning, budgeting app, family finances" />
                <meta property="og:title" content="Family Budget Pro" />
                <meta property="og:description" content="Effortlessly manage your family budget, track expenses, and achieve your financial goals together." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://ourfamilyfinances.com" />
                <meta property="og:image" content="https://ourfamilyfinances.com/og-fbp-image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Family Budget Pro" />
                <meta name="twitter:description" content="Effortlessly manage your family budget, track expenses, and achieve your financial goals together." />
                <meta name="twitter:image" content="https://ourfamilyfinances.com/og-fbp-image.png" />
            </Head>
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 dark:text-white">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
                {/* Header */}
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between py-8">
                        <div className="flex items-center">
                            <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Family Budget Pro</span>
                        </div>
                        <nav className="flex items-center gap-6">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-semibold text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero Section */}
                    <div className="py-20 sm:py-24">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                                Take Control of Your{' '}
                                <span className="text-blue-600 dark:text-blue-400">Family Finances</span>
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Effortlessly manage your family budget, track expenses, and achieve your financial goals together. 
                                Smart insights, easy planning, and complete control of your money.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-6">
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
                                >
                                    Start For Free
                                </Link>
                                <a
                                    href="#features"
                                    className="text-base font-semibold leading-7 text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                                >
                                    Learn more <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div id="features" className="py-24 sm:py-32">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="relative rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 dark:bg-blue-400/10">
                                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                    </svg>
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Smart Budgeting</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Create and manage budgets with ease. Set spending limits, track expenses, and get insights into your family's spending habits.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="relative rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 dark:bg-blue-400/10">
                                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Expense Tracking</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Automatically categorize expenses and get real-time insights into where your money is going. Track spending across all categories.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="relative rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 dark:bg-blue-400/10">
                                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Family Collaboration</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Work together as a family to manage finances. Share budgets, track shared expenses, and achieve financial goals together.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="relative isolate mt-12 rounded-3xl bg-blue-600 px-6 py-24 text-center shadow-2xl dark:bg-blue-500 sm:px-16">
                        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Start Managing Your Family Budget Today
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
                            Join thousands of families who are taking control of their finances with Family Budget Pro.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-6">
                            <Link
                                href={route('register')}
                                className="rounded-full bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-24 border-t border-gray-200 dark:border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                © {new Date().getFullYear()} Family Budget Pro. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
