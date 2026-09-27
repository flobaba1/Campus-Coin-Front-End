import { navigate } from '../routes/AppRoutes'
import Logo from '../components/Logo'
import Icon from '../components/Icon'

import '../styles/legal.css'

function TermsPage() {
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
                        <Icon name="file" size={24} />
                    </div>

                    <span className="legal-eyebrow">CAMPUSCOIN</span>

                    <h1>Terms of Service</h1>

                    <p>
                        These terms describe the rules and limitations that apply when
                        using the CampusCoin web application.
                    </p>

                    <span className="legal-updated">
                        Last updated: September 2026
                    </span>
                </div>

                <div className="legal-content">
                    <section>
                        <h2>1. Acceptance of Terms</h2>

                        <p>
                            By creating an account or using CampusCoin, you agree to use the
                            application in accordance with these Terms of Service.
                        </p>

                        <p>
                            If you do not agree with these terms, you should not use the
                            application.
                        </p>
                    </section>

                    <section>
                        <h2>2. About CampusCoin</h2>

                        <p>
                            CampusCoin is a responsive student budgeting and expense-tracking
                            web application designed for college and university students.
                        </p>

                        <p>
                            The application helps students record income and expenses,
                            organize spending into relevant categories, understand spending
                            patterns, and receive personalized saving suggestions.
                        </p>
                    </section>

                    <section>
                        <h2>3. Account Registration</h2>

                        <p>
                            To use account-based features, you may be required to provide
                            registration information such as your name, email address,
                            academic year, and password.
                        </p>

                        <p>
                            You are responsible for providing accurate information and
                            keeping your account credentials secure.
                        </p>
                    </section>

                    <section>
                        <h2>4. Your Financial Information</h2>

                        <p>
                            CampusCoin allows you to manually record income and expenses,
                            including allowances, part-time work, scholarships, gifts, food,
                            transport, accommodation, academics, subscriptions,
                            entertainment, and miscellaneous expenses.
                        </p>

                        <p>
                            You are responsible for the accuracy of the information you enter
                            or import.
                        </p>
                    </section>

                    <section>
                        <h2>5. No Banking or Payment Services</h2>

                        <div className="legal-callout">
                            <strong>Important limitation:</strong>
                            <p>
                                CampusCoin does not connect to real banking systems, verify bank
                                accounts, process payments, transfer money, or perform actual
                                monetary transactions.
                            </p>
                        </div>

                        <p>
                            CampusCoin is a budgeting and financial-literacy tool rather than
                            a bank, payment processor, or financial institution.
                        </p>
                    </section>

                    <section>
                        <h2>6. AI-Generated Information</h2>

                        <p>
                            CampusCoin may provide optional AI assistance for expense
                            categorization and spending summaries.
                        </p>

                        <p>
                            AI-generated categorization and insights are suggestions and may
                            not always be accurate. Users should review and, where supported,
                            override AI-generated categories or interpretations.
                        </p>
                    </section>

                    <section>
                        <h2>7. No Financial Advice</h2>

                        <div className="legal-callout">
                            <strong>Financial guidance disclaimer:</strong>
                            <p>
                                CampusCoin's saving tips, spending insights, AI suggestions,
                                reports, and other guidance are educational and advisory in
                                nature. They are not certified financial advice.
                            </p>
                        </div>

                        <p>
                            Users remain responsible for their own financial decisions and
                            should seek qualified professional advice where appropriate.
                        </p>
                    </section>

                    <section>
                        <h2>8. CSV and File Imports</h2>

                        <p>
                            CampusCoin may allow users to import transaction information using
                            supported files such as CSV files.
                        </p>

                        <p>
                            You are responsible for ensuring that you have the right to
                            upload the information contained in an imported file.
                        </p>

                        <p>
                            You should not knowingly upload malicious, unlawful, or
                            unauthorized content.
                        </p>
                    </section>

                    <section>
                        <h2>9. Acceptable Use</h2>

                        <p>You agree not to use CampusCoin to:</p>

                        <ul>
                            <li>Attempt to gain unauthorized access to another account.</li>
                            <li>Interfere with the operation of the application.</li>
                            <li>Upload malicious software or harmful files.</li>
                            <li>Misuse application functionality.</li>
                            <li>Attempt to compromise application security.</li>
                            <li>Use the application for unlawful purposes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>10. Application Availability</h2>

                        <p>
                            CampusCoin is intended to provide a smooth and reliable
                            experience across supported devices. However, temporary
                            interruptions may occur because of maintenance, infrastructure
                            problems, network failures, or other technical circumstances.
                        </p>
                    </section>

                    <section>
                        <h2>11. Account Suspension or Termination</h2>

                        <p>
                            Access to CampusCoin may be suspended or terminated where an
                            account is used in violation of these Terms of Service or where
                            necessary to protect the application, its users, or its
                            infrastructure.
                        </p>
                    </section>

                    <section>
                        <h2>12. Intellectual Property</h2>

                        <p>
                            The CampusCoin application, including its interface, branding,
                            software, design, and associated content, is protected by
                            applicable intellectual-property rights.
                        </p>

                        <p>
                            You may use the application for its intended personal or
                            authorized purposes but may not reproduce or misuse the
                            application's protected materials without appropriate
                            authorization.
                        </p>
                    </section>

                    <section>
                        <h2>13. Disclaimer</h2>

                        <p>
                            CampusCoin is provided as a student budgeting and financial
                            literacy application. It should not be relied upon as a banking
                            service, payment service, investment service, or source of
                            certified financial advice.
                        </p>

                        <p>
                            Users should independently review important financial information
                            and decisions.
                        </p>
                    </section>

                    <section>
                        <h2>14. Limitation of Liability</h2>

                        <p>
                            CampusCoin is intended to assist users with organizing and
                            understanding information they provide. Users remain responsible
                            for verifying their transaction records, budgets, reports, and
                            financial decisions.
                        </p>

                        <p>
                            The application specification does not define specific legal
                            liability limits. Any formal limitation of liability should
                            therefore be established by the application's governing legal
                            documentation.
                        </p>
                    </section>

                    <section>
                        <h2>15. Changes to These Terms</h2>

                        <p>
                            CampusCoin may update these Terms of Service when the application,
                            its functionality, or its operating requirements change.
                        </p>

                        <p>
                            Updated terms will be made available through the application.
                        </p>
                    </section>

                    <section>
                        <h2>16. Contact</h2>

                        <p>
                            Questions about these Terms of Service should be directed through
                            the official CampusCoin support or contact channel provided by
                            the application.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default TermsPage