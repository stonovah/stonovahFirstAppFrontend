// src/pages/admin/pages/ComingSoon.jsx (replace the file)
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { Card, PageHeader } from '../ui';

const title = (slug = '') => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function ComingSoon() {
  const { name } = useParams();
  return (
    <>
      <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline"><FiArrowLeft /> Back to Executive Overview</Link>
      <PageHeader eyebrow="MODULE LOCKED" title={title(name)} desc="This part of the console is not built yet. It will appear here when it launches." />
      <Card className="p-10 text-center space-y-3">
        <FiLock className="mx-auto text-3xl text-red-400" />
        <p className="text-sm text-neutral-300">Nothing to show here yet.</p>
      </Card>
    </>
  );
}