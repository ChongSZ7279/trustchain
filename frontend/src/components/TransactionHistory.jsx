import React from 'react';

const TransactionHistory = ({ donations }) => {
  return (
    <div className="transaction-history">
      {donations.length === 0 ? (
        <p>No donations have been made yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount (ETH)</th>
                <th>Date</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation, index) => (
                <tr key={index}>
                  <td>
                    {donation.donor.substring(0, 6)}...{donation.donor.substring(donation.donor.length - 4)}
                  </td>
                  <td>{donation.amount}</td>
                  <td>{donation.timestamp}</td>
                  <td>
                    <a 
                      href={`https://etherscan.io/tx/${donation.transactionHash}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 