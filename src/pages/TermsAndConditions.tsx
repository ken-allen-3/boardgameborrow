import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      
      <div className="prose prose-indigo max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using BoardGameBorrow, you accept and agree to be bound by these Terms and Conditions.
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
          <p className="mb-4">As a user of BoardGameBorrow, you agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Take proper care of borrowed games</li>
            <li>Return games in a timely manner</li>
            <li>Respect other users and their property</li>
            <li>Not engage in any fraudulent or abusive behavior</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Game Lending and Borrowing</h2>
          <p className="mb-4">When participating in game lending and borrowing:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Lenders retain ownership of their games</li>
            <li>Borrowers are responsible for any damage during the borrowing period</li>
            <li>Games must be returned in the same condition they were received</li>
            <li>Any disputes should be reported to BoardGameBorrow immediately</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Account Security</h2>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials.
            Any activity that occurs under your account is your responsibility.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Activities</h2>
          <p className="mb-4">Users are prohibited from:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Creating false or misleading accounts</li>
            <li>Harassing or abusing other users</li>
            <li>Attempting to circumvent our security measures</li>
            <li>Using the service for any illegal purposes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Service Modifications</h2>
          <p className="mb-4">
            We reserve the right to modify or discontinue any part of our service at any time.
            We will provide reasonable notice of any significant changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">
            BoardGameBorrow is not responsible for any disputes between users or for any damage
            or loss of games during the lending process. Users agree to resolve any disputes
            directly with each other.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms and Conditions, please contact us at{' '}
            <a href="mailto:support@boardgameborrow.com" className="text-indigo-600 hover:text-indigo-800">
              support@boardgameborrow.com
            </a>
          </p>
        </section>
      </div>

      <div className="mt-8 pt-4 border-t">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TermsAndConditions;
