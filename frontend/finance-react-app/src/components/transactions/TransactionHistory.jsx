import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './TransactionHistory.css';

const TransactionHistory = ({ accountNumber, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [totalElements, setTotalElements] = useState(0);

  const fetchTransactions = async (page = 0) => {
    if (!accountNumber) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await transactionService.getTransactionHistoryPaginated(
        accountNumber, 
        page, 
        pageSize, 
        sortBy, 
        sortDir
      );
      
      setTransactions(response.content || []);
      setCurrentPage(response.number || 0);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(0);
    setCurrentPage(0);
  }, [accountNumber, pageSize, sortBy, sortDir, refreshTrigger]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchTransactions(newPage);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortDir('desc');
    }
    setCurrentPage(0);
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'DEPOSIT': return '↗️';
      case 'WITHDRAW': return '↙️';
      case 'TRANSFER': return '↔️';
      default: return '💰';
    }
  };

  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 'DEPOSIT': return 'deposit';
      case 'WITHDRAW': return 'withdraw';
      case 'TRANSFER': return 'transfer';
      default: return '';
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortDir === 'desc' ? '↓' : '↑';
  };

  if (!accountNumber) {
    return (
      <div className="transaction-history">
        <div className="no-account-selected">
          <p>Please select an account to view transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h3>Transaction History</h3>
        <div className="header-controls">
          <div className="page-size-control">
            <label htmlFor="page-size">Show:</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
          <button 
            onClick={() => fetchTransactions(currentPage)} 
            className="refresh-button"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found for this account</p>
            </div>
          ) : (
            <>
              <div className="transactions-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th 
                        onClick={() => handleSortChange('createdAt')}
                        className={`sortable ${sortBy === 'createdAt' ? 'active' : ''}`}
                      >
                        Date {getSortIcon('createdAt')}
                      </th>
                      <th 
                        onClick={() => handleSortChange('type')}
                        className={`sortable ${sortBy === 'type' ? 'active' : ''}`}
                      >
                        Type {getSortIcon('type')}
                      </th>
                      <th 
                        onClick={() => handleSortChange('amount')}
                        className={`sortable ${sortBy === 'amount' ? 'active' : ''}`}
                      >
                        Amount {getSortIcon('amount')}
                      </th>
                      <th>Description</th>
                      <th>Reference</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className={getTransactionTypeClass(transaction.type)}>
                        <td className="date-cell">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="type-cell">
                          <span className="type-badge">
                            {getTransactionTypeIcon(transaction.type)} {transaction.type}
                          </span>
                        </td>
                        <td className={`amount-cell ${getTransactionTypeClass(transaction.type)}`}>
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="description-cell">
                          {transaction.description || '-'}
                        </td>
                        <td className="reference-cell">
                          <code>{transaction.transactionRef}</code>
                        </td>
                        <td className="status-cell">
                          {getStatusBadge(transaction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} transactions
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => handlePageChange(0)}
                      disabled={currentPage === 0}
                      className="page-button"
                    >
                      ⏮️ First
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="page-button"
                    >
                      ⬅️ Previous
                    </button>
                    
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (currentPage < 2) {
                          pageNum = i;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="page-button"
                    >
                      Next ➡️
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="page-button"
                    >
                      Last ⏭️
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;
