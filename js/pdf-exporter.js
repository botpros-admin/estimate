/**
 * PDF Export Module
 * Handles PDF generation for estimates and contracts using jsPDF
 */

const PDFExporter = {
    // Contractor Information
    contractorInfo: {
        name: 'Hartzell Painting',
        address1: '3195 N Powerline Rd Suite 101',
        address2: 'Pompano Beach, FL 33069',
        phone: '(954) 755-3171'
    },
    
    // Initialize jsPDF instance with common settings
    createDocument(orientation = 'portrait') {
        return new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'letter'
        });
    },

    // Add company header to PDF
    addHeader(doc, pageNumber = 1) {
        // Company info
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(this.contractorInfo.name, 105, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(this.contractorInfo.address1, 105, 22, { align: 'center' });
        doc.text(this.contractorInfo.address2, 105, 27, { align: 'center' });
        doc.text(`Phone: ${this.contractorInfo.phone}`, 105, 32, { align: 'center' });
        
        // Add line separator
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        // Page number
        doc.setFontSize(9);
        doc.text(`Page ${pageNumber}`, 190, 285, { align: 'right' });
        
        return 40; // Return Y position after header
    },

    // Add footer to PDF
    addFooter(doc) {
        const pageHeight = doc.internal.pageSize.height;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' });
        doc.text('© ' + new Date().getFullYear() + ' Hartzell Painting Company. All rights reserved.', 105, pageHeight - 15, { align: 'center' });
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Add table to PDF
    addTable(doc, startY, headers, rows, columnWidths) {
        let y = startY;
        const lineHeight = 7;
        const cellPadding = 2;
        
        // Headers
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y, 170, lineHeight, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        let x = 20;
        headers.forEach((header, i) => {
            doc.text(header, x + cellPadding, y + 5);
            x += columnWidths[i];
        });
        
        y += lineHeight;
        
        // Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        rows.forEach((row, rowIndex) => {
            // Check if we need a new page
            if (y > 250) {
                doc.addPage();
                y = this.addHeader(doc, doc.internal.getNumberOfPages());
            }
            
            // Alternate row background
            if (rowIndex % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, y, 170, lineHeight, 'F');
            }
            
            x = 20;
            row.forEach((cell, i) => {
                // Handle text wrapping for long content
                const maxWidth = columnWidths[i] - (cellPadding * 2);
                const text = cell.toString();
                const lines = doc.splitTextToSize(text, maxWidth);
                
                lines.forEach((line, lineIndex) => {
                    doc.text(line, x + cellPadding, y + 5 + (lineIndex * 4));
                });
                
                x += columnWidths[i];
            });
            
            y += lineHeight;
        });
        
        // Table border
        doc.setLineWidth(0.1);
        doc.rect(20, startY, 170, y - startY);
        
        return y + 5;
    },
    // Generate PDF for Estimate
    generateEstimatePDF(estimateData) {
        const doc = this.createDocument();
        let y = this.addHeader(doc);
        
        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT ESTIMATE', 105, y, { align: 'center' });
        y += 15;
        
        // Estimate details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Left column
        doc.text(`Estimate #: ${estimateData.estimateNumber || 'EST-' + Date.now()}`, 20, y);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y + 6);
        doc.text(`Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`, 20, y + 12);
        
        // Right column - Customer info
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information:', 120, y);
        doc.setFont('helvetica', 'normal');
        
        const customerName = estimateData.contacts?.[0]?.name || 'Customer Name';
        const companyName = estimateData.companyData?.name || '';
        const address = estimateData.siteAddress;
        
        doc.text(customerName, 120, y + 6);
        if (companyName) doc.text(companyName, 120, y + 12);
        doc.text(`${address.street || ''}`, 120, y + 18);
        doc.text(`${address.city || ''}, ${address.state || ''} ${address.zip || ''}`, 120, y + 24);
        
        y += 35;
        
        // Project details section
        doc.setFont('helvetica', 'bold');
        doc.text('Project Details:', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
        
        doc.text(`Project Type: ${estimateData.projectType || 'N/A'}`, 20, y);
        doc.text(`Service Type: ${estimateData.serviceTypes?.join(', ') || 'Painting'}`, 20, y + 6);
        doc.text(`Scope: ${this.getScopeText(estimateData.projectScope)}`, 20, y + 12);
        
        y += 25;
        // Add line items table
        const headers = ['Description', 'Quantity', 'Unit', 'Unit Price', 'Total'];
        const columnWidths = [80, 25, 20, 30, 35];
        const rows = [];
        
        // Paint products
        if (estimateData.paintSelections?.length > 0) {
            estimateData.paintSelections.forEach(selection => {
                rows.push([
                    `${selection.brand} ${selection.product} - ${selection.sheen}`,
                    selection.quantity || '0',
                    'gal',
                    this.formatCurrency(selection.unitPrice || 0),
                    this.formatCurrency((selection.quantity || 0) * (selection.unitPrice || 0))
                ]);
            });
        }
        
        // Labor
        if (estimateData.laborCost > 0) {
            rows.push([
                'Labor',
                estimateData.laborHours || '0',
                'hrs',
                this.formatCurrency(estimateData.laborRate || 0),
                this.formatCurrency(estimateData.laborCost || 0)
            ]);
        }
        
        // Additional items
        if (estimateData.additionalItems?.length > 0) {
            estimateData.additionalItems.forEach(item => {
                rows.push([
                    item.description,
                    item.quantity || '1',
                    item.unit || 'ea',
                    this.formatCurrency(item.unitPrice || 0),
                    this.formatCurrency(item.total || 0)
                ]);
            });
        }
        
        y = this.addTable(doc, y, headers, rows, columnWidths);
        y += 10;
        
        // Totals section
        const totals = estimateData.totals || {};
        doc.setLineWidth(0.5);
        doc.line(120, y, 190, y);
        y += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', 150, y, { align: 'right' });
        doc.text(this.formatCurrency(totals.subtotal || 0), 190, y, { align: 'right' });
        y += 6;
        
        if (totals.discount > 0) {
            doc.text(`Discount (${totals.discountPercent || 0}%):`, 150, y, { align: 'right' });
            doc.text('-' + this.formatCurrency(totals.discount || 0), 190, y, { align: 'right' });
            y += 6;
        }
        
        doc.text(`Tax (${totals.taxRate || 0}%):`, 150, y, { align: 'right' });
        doc.text(this.formatCurrency(totals.tax || 0), 190, y, { align: 'right' });
        y += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Total:', 150, y, { align: 'right' });
        doc.text(this.formatCurrency(totals.total || 0), 190, y, { align: 'right' });
        
        // Add footer
        this.addFooter(doc);
        
        return doc;
    },
    // Generate PDF for Contract
    generateContractPDF(contractData) {
        const doc = this.createDocument();
        let y = this.addHeader(doc);
        
        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PAINTING CONTRACT', 105, y, { align: 'center' });
        y += 15;
        
        // Contract details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Contract info
        doc.text(`Contract #: ${contractData.contractNumber}`, 20, y);
        doc.text(`Date: ${contractData.contractDate}`, 20, y + 6);
        doc.text(`Start Date: ${contractData.startDate}`, 20, y + 12);
        doc.text(`Completion Date: ${contractData.completionDate}`, 20, y + 18);
        
        // Parties section
        y += 30;
        doc.setFont('helvetica', 'bold');
        doc.text('BETWEEN:', 20, y);
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.text('Contractor:', 20, y);
        doc.text(this.contractorInfo.name, 50, y);
        doc.text(this.contractorInfo.address1, 50, y + 6);
        doc.text(this.contractorInfo.address2, 50, y + 12);
        
        y += 20;
        doc.text('Client:', 20, y);
        const clientName = contractData.contacts?.[0]?.name || 'Client Name';
        const companyName = contractData.companyData?.name || '';
        doc.text(clientName, 50, y);
        if (companyName) doc.text(companyName, 50, y + 6);
        doc.text(`${contractData.siteAddress.street}`, 50, y + 12);
        doc.text(`${contractData.siteAddress.city}, ${contractData.siteAddress.state} ${contractData.siteAddress.zip}`, 50, y + 18);
        
        y += 30;
        // Scope of Work section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('SCOPE OF WORK:', 20, y);
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Generate scope items
        const scopeItems = this.generateScopeItems(contractData);
        scopeItems.forEach(item => {
            // Check for page break
            if (y > 250) {
                doc.addPage();
                y = this.addHeader(doc, doc.internal.getNumberOfPages());
            }
            
            doc.text(`• ${item}`, 25, y);
            y += 6;
        });
        
        y += 10;
        
        // Materials section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('MATERIALS:', 20, y);
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        if (contractData.paintSelections?.length > 0) {
            contractData.paintSelections.forEach(paint => {
                doc.text(`• ${paint.brand} ${paint.product} - ${paint.sheen} (${paint.quantity} gallons)`, 25, y);
                y += 6;
            });
        }
        
        y += 10;
        // Terms section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TERMS & CONDITIONS:', 20, y);
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const terms = [
            `Payment Terms: ${contractData.paymentSchedule || 'Net 30'}`,
            `Warranty: ${contractData.warrantyPeriod || '2'} Year(s)`,
            'All work performed according to industry standards',
            'Change orders must be approved in writing',
            'Client responsible for clearing work areas'
        ];
        
        terms.forEach(term => {
            if (y > 250) {
                doc.addPage();
                y = this.addHeader(doc, doc.internal.getNumberOfPages());
            }
            doc.text(`• ${term}`, 25, y);
            y += 6;
        });
        
        y += 15;
        
        // Pricing section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('CONTRACT AMOUNT: ' + this.formatCurrency(contractData.totalAmount || 0), 20, y);
        
        // Signature section
        y += 20;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Contractor signature
        doc.text('Contractor:', 20, y);
        doc.line(20, y + 10, 90, y + 10);
        doc.text('Signature', 20, y + 15);
        doc.text('Date: ________________', 100, y + 15);
        
        // Client signature
        y += 30;
        doc.text('Client:', 20, y);
        doc.line(20, y + 10, 90, y + 10);
        doc.text('Signature', 20, y + 15);
        doc.text('Date: ________________', 100, y + 15);
        
        this.addFooter(doc);
        return doc;
    },

    // Helper methods
    getScopeText(projectScope) {
        const scopes = [];
        if (projectScope?.interior) scopes.push('Interior');
        if (projectScope?.exterior) scopes.push('Exterior');
        return scopes.join(' & ') || 'N/A';
    },

    generateScopeItems(data) {
        const items = [];
        const scope = data.projectScope || {};
        
        if (scope.interior) {
            items.push('Interior painting of all designated areas');
            items.push('Preparation of interior surfaces including patching and priming');
            items.push('Protection of floors and furniture during work');
        }
        
        if (scope.exterior) {
            items.push('Exterior painting of all designated surfaces');
            items.push('Power washing and surface preparation');
            items.push('Minor repairs to exterior surfaces as needed');
        }
        
        if (data.serviceTypes?.includes('abrasive')) {
            items.push('Cleaning/sandblasting of designated surfaces');
            items.push('Proper containment and disposal of debris');
        }
        
        items.push('Clean up of work areas daily');
        items.push('Final inspection and touch-ups');
        
        return items;
    },

    // Save PDF
    savePDF(doc, filename) {
        doc.save(filename);
    },

    // Print PDF
    printPDF(doc) {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }
};

// Export for use in other modules
window.PDFExporter = PDFExporter;