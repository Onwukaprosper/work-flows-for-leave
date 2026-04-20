import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFOptions {
  title: string;
  headers: string[];
  data: any[][];
  filename?: string;
  orientation?: 'portrait' | 'landscape';
}

class PDFExportService {
  static exportTable(options: PDFOptions) {
    const doc = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(18);
    doc.text(options.title, 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Add table
    autoTable(doc, {
      head: [options.headers],
      body: options.data,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 35 }
    });
    
    // Save PDF
    doc.save(`${options.filename || 'export'}.pdf`);
  }
  
  static exportLeaveHistory(leaves: any[], user: any) {
    const headers = ['Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
    const data = leaves.map(leave => [
      leave.leaveTypeName,
      new Date(leave.startDate).toLocaleDateString(),
      new Date(leave.endDate).toLocaleDateString(),
      leave.totalDays,
      leave.status.toUpperCase(),
      leave.reason.substring(0, 50)
    ]);
    
    this.exportTable({
      title: `Leave History - ${user.firstName} ${user.lastName}`,
      headers,
      data,
      filename: `leave_history_${user.staffId}`
    });
  }
  
  static exportLeaveReport(reportData: any, period: string) {
    const headers = ['Staff Name', 'Department', 'Leave Type', 'Days', 'Status', 'Applied On'];
    const data = reportData.map((item: any) => [
      `${item.firstName} ${item.lastName}`,
      item.department,
      item.leaveTypeName,
      item.totalDays,
      item.status.toUpperCase(),
      new Date(item.appliedAt).toLocaleDateString()
    ]);
    
    this.exportTable({
      title: `Leave Report - ${period}`,
      headers,
      data,
      filename: `leave_report_${period.replace(/\s/g, '_')}`,
      orientation: 'landscape'
    });
  }
}

export default PDFExportService;