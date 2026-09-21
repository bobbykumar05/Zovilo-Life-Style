import jsPDF from 'jspdf';
import { Allocation, Employee, Asset, NOC, CompanySettings } from '../types';

export const generateAllocationPDF = (
  allocation: Allocation,
  employee: Employee,
  assets: Asset[],
  settings: CompanySettings
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 16;

  // Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(14, currentY, pageWidth - 28, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.brandName, 20, currentY + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.legalName.toUpperCase(), 20, currentY + 16);
  doc.text(`${settings.address}, ${settings.city}, ${settings.state} - ${settings.pinCode}`, 20, currentY + 21);

  currentY += 34;

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('EMPLOYEE ASSET ALLOCATION VOUCHER', 14, currentY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Voucher ID: ${allocation.allocationId}  |  Issue Date: ${allocation.allocatedDate}`, 14, currentY + 6);

  currentY += 14;

  // Employee Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Employee Particulars', 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.text(`Employee Name: ${employee.name}`, 20, currentY + 14);
  doc.text(`Employee ID: ${employee.empId}`, 20, currentY + 20);
  doc.text(`Work Location: ${employee.workLocationName}`, 20, currentY + 26);

  doc.text(`Department: ${employee.departmentName}`, 110, currentY + 14);
  doc.text(`Designation: ${employee.designationTitle}`, 110, currentY + 20);
  doc.text(`Official Email: ${employee.email}`, 110, currentY + 26);

  currentY += 38;

  // Asset Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Schedule of Allocated Assets', 14, currentY);
  currentY += 4;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('#', 18, currentY + 5.5);
  doc.text('Asset Tag', 26, currentY + 5.5);
  doc.text('Item Description', 54, currentY + 5.5);
  doc.text('Category', 105, currentY + 5.5);
  doc.text('Serial / IMEI No.', 140, currentY + 5.5);
  doc.text('Condition', 180, currentY + 5.5);

  currentY += 8;

  // Asset Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  assets.forEach((ast, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(14, currentY, pageWidth - 28, 8, 'F');

    doc.text(String(idx + 1), 18, currentY + 5.5);
    doc.text(ast.assetId, 26, currentY + 5.5);
    doc.text(ast.name.substring(0, 28), 54, currentY + 5.5);
    doc.text(ast.categoryName.substring(0, 18), 105, currentY + 5.5);
    doc.text(ast.serialNumber || ast.imeiNumber || 'N/A', 140, currentY + 5.5);
    doc.text(ast.condition, 180, currentY + 5.5);

    currentY += 8;
  });

  currentY += 8;

  // Purpose & Remarks
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Allocation Purpose & Terms:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Purpose: ${allocation.purpose}`, 14, currentY + 5);
  if (allocation.remarks) {
    doc.text(`Remarks: ${allocation.remarks}`, 14, currentY + 10);
    currentY += 5;
  }
  currentY += 10;

  // Employee Declaration
  doc.setFillColor(254, 252, 232); // light amber
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('EMPLOYEE ACKNOWLEDGEMENT & DECLARATION:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 63, 18);
  const declarationText =
    'The above-mentioned company assets have been handed over to me in working and satisfactory condition. ' +
    'I accept responsibility for their proper handling and maintenance in compliance with corporate policies. ' +
    'Upon transfer, resignation or separation, I agree to return all assets in good condition.';
  const splitDec = doc.splitTextToSize(declarationText, pageWidth - 36);
  doc.text(splitDec, 18, currentY + 11);

  currentY += 34;

  // Signature Blocks
  doc.setDrawColor(148, 163, 184);
  doc.line(20, currentY + 16, 75, currentY + 16);
  doc.line(130, currentY + 16, 185, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Employee Signature', 20, currentY + 21);
  doc.text('Authorized IT / Admin Signature', 130, currentY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Name: ${employee.name}`, 20, currentY + 26);
  doc.text(`Date: ${allocation.allocatedDate}`, 20, currentY + 30);

  doc.text(`Issuer: ${allocation.allocatedBy}`, 130, currentY + 26);
  doc.text(`Issued On: ${new Date().toLocaleDateString('en-IN')}`, 130, currentY + 30);

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via Jobulo India Assets Management Portal. Confidential corporate record.', 14, 285);

  doc.save(`${allocation.allocationId}_${employee.empId}_Allocation.pdf`);
};

export const generateNocPDF = (noc: NOC, settings: CompanySettings) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 16;

  // Header Border / Corporate Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(14, currentY, pageWidth - 28, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.brandName, 20, currentY + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(noc.companyName, 20, currentY + 16);
  doc.text(noc.companyAddress, 20, currentY + 21);
  doc.text(`Corporate Inquiries: ${noc.companyContact}`, 20, currentY + 25);

  currentY += 36;

  // Document Badge & Title
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, pageWidth - 28, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('NO OBJECTION CERTIFICATE / ASSET CLEARANCE', 20, currentY + 7);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate No: ${noc.nocNumber}`, 20, currentY + 11.5);

  const statusText = noc.isLocked ? 'FINALIZED & LOCKED' : 'DRAFT / UNDER REVIEW';
  doc.setTextColor(noc.isLocked ? 22 : 194, noc.isLocked ? 101 : 65, noc.isLocked ? 52 : 12);
  doc.text(`[ STATUS: ${statusText} ]`, 140, currentY + 9.5);

  currentY += 20;

  // Employee Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Employee Separation Details', 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`Employee Name: ${noc.employeeName}`, 20, currentY + 14);
  doc.text(`Employee ID: ${noc.employeeEmpId}`, 20, currentY + 20);
  doc.text(`Department: ${noc.departmentName}`, 20, currentY + 26);

  doc.text(`Designation: ${noc.designationTitle}`, 110, currentY + 14);
  doc.text(`Date of Joining: ${noc.dateOfJoining}`, 110, currentY + 20);
  doc.text(`Date of Exit / Clearance: ${noc.dateOfExit}`, 110, currentY + 26);

  currentY += 38;

  // Assets Schedule Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Verified Assets Return Schedule', 14, currentY);
  currentY += 4;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 7.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('#', 18, currentY + 5);
  doc.text('Asset ID', 26, currentY + 5);
  doc.text('Asset Description', 54, currentY + 5);
  doc.text('Category', 110, currentY + 5);
  doc.text('Serial Number', 145, currentY + 5);
  doc.text('Return Status', 180, currentY + 5);

  currentY += 7.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  if (noc.assetRecords.length === 0) {
    doc.rect(14, currentY, pageWidth - 28, 8, 'F');
    doc.text('No assets were historically allocated to this employee.', 20, currentY + 5.5);
    currentY += 8;
  } else {
    noc.assetRecords.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(14, currentY, pageWidth - 28, 7.5, 'F');

      doc.text(String(index + 1), 18, currentY + 5);
      doc.text(item.assetTag || 'N/A', 26, currentY + 5);
      doc.text(item.assetName.substring(0, 30), 54, currentY + 5);
      doc.text(item.category.substring(0, 18), 110, currentY + 5);
      doc.text(item.serialNumber || 'N/A', 145, currentY + 5);
      doc.text(item.returnStatus, 180, currentY + 5);

      currentY += 7.5;
    });
  }

  currentY += 8;

  // Declaration
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL CLEARANCE DECLARATION:', 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const declaration = noc.declarationText || settings.nocDeclaration;
  const splitText = doc.splitTextToSize(declaration, pageWidth - 40);
  doc.text(splitText, 20, currentY + 13);

  currentY += 36;

  // Signatures & Stamp Section
  doc.setDrawColor(148, 163, 184);
  doc.line(20, currentY + 18, 70, currentY + 18);
  doc.line(85, currentY + 18, 125, currentY + 18);
  doc.line(135, currentY + 18, 185, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  doc.text('Employee Signature', 20, currentY + 23);
  doc.text('Company Stamp Area', 87, currentY + 23);
  doc.text('Authorized Signatory', 135, currentY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text(noc.employeeName, 20, currentY + 28);
  doc.text(`Date: ${noc.handoverDate}`, 20, currentY + 32);

  // Simulated Stamp
  doc.setDrawColor(37, 99, 235);
  doc.setTextColor(37, 99, 235);
  doc.roundedRect(88, currentY - 2, 34, 18, 2, 2, 'D');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('JOBULO INDIA', 92, currentY + 5);
  doc.text('ASSETS SEAL', 93, currentY + 10);
  doc.text('VERIFIED', 96, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(noc.authorizedPersonName, 135, currentY + 28);
  doc.text(noc.authorizedPersonDesignation, 135, currentY + 32);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `NOC Revision ${noc.revision} | Generated on ${new Date().toLocaleDateString('en-IN')} | Jobulo India HR & IT Records`,
    14,
    285
  );

  doc.save(`${noc.nocNumber}_${noc.employeeEmpId}.pdf`);
};
