import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCampaignById } from '@/lib/campaigns';
import { EditCampaignClient } from './EditCampaignClient';
import Link from 'next/link';

export default async function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const campaign = await getCampaignById(params.id);
  if (!campaign) {
    notFound();
  }

  if (user.role === 'NGO' && campaign.ngo_id !== user.id) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-sm">
          <h2 className="text-xl font-bold text-rose-700">Access Denied</h2>
          <p className="text-sm text-slate-600 mt-2">
            You do not have permission to edit this campaign.
          </p>
          <Link
            href="/ngo/campaigns"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-2xl border border-amber-200 shadow-sm">
          <h2 className="text-xl font-bold text-amber-800">Campaign Immutable</h2>
          <p className="text-sm text-slate-600 mt-2">
            This campaign is marked as {campaign.status} and can no longer be edited.
          </p>
          <Link
            href={`/ngo/campaigns/${campaign.id}`}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            View Campaign Details
          </Link>
        </div>
      </div>
    );
  }

  return <EditCampaignClient campaign={campaign} />;
}
