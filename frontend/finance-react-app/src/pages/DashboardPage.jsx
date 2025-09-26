import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountSummary from '../components/dashboard/AccountSummary';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import CreateAccountForm from '../components/accounts/CreateAccountForm';
import Navigation from '../components/common/Navigation';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const accountsData = await accountService.getUserAccounts();
      setAccounts(accountsData);
      
      // Load recent transactions from all accounts
      if (accountsData.length > 0) {
        await loadRecentTransactions(accountsData);
      } else {
        setTransactionsLoading(false);
      }
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async (userAccounts) => {
    try {
      setTransactionsLoading(true);
      const allTransactions = [];
      
      // Get transactions from all accounts (limit to first 2 accounts to avoid too many requests)
      const accountsToCheck = userAccounts.slice(0, 2);
      
      for (const account of accountsToCheck) {
        try {
          const transactions = await transactionService.getTransactionHistory(account.accountNumber);
          allTransactions.push(...transactions);
        } catch (err) {
          // Silently continue with other accounts if one fails
        }
      }
      
      // Remove duplicate transactions based on transactionRef (for transfers between user's own accounts)
      const uniqueTransactions = allTransactions.reduce((unique, transaction) => {
        const existingTransaction = unique.find(t => t.transactionRef === transaction.transactionRef);
        if (!existingTransaction) {
          unique.push(transaction);
        }
        return unique;
      }, []);
      
      // Sort by date and take the 5 most recent
      const sortedTransactions = uniqueTransactions.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setRecentTransactions(sortedTransactions.slice(0, 5));
    } catch (err) {
      // Handle error silently
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setShowCreateAccount(true);
  };

  const handleAccountCreated = (newAccount) => {
    setAccounts(prev => [...prev, newAccount]);
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
            <button onClick={loadDashboardData} className="btn-danger">
              Retry
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          <AccountSummary 
            accounts={accounts}
            loading={false}
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
