import React, { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import TransactionForms from '../components/transactions/TransactionForms';
import TransactionHistory from '../components/transactions/TransactionHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navigation from '../components/common/Navigation';
import './TransactionsPage.css';

const TransactionsPage = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await accountService.getUserAccounts();
        setUserAccounts(accounts);
        
        // Auto-select first account if available
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0]);
        }
      } catch (err) {
        setError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleTransactionSuccess = (transaction) => {
    // Trigger refresh of transaction history and account data
    setRefreshTrigger(prev => prev + 1);
    
    // Optionally refresh account balances
    const refreshAccount = async () => {
      try {
        const accounts = await accountService.getUserAccounts();
        setUserAccounts(accounts);
        
        // Update selected account with new balance
        if (selectedAccount) {
          const updatedAccount = accounts.find(acc => acc.accountNumber === selectedAccount.accountNumber);
          if (updatedAccount) {
            setSelectedAccount(updatedAccount);
          }
        }
      } catch (err) {
        console.error('Failed to refresh account data:', err);
      }
    };

    refreshAccount();
  };

  const formatAccountDisplay = (account) => {
    return `${account.accountNumber} - ${account.accountType} ($${account.balance?.toFixed(2) || '0.00'})`;
  };

  if (loading) {
    return (
      <>
        <Navigation title="Transactions" />
        <div className="transactions-page">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation title="Transactions" />
        <div className="transactions-page">
          <div className="error-state">
            <h2>Error Loading Transactions</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  if (userAccounts.length === 0) {
    return (
      <>
        <Navigation title="Transactions" />
        <div className="transactions-page">
          <div className="empty-state">
            <h2>No Accounts Found</h2>
            <p>You need to create an account before you can make transactions.</p>
            <button onClick={() => window.location.href = '/accounts'} className="create-account-button">
              Create Account
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation title="Transactions" />
      <div className="transactions-page">
        <div className="page-header">
          <h1>Transactions</h1>
          <p>Manage your money with deposits, withdrawals, and transfers</p>
        </div>

      {/* Account Selector */}
      <div className="account-selector">
        <label htmlFor="account-select">Select Account:</label>
        <select
          id="account-select"
          value={selectedAccount?.accountNumber || ''}
          onChange={(e) => {
            const account = userAccounts.find(acc => acc.accountNumber === e.target.value);
            setSelectedAccount(account);
          }}
          className="account-select"
        >
          <option value="">Choose an account</option>
          {userAccounts.map(account => (
            <option key={account.accountNumber} value={account.accountNumber}>
              {formatAccountDisplay(account)}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Account Info */}
      {selectedAccount && (
        <div className="selected-account-info">
          <div className="account-card">
            <div className="account-details">
              <h3>{selectedAccount.accountType} Account</h3>
              <p className="account-number">{selectedAccount.accountNumber}</p>
              <div className="account-balance">
                <span className="balance-label">Current Balance:</span>
                <span className="balance-amount">${selectedAccount.balance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div className="account-status">
              <span className={`status-badge ${selectedAccount.accountStatus?.toLowerCase() || 'active'}`}>
                {selectedAccount.accountStatus || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="content-tabs">
        <div className="tab-header">
          <button 
            className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            💸 Make Transaction
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 Transaction History
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'transactions' && (
            <div className="tab-panel">
              <TransactionForms 
                selectedAccountNumber={selectedAccount?.accountNumber}
                onTransactionSuccess={handleTransactionSuccess}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-panel">
              <TransactionHistory 
                accountNumber={selectedAccount?.accountNumber}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {selectedAccount && (
        <div className="quick-stats">
          <h3>Quick Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">Account Balance</div>
                <div className="stat-value">${selectedAccount.balance?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏦</div>
              <div className="stat-content">
                <div className="stat-label">Account Type</div>
                <div className="stat-value">{selectedAccount.accountType}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Status</div>
                <div className="stat-value">{selectedAccount.accountStatus || 'ACTIVE'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default TransactionsPage;
