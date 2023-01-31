import { Center, Loader } from '@mantine/core';
import { openModal } from '@mantine/modals';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export const open = () => openModal({
  title: 'Supported Sites',
  children: (<SupportedSitesModal />),
});

export default function SupportedSitesModal() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/supported');

      if (!res.ok) {
        throw new Error('Could not fetch supported sites');
      }

      const text = await res.text();

      setMarkdown(text);
    }
    
    fetchData().catch(err => console.error(err));
  }, []);

  if (markdown === null) {
    return <Center><Loader /></Center>;
  }

  return (
    <ReactMarkdown>{markdown}</ReactMarkdown>
  )
}