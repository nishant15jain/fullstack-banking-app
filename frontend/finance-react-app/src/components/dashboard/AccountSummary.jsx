import React from 'react';
import { formatCurrency, getAccountStatusColor } from '../../utils/formatters';
import './AccountSummary.css';

const AccountSummary = ({ accounts, loading, onCreateAccount, onViewAccount, onDeleteAccount }) => {
  if (loading) {
    return (
      <div className="account-summary">
        <div className="account-summary-header">
          <h3>Your Accounts</h3>
        </div>
        <div className="loading-placeholder">Loading accounts...</div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

  return (
    <div className="account-summary">
      <div className="account-summary-header">
        <h3>Your Accounts</h3>
        <button 
          className="btn-primary create-account-btn"
          onClick={onCreateAccount}
        >
          + New Account
        </button>
      </div>

      <div className="total-balance">
        <span className="balance-label">Total Balance</span>
        <span className="balance-amount">{formatCurrency(totalBalance)}</span>
      </div>

      {accounts.length === 0 ? (
        <div className="no-data">
          <p>No accounts found. Create your first account to get started!</p>
          <button 
            className="btn-success"
            onClick={onCreateAccount}
          >
            Create First Account
          </button>
        </div>
      ) : (
        <div className="accounts-list">
          {accounts.slice(0, 3).map((account) => (
            <div 
              key={account.id} 
              className="account-card"
              onClick={() => onViewAccount(account)}
            >
              <div className="account-info">
                <div className="account-type">{account.accountType} Account</div>
                <div className="account-number">••••{account.accountNumber.slice(-4)}</div>
              </div>
              <div className="account-details">
                <div className="account-balance">{formatCurrency(account.balance)}</div>
                <div 
                  className="account-status"
                  style={{ color: getAccountStatusColor(account.accountStatus) }}
                >
                  {account.accountStatus}
                </div>
              </div>
            </div>
          ))}
          
          {accounts.length > 3 && (
            <div className="view-all-accounts">
              <button 
                className="btn-outline"
                onClick={() => window.location.href = '/accounts'}
              >
                View All Accounts ({accounts.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountSummary;
