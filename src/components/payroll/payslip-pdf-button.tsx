'use client';

import { Button } from '@/components/ui/button';
import type { Payslip } from '@/lib/types';

interface PayslipPDFButtonProps {
  payslip: Payslip;
  employeeName: string;
  employeeId: string;
}

export function PayslipPDFButton({ payslip, employeeName, employeeId }: PayslipPDFButtonProps) {
  const handleDownload = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    const monthName = new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    // Header
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('DAYFLOW', 14, 20);
    doc.setFontSize(10);
    doc.text('Human Resource Management System', 14, 28);
    doc.text('SALARY SLIP', 196, 20, { align: 'right' });
    doc.text(monthName, 196, 28, { align: 'right' });

    // Employee details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Employee Name: ${employeeName}`, 14, 52);
    doc.text(`Employee ID: ${employeeId}`, 14, 60);
    doc.text(`Pay Period: ${monthName}`, 14, 68);

    // Earnings & Deductions table
    autoTable(doc, {
      startY: 80,
      head: [['Description', 'Amount (₹)']],
      body: [
        ['Basic Salary', Number(payslip.basic_salary).toLocaleString()],
        ['Allowances', Number(payslip.allowances).toLocaleString()],
        ['Gross Pay', Number(payslip.gross_pay).toLocaleString()],
        ['Deductions', `(-) ${Number(payslip.deductions).toLocaleString()}`],
        ['Tax', `(-) ${Number(payslip.tax).toLocaleString()}`],
      ],
      foot: [['Net Pay', `₹ ${Number(payslip.net_pay).toLocaleString()}`]],
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237], fontSize: 11 },
      footStyles: { fillColor: [243, 232, 255], textColor: [88, 28, 135], fontSize: 12, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
    });

    // Footer
    const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 180;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a system-generated payslip. No signature required.', 14, finalY + 20);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, finalY + 26);

    doc.save(`Payslip_${employeeId}_${payslip.year}_${String(payslip.month).padStart(2, '0')}.pdf`);
  };

  return (
    <Button size="sm" variant="outline" onClick={handleDownload}>
      📄 Download PDF
    </Button>
  );
}
