import React, { useState } from 'react';
import axios from 'axios';

const MilestoneTracker = ({ milestones, charityId, contract, account }) => {
  const [uploadingId, setUploadingId] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const uploadProof = async (milestoneId) => {
    if (!proofFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploadingId(milestoneId);

    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      formData.append('milestone_id', milestoneId);

      await axios.post(`/api/milestones/${milestoneId}/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Proof uploaded successfully. Waiting for verification.');
      setProofFile(null);
      // Refresh milestones
      window.location.reload();
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Error uploading proof. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const verifyMilestone = async (milestoneId) => {
    if (!contract || !account) {
      alert('Web3 not initialized. Please connect your wallet.');
      return;
    }

    setVerifyingId(milestoneId);

    try {
      await contract.methods.verifyMilestone(charityId, milestoneId).send({
        from: account
      });

      alert('Milestone verified successfully. Funds have been released to the charity.');
      // Refresh milestones
      window.location.reload();
    } catch (error) {
      console.error('Error verifying milestone:', error);
      alert('Error verifying milestone. Please try again.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="milestone-tracker">
      {milestones.length === 0 ? (
        <p>No milestones defined for this charity.</p>
      ) : (
        <div className="timeline">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className={`timeline-item ${milestone.status}`}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>{milestone.title}</h4>
                <p>{milestone.description}</p>
                <p><strong>Funds to release:</strong> {milestone.amount_to_release} ETH</p>
                <p><strong>Status:</strong> {milestone.status}</p>

                {milestone.status === 'pending' && account === milestone.charity_wallet && (
                  <div className="mt-3">
                    <input
                      type="file"
                      className="form-control mb-2"
                      onChange={handleFileChange}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => uploadProof(milestone.id)}
                      disabled={uploadingId === milestone.id}
                    >
                      {uploadingId === milestone.id ? 'Uploading...' : 'Upload Proof'}
                    </button>
                  </div>
                )}

                {milestone.status === 'proof_submitted' && (
                  <div className="mt-3">
                    <a
                      href={milestone.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-info btn-sm me-2"
                    >
                      View Proof
                    </a>

                    {account === milestone.verifier_wallet && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => verifyMilestone(milestone.id)}
                        disabled={verifyingId === milestone.id}
                      >
                        {verifyingId === milestone.id ? 'Verifying...' : 'Verify & Release Funds'}
                      </button>
                    )}
                  </div>
                )}

                {milestone.status === 'completed' && (
                  <div className="mt-3">
                    <span className="badge bg-success">Completed</span>
                    <p className="text-muted mt-1">
                      Verified on: {new Date(milestone.verified_at).toLocaleString()}
                    </p>
                    <a
                      href="https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View Contract on Scrollscan
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker;