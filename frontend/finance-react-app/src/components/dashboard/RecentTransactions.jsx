import React from 'react';
import { formatCurrency, formatDateShort, getTransactionTypeColor, getTransactionStatusColor } from '../../utils/formatters';
import './RecentTransactions.css';

const RecentTransactions = ({ transactions, loading, onViewAllTransactions }) => {
  if (loading) {
    return (
      <div className="recent-transactions">
        <div className="transactions-header">
          <h3>Recent Transactions</h3>
        </div>
        <div className="loading-placeholder">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="recent-transactions">
      <div className="transactions-header">
        <h3>Recent Transactions</h3>
        {transactions.length > 0 && (
          <button 
            className="btn-outline"
            onClick={onViewAllTransactions}
          >
            View All
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No recent transactions found.</p>
          <p className="suggestion">Start by making a deposit or transfer!</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                <div 
                  className="transaction-type-indicator"
                  style={{ backgroundColor: getTransactionTypeColor(transaction.type) }}
                >
                  {getTransactionIcon(transaction.type)}
                </div>
              </div>
              
              <div className="transaction-details">
                <div className="transaction-description">
                  {transaction.description || getDefaultDescription(transaction.type)}
                </div>
                <div className="transaction-meta">
                  <span className="transaction-date">
                    {formatDateShort(transaction.createdAt)}
                  </span>
                  <span 
                    className="transaction-status"
                    style={{ color: getTransactionStatusColor(transaction.status) }}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
              
              <div className="transaction-amount">
                <span 
                  className={`amount ${getAmountClass(transaction.type)}`}
                >
                  {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
                </span>
                <span className="transaction-ref">
                  {transaction.transactionRef}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
const getTransactionIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'DEPOSIT':
      return '↓';
    case 'WITHDRAW':
      return '↑';
    case 'TRANSFER':
      return '→';
    default:
      return '•';
  }
};

const getDefaultDescription = (type) => {
  switch (type?.toUpperCase()) {
    case 'DEPOSIT':
      return 'Account Deposit';
    case 'WITHDRAW':
      return 'Account Withdrawal';
    case 'TRANSFER':
      return 'Account Transfer';
    default:
      return 'Transaction';
  }
};

const getAmountClass = (type) => {
  switch (type?.toUpperCase()) {
    case 'DEPOSIT':
      return 'positive';
    case 'WITHDRAW':
      return 'negative';
    case 'TRANSFER':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const getAmountPrefix = (type) => {
  switch (type?.toUpperCase()) {
    case 'DEPOSIT':
      return '+';
    case 'WITHDRAW':
      return '-';
    default:
      return '';
  }
};

export default RecentTransactions;
