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
  Cpu,
  Hash,
} from 'lucide-react';
import { formatRupees } from '@/lib/utils';

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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const processFiles = (newFiles: File[]) => {
    setError(null);
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    const validFiles: File[] = [];

    for (const file of newFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!validExtensions.includes(ext)) {
        setError(`File "${file.name}" has unsupported format. Accepted: PDF, JPG, PNG, WEBP.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 10MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
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
    setStatusMessage('Securing files and generating SHA-256 digests...');

    try {
      const formData = new FormData();
      formData.append('claimed_amount', parsedClaimed.toString());
      formData.append('description', description.trim());

      for (const file of selectedFiles) {
        formData.append('files', file);
      }

      setStatusMessage('Extracting line items and executing discrepancy screening...');

      const res = await fetch(`/api/milestones/${milestoneId}/proofs`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit proof evidence.');
      }

      setStatusMessage('Evidence processed! Redirecting to verification results...');
      router.push(`/ngo/proofs/${data.proof.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during proof submission.');
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-xs text-red-400 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      {/* Claimed Amount */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
            Claimed Utilisation Amount (₹) <span className="text-[#00F59B]">*</span>
          </label>
          <button
            type="button"
            onClick={() => setClaimedAmount(milestoneAmount.toString())}
            className="text-[11px] text-[#00F59B] hover:underline"
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
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm font-semibold focus:outline-none focus:border-[#00F59B] transition-colors"
        />
        <p className="text-[11px] text-zinc-500">
          Cannot exceed milestone budget of {formatRupees(milestoneAmount)}.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5 font-mono">
        <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
          Execution Description & Justification <span className="text-[#00F59B]">*</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe completed work (e.g. Electrical wiring, fixture installation, and classroom switchboard wiring completed as per schedule.)"
          required
          disabled={isSubmitting}
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-xs font-sans focus:outline-none focus:border-[#00F59B] transition-colors"
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
            Upload Evidence Documents <span className="text-[#00F59B]">*</span>
          </label>
          <span className="text-[10px] text-zinc-500">
            Accepted: PDF, JPG, JPEG, PNG, WEBP (Max 10MB)
          </span>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
            isDragging
              ? 'border-[#00F59B] bg-[#00F59B]/5'
              : 'border-white/[0.12] bg-[#18181B] hover:border-white/[0.2]'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
            <UploadCloud className="w-5 h-5 text-[#00F59B]" />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-white font-sans">
              Drag & Drop invoices or site photographs here
            </p>
            <p className="text-[11px] text-zinc-500">
              or click to browse files from your computer
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List with SHA-256 Hash Generation indicator */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 font-mono">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-medium">
            Attached Documents ({selectedFiles.length})
          </span>
          <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-lg overflow-hidden">
            {selectedFiles.map((file, idx) => {
              const isPdf = file.name.endsWith('.pdf');
              return (
                <div
                  key={idx}
                  className="p-3 bg-[#18181B] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isPdf ? (
                      <FileText className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-[#00F59B] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {formatFileSize(file.size)} • SHA-256 auto-calculated
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    disabled={isSubmitting}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/25 text-xs text-[#00F59B] flex items-center gap-2 font-mono">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || selectedFiles.length === 0}
          className="w-full py-3 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs font-mono transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>SUBMITTING FOR AUDIT...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>SUBMIT FOR AUDIT</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProofSubmitForm;
