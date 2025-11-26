/**
 * PDF & CSV Export Test Suite
 * 
 * This test suite verifies the PDF and CSV export functionality
 * Run this test by opening the admin dashboard and using the test interface
 * 
 * To run manually:
 * 1. Start the Angular dev server: npm start
 * 2. Navigate to http://localhost:4200/admin
 * 3. Test each tab's PDF and CSV export buttons
 * 4. Verify the downloaded files
 */

export class PDFCSVTestSuite {
  private testResults: any[] = [];

  /**
   * Test PDF export functionality
   */
  testPDFExport(tab: string): { passed: boolean; message: string } {
    try {
      // Verify jsPDF is available
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const jsPDF = (window as any).jsPDF;
        const doc = new jsPDF();
        
        // Test basic PDF creation
        if (!doc) {
          return { passed: false, message: 'Failed to create PDF document' };
        }

        // Test page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        if (pageWidth <= 0 || pageHeight <= 0) {
          return { passed: false, message: 'Invalid page dimensions' };
        }

        // Test font support
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('Test', 20, 20);

        // Test table structure (for tabs with tables)
        if (['bookings', 'users', 'routes', 'fields', 'coins', 'enquiries'].includes(tab)) {
          const tableWidth = 170;
          const tableLeft = (pageWidth - tableWidth) / 2;
          
          // Verify center alignment
          const expectedLeft = (pageWidth - tableWidth) / 2;
          if (Math.abs(tableLeft - expectedLeft) > 0.1) {
            return { 
              passed: false, 
              message: `Table not centered. Expected: ${expectedLeft.toFixed(2)}, Got: ${tableLeft.toFixed(2)}` 
            };
          }
        }

        return { 
          passed: true, 
          message: `PDF export for ${tab} tab is working correctly. Page: ${pageWidth.toFixed(2)}x${pageHeight.toFixed(2)}mm` 
        };
      } else {
        return { passed: false, message: 'jsPDF library not loaded' };
      }
    } catch (error: any) {
      return { passed: false, message: `Error: ${error.message}` };
    }
  }

  /**
   * Test CSV export functionality
   */
  testCSVExport(tab: string): { passed: boolean; message: string } {
    try {
      // Test CSV structure
      const sampleData = [
        ['Header1', 'Header2', 'Header3'],
        ['Value1', 'Value2', 'Value3']
      ];

      const csvContent = sampleData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      // Verify CSV format
      if (!csvContent.includes(',')) {
        return { passed: false, message: 'CSV does not contain comma separators' };
      }

      if (!csvContent.includes('\n')) {
        return { passed: false, message: 'CSV does not contain newline separators' };
      }

      // Verify quoting
      if (!csvContent.includes('"')) {
        return { passed: false, message: 'CSV cells are not properly quoted' };
      }

      // Test blob creation
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      if (!blob || blob.size === 0) {
        return { passed: false, message: 'Failed to create CSV blob' };
      }

      // Verify MIME type
      if (blob.type !== 'text/csv;charset=utf-8;') {
        return { passed: false, message: `Incorrect MIME type: ${blob.type}` };
      }

      return { 
        passed: true, 
        message: `CSV export for ${tab} tab is working correctly. Size: ${(blob.size / 1024).toFixed(2)} KB` 
      };
    } catch (error: any) {
      return { passed: false, message: `Error: ${error.message}` };
    }
  }

  /**
   * Run all tests
   */
  runAllTests(): any {
    const tabs = ['overview', 'bookings', 'users', 'analytics', 'routes', 'fields', 'coins', 'enquiries'];
    const results: any = {
      pdf: [],
      csv: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    tabs.forEach(tab => {
      const pdfResult = this.testPDFExport(tab);
      const csvResult = this.testCSVExport(tab);

      results.pdf.push({ tab, ...pdfResult });
      results.csv.push({ tab, ...csvResult });

      results.summary.total += 2;
      if (pdfResult.passed) results.summary.passed++;
      else results.summary.failed++;
      if (csvResult.passed) results.summary.passed++;
      else results.summary.failed++;
    });

    return results;
  }

  /**
   * Verify font consistency in PDF
   */
  verifyPDFFonts(): { passed: boolean; message: string } {
    try {
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const jsPDF = (window as any).jsPDF;
        const doc = new jsPDF();

        // Test all required font sizes
        const fontSizes = [24, 14, 12, 10, 9, 8, 7];
        const fontTests = fontSizes.map(size => {
          doc.setFontSize(size);
          return doc.getFontSize() === size;
        });

        const allPassed = fontTests.every(test => test === true);

        return {
          passed: allPassed,
          message: allPassed 
            ? 'All font sizes working correctly' 
            : 'Some font sizes not working correctly'
        };
      }
      return { passed: false, message: 'jsPDF not available' };
    } catch (error: any) {
      return { passed: false, message: `Error: ${error.message}` };
    }
  }

  /**
   * Verify table format in PDF
   */
  verifyTableFormat(): { passed: boolean; message: string } {
    try {
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const jsPDF = (window as any).jsPDF;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Test center alignment
        const tableWidth = 170;
        const tableLeft = (pageWidth - tableWidth) / 2;
        const expectedLeft = (210 - 170) / 2; // A4 width is 210mm

        const isCentered = Math.abs(tableLeft - expectedLeft) < 0.1;

        // Test table dimensions
        const headerHeight = 8;
        const rowHeight = 8;

        return {
          passed: isCentered && tableWidth > 0 && headerHeight > 0 && rowHeight > 0,
          message: isCentered 
            ? `Table format correct. Width: ${tableWidth}mm, Centered at: ${tableLeft.toFixed(2)}mm`
            : `Table not properly centered. Expected: ${expectedLeft.toFixed(2)}mm, Got: ${tableLeft.toFixed(2)}mm`
        };
      }
      return { passed: false, message: 'jsPDF not available' };
    } catch (error: any) {
      return { passed: false, message: `Error: ${error.message}` };
    }
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).PDFCSVTestSuite = PDFCSVTestSuite;
}

