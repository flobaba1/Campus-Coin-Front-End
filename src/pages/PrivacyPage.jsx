import { navigate } from '../routes/AppRoutes'
import Logo from '../components/Logo'
import Icon from '../components/Icon'

import '../styles/legal.css'

function PrivacyPage() {
    return (
        <div className="legal-page">
            <header className="legal-header">
                <button
                    type="button"
                    className="legal-logo"
                    onClick={() => navigate('/dashboard')}
                    aria-label="Go to CampusCoin dashboard"
                >
                    <Logo />
                </button>

                <button
                    type="button"
                    className="legal-back-button"
                    onClick={() => navigate('/')}
                >
                    <span>←</span>
                    Back to Home
                </button>
            </header>

            <main className="legal-container">
                <div className="legal-hero">
                    <div className="legal-icon">
                        <Icon name="lock" size={24} />
                    </div>

                    <span className="legal-eyebrow">CAMPUSCOIN</span>

                    <h1>Privacy Policy</h1>

                    <p>
                        This Privacy Policy explains how CampusCoin handles information
                        when students use the CampusCoin web application.
                    </p>

                    <span className="legal-updated">
                        Last updated: September 2026
                    </span>
                </div>

                <div className="legal-content">
                    <section>
                        <h2>1. Introduction</h2>

                        <p>
                            CampusCoin is a student-focused budgeting and expense tracking
                            web application designed to help college and university students
                            record income, track expenses, understand spending patterns, and
                            receive practical saving suggestions.
                        </p>

                        <p>
                            CampusCoin is designed around manually entered or imported
                            financial information. The application does not connect to
                            students' bank accounts and does not perform real banking
                            transactions.
                        </p>
                    </section>

                    <section>
                        <h2>2. Information We Collect</h2>

                        <p>
                            Depending on how you use CampusCoin, the application may collect
                            information that you provide when creating and using your
                            account, including:
                        </p>

                        <ul>
                            <li>Your name.</li>
                            <li>Your email address.</li>
                            <li>Your academic year.</li>
                            <li>Your budgeting and savings information.</li>
                            <li>Income and expense information that you enter.</li>
                            <li>Categories associated with your transactions.</li>
                            <li>Information contained in files that you voluntarily import.</li>
                        </ul>

                        <p>
                            CampusCoin uses the information necessary to provide the
                            application's budgeting, transaction tracking, reporting, and
                            personalization features.
                        </p>
                    </section>

                    <section>
                        <h2>3. Financial and Transaction Information</h2>

                        <p>
                            CampusCoin allows students to manually record information about
                            income and expenses, including sources such as allowances,
                            scholarships, part-time work, gifts, food, transport, academics,
                            accommodation, subscriptions, entertainment, and miscellaneous
                            spending.
                        </p>

                        <p>
                            This information is used to provide features such as spending
                            summaries, category breakdowns, budget tracking, trends, and
                            personalized saving suggestions.
                        </p>

                        <div className="legal-callout">
                            <strong>Important:</strong>
                            <p>
                                CampusCoin does not connect to your bank account, verify bank
                                accounts, process payments, or move money on your behalf.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2>4. CSV and File Imports</h2>

                        <p>
                            CampusCoin may allow you to import transaction information using
                            supported file formats such as CSV.
                        </p>

                        <p>
                            You are responsible for ensuring that files you upload contain
                            information you are permitted to provide to the application.
                        </p>

                        <p>
                            Imported information may be used to populate your transaction
                            history and support categorization, reporting, and other
                            budgeting features.
                        </p>
                    </section>

                    <section>
                        <h2>5. AI-Assisted Features</h2>

                        <p>
                            CampusCoin may provide optional AI-assisted features that help
                            categorize expenses and summarize spending patterns.
                        </p>

                        <p>
                            AI-generated categorizations and insights are suggestions. You
                            may review or override categorization results where the
                            application provides that functionality.
                        </p>

                        <div className="legal-callout">
                            <strong>AI information:</strong>
                            <p>
                                AI-generated insights are advisory and should not be treated as
                                certified financial advice.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2>6. How Information Is Used</h2>

                        <p>
                            Information provided to CampusCoin may be used to:
                        </p>

                        <ul>
                            <li>Provide and operate your CampusCoin account.</li>
                            <li>Record and organize your transactions.</li>
                            <li>Calculate spending and budget information.</li>
                            <li>Generate category-based spending summaries.</li>
                            <li>Generate personalized saving suggestions.</li>
                            <li>Provide optional AI-assisted categorization and insights.</li>
                            <li>Improve the reliability and functionality of the application.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. Data Storage and Security</h2>

                        <p>
                            CampusCoin stores application information using its underlying
                            database and application infrastructure so that the application's
                            features can function across supported devices.
                        </p>

                        <p>
                            Reasonable technical measures should be used to protect
                            information against unauthorized access, alteration, disclosure,
                            or destruction.
                        </p>

                        <p>
                            However, no web application or method of electronic storage can
                            guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2>8. Information Sharing</h2>

                        <p>
                            CampusCoin is designed as a personal student budgeting
                            application. Information provided by a student should only be
                            accessed or processed where necessary to operate the application's
                            features or provide services associated with the application.
                        </p>

                        <p>
                            CampusCoin does not represent itself as a banking service or
                            payment processor.
                        </p>
                    </section>

                    <section>
                        <h2>9. Third-Party Services</h2>

                        <p>
                            Certain application functionality may rely on technical services
                            or infrastructure provided by third parties. Where such services
                            are used, information necessary for that functionality may be
                            processed by those services.
                        </p>

                        <p>
                            The application should only integrate third-party services that
                            are necessary for its intended functionality.
                        </p>
                    </section>

                    <section>
                        <h2>10. Data Retention</h2>

                        <p>
                            CampusCoin retains account and transaction information for as
                            long as it is required to provide the application's functionality,
                            subject to applicable account and data-management processes.
                        </p>

                        <p>
                            Specific retention periods are not defined in the current
                            CampusCoin application specification.
                        </p>
                    </section>

                    <section>
                        <h2>11. Your Information</h2>

                        <p>
                            You should ensure that information entered into CampusCoin is
                            accurate and appropriate for the purpose for which you are using
                            the application.
                        </p>

                        <p>
                            Where account-management or data-management functionality is
                            provided by CampusCoin, users may use those features to manage
                            their information.
                        </p>
                    </section>

                    <section>
                        <h2>12. Student Privacy</h2>

                        <p>
                            CampusCoin is designed specifically for college and university
                            students and focuses on student budgeting and financial literacy.
                        </p>

                        <p>
                            Users should avoid entering information that is unnecessary for
                            the budgeting and expense-tracking functions of the application.
                        </p>
                    </section>

                    <section>
                        <h2>13. Changes to This Privacy Policy</h2>

                        <p>
                            CampusCoin may update this Privacy Policy when the application's
                            features, data practices, or requirements change.
                        </p>

                        <p>
                            When changes are made, the updated version will be made available
                            through the application.
                        </p>
                    </section>

                    <section>
                        <h2>14. Contact</h2>

                        <p>
                            Questions about this Privacy Policy should be directed through
                            the official CampusCoin support or contact channel provided by
                            the application.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default PrivacyPage