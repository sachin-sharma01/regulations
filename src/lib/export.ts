import * as XLSX from 'xlsx';
import type { Regulation } from '@/types';

export function exportToExcel(items: Regulation[]): void {
  const rows = items.map(item => ({
    'Regulation Name': item.title || '',
    'Regulatory category': item.category || '',
    'Into force Date': item.deadline || '',
    'Status': item.review_status === 'approved' || item.review_status === 'approved_it'
      ? 'Approved'
      : item.review_status === 'in_progress'
      ? 'In Progress'
      : 'Monitoring',
    'Assessed impact - Effort': item.effort_level || '',
    'Assessed impact - When in place': item.impact_when_in_place || '',
    'Comment': item.reviewer_note || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 60 }, { wch: 20 }, { wch: 18 },
    { wch: 15 }, { wch: 35 }, { wch: 30 }, { wch: 50 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Regulations');
  XLSX.writeFile(wb, `regulations_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
