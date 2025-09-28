import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactionHistory } from '../hooks/useTransactions';
import AccountSummary from '../components/dashboard/AccountSummary';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import CreateAccountForm from '../components/accounts/CreateAccountForm';
import Navigation from '../components/common/Navigation';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // React Query hooks
  const { data: accounts = [], isLoading: loading, error: queryError } = useAccounts();
  
  // Get transactions from the first account (or could be modified to get from all accounts)
  const firstAccountNumber = accounts.length > 0 ? accounts[0].accountNumber : null;
  const { 
    data: transactionData = [], 
    isLoading: transactionsLoading 
  } = useTransactionHistory(firstAccountNumber);
  
  // Local state
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  
  // Convert query error to string for display
  const error = queryError ? 'Failed to load dashboard data. Please try again.' : '';

  // Process recent transactions (get the 5 most recent)
  const recentTransactions = transactionData.slice(0, 5);


  const handleCreateAccount = () => {
    setShowCreateAccount(true);
  };

  const handleAccountCreated = (newAccount) => {
    // React Query will automatically update the cache via the mutation
    setShowCreateAccount(false);
    // Show success message or toast here
  };

  const handleViewAccount = (account) => {
    // Navigate to account details page
    navigate('/accounts');
  };

  const handleViewAllTransactions = () => {
    // Navigate to transactions page
    navigate('/transactions');
  };

  if (loading) {
    return (
      <>
        <Navigation title="Dashboard" />
        <div className="dashboard-container">
          <main className="dashboard-content">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation title="Dashboard" />
      <div className="dashboard-container">
      
      <main className="dashboard-content">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <AccountSummary 
            accounts={accounts}
            loading={loading}
            onCreateAccount={handleCreateAccount}
            onViewAccount={handleViewAccount}
            onDeleteAccount={(account) => navigate('/accounts')}
          />
          
          <RecentTransactions 
            transactions={recentTransactions}
            loading={transactionsLoading}
            onViewAllTransactions={handleViewAllTransactions}
          />
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button 
              className="btn-primary action-button"
              onClick={() => navigate('/transactions')}
            >
              Make Deposit
            </button>
            <button 
              className="btn-primary action-button"
              onClick={() => navigate('/transactions')}
            >
              Withdraw Funds
            </button>
            <button 
              className="btn-primary action-button"
              onClick={() => navigate('/transactions')}
            >
              Transfer Money
            </button>
            <button 
              className="btn-primary action-button"
              onClick={() => navigate('/accounts')}
            >
              View Accounts
            </button>
          </div>
        </div>
      </main>

      {showCreateAccount && (
        <CreateAccountForm 
          onAccountCreated={handleAccountCreated}
          onCancel={() => setShowCreateAccount(false)}
        />
      )}
      </div>
    </>
  );
};

export default DashboardPage;
