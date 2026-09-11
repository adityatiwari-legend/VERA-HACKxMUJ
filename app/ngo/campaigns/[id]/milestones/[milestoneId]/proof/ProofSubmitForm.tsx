'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileCheck,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

interface ProofSubmitFormProps {
  campaignId: string;
  milestoneId: string;
  milestoneAmount: number;
}

export const ProofSubmitForm: React.FC<ProofSubmitFormProps> = ({
  campaignId,
  milestoneId,
  milestoneAmount,
}) => {
  const router = useRouter();

  const [claimedAmount, setClaimedAmount] = useState<string>(milestoneAmount.toString());
  const [description, setDescription] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Filter out files exceeding 10MB
      const validFiles: File[] = [];
      for (const file of newFiles) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds the 10MB limit.`);
          continue;
        }
        validFiles.push(file);
      }
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedClaimed = parseFloat(claimedAmount);
    if (isNaN(parsedClaimed) || parsedClaimed <= 0) {
      setError('Please enter a valid positive claimed amount.');
      return;
    }

    if (parsedClaimed > milestoneAmount) {
      setError(
        `Claimed amount (${formatRupees(parsedClaimed)}) cannot exceed milestone allocation (${formatRupees(milestoneAmount)}).`
      );
      return;
    }

    if (!description || description.trim().length < 5) {
      setError('Description must be at least 5 characters detailing the completed work.');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please upload at least one evidence document (invoice, receipt, or site photo).');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Securing files and calculating SHA-256 fingerprints...');

    try {
      const formData = new FormData();
      formData.append('claimed_amount', parsedClaimed.toString());
      formData.append('description', description.trim());

      for (const file of selectedFiles) {
        formData.append('files', file);
      }

      setStatusMessage('Extracting metadata and analyzing evidence discrepancies...');

      const res = await fetch(`/api/milestones/${milestoneId}/proofs`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit proof evidence.');
      }

      setStatusMessage('Proof submitted successfully! Redirecting...');
      router.push(`/ngo/proofs/${data.proof.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during proof submission.');
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Claimed Amount */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">
            Claimed Utilisation Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setClaimedAmount(milestoneAmount.toString())}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline"
          >
            Claim Full Allocation ({formatRupees(milestoneAmount)})
          </button>
        </div>
        <input
          type="number"
          step="0.01"
          min="1"
          max={milestoneAmount}
          value={claimedAmount}
          onChange={(e) => setClaimedAmount(e.target.value)}
          placeholder={`Max ${milestoneAmount}`}
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-[11px] text-slate-400">
          Cannot exceed milestone allocation budget of {formatRupees(milestoneAmount)}.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800">
          Execution Description & Justification <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe completed work (e.g. Electrical wiring, fixture installation, and classroom switchboard wiring completed as per schedule.)"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* File Upload Area */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>
            Upload Evidence Documents <span className="text-rose-500">*</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Supported: PDF, JPG, PNG, WEBP (Max 10MB each)
          </span>
        </label>

        <label className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-700">
              Click to select evidence files or drag and drop
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Invoices, vendor receipts, completion certificates, or geo-tagged photos
            </p>
          </div>
        </label>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              Selected Files ({selectedFiles.length})
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="px-4 py-2.5 bg-white flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {file.type.includes('pdf') ? (
                      <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="font-medium text-slate-800 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>

                  {!isSubmitting && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security & Fingerprint Guarantee Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Cryptographic Verification & Tamper Evidence</p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Every uploaded document is automatically hashed with <strong>SHA-256</strong> on ingest. The cryptographic fingerprint is permanently recorded in the database and audit trail to ensure documents cannot be modified after submission.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || selectedFiles.length === 0}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage || 'Processing Evidence...'}</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>Submit Proof for Automated Verification</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
