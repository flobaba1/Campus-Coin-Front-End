import Logo from '../components/Logo'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
import '../styles/sitemap.css'

const studentLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/transactions' },
    {
        label: 'Transaction detail',
        path: '/transactions?drawer=1',
        nested: true,
        displayPath: '/app/transactions/:id',
    },
    { label: 'Categories', path: '/categories' },
    { label: 'Budgets & alerts', path: '/budgets' },
    { label: 'Reports', path: '/reports' },
    {
        label: 'Export & share',
        path: '/reports',
        nested: true,
        displayPath: '/app/reports/export',
    },
    { label: 'AI Insights', path: '/ai-insights' },
    { label: 'Saving tips', path: '/saving-tips' },
    { label: 'Bookmarks & notes', path: '/bookmarks' },
    { label: 'Import CSV', path: '/import-csv' },
    { label: 'Review AI categories', path: '/review-categories' },
    { label: 'Profile & settings', path: '/settings' },
]

function StudentSiteLink({ item }) {
    const go = () => {
        navigate(item.path)
    }

    return (
        <button
            className={`sitemap-link${item.nested ? ' nested' : ''}`}
            onClick={go}
            type="button"
        >
            <span className="sitemap-link-label">
                {item.nested && <Icon name="chevron" size={13} />}
                <span>{item.label}</span>
            </span>

            <span className="sitemap-path">
                {item.displayPath || item.path}
            </span>
        </button>
    )
}

function StudentSitemapPage() {
    return (
        <div className="sitemap-page">
            <header className="sitemap-header">
                <button
                    className="sitemap-brand"
                    onClick={() => navigate('/dashboard')}
                    type="button"
                    aria-label="Go to CampusCoin dashboard"
                >
                    <Logo />
                </button>

                <nav
                    className="sitemap-nav"
                    aria-label="Student navigation"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        type="button"
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/transactions')}
                        type="button"
                    >
                        Transactions
                    </button>

                    <button
                        onClick={() => navigate('/categories')}
                        type="button"
                    >
                        Categories
                    </button>

                    <button
                        className="active"
                        onClick={() => navigate('/app/sitemap')}
                        type="button"
                    >
                        Sitemap
                    </button>
                </nav>

                <div className="sitemap-actions">
                    <button
                        className="sitemap-signin"
                        onClick={() => navigate('/settings')}
                        type="button"
                    >
                        Settings
                    </button>

                    <button
                        className="sitemap-cta"
                        onClick={() => navigate('/dashboard')}
                        type="button"
                    >
                        Dashboard
                    </button>
                </div>
            </header>

            <main className="sitemap-main">
                <div
                    className="sitemap-breadcrumb"
                    aria-label="Breadcrumb"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        type="button"
                    >
                        <Icon name="home" size={15} />
                    </button>

                    <Icon name="chevron" size={12} />

                    <span>Sitemap</span>
                </div>

                <div className="sitemap-intro">
                    <h1>Student Sitemap</h1>

                    <p>
                        All areas available to you after signing in to
                        CampusCoin.
                    </p>
                </div>

                <div className="sitemap-grid">
                    <section className="sitemap-card sitemap-card-student">
                        <div className="sitemap-card-heading">
                            <span className="sitemap-card-icon student">
                                <Icon name="user" size={22} />
                            </span>

                            <div>
                                <h2>Student app</h2>
                                <p>Signed-in students</p>
                            </div>
                        </div>

                        <div className="sitemap-divider" />

                        <div className="sitemap-links">
                            {studentLinks.map((item) => (
                                <StudentSiteLink
                                    key={`${item.label}-${item.path}`}
                                    item={item}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default StudentSitemapPage