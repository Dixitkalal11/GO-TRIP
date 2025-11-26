# PDF & CSV Export Verification Guide

## Overview
This guide provides instructions for verifying the PDF and CSV export functionality, including font consistency, table formatting, and center alignment.

## Test Files
1. **pdf-csv-test.html** - Interactive test suite for browser-based testing
2. **Manual Verification Checklist** - Step-by-step verification process

## Quick Start

### Option 1: Interactive Test Suite
1. Open `pdf-csv-test.html` in a web browser
2. Click individual test buttons or "Run Complete Test Suite"
3. Review test results and download sample files

### Option 2: Manual Testing in Admin Dashboard
1. Navigate to the Admin Dashboard (`/admin`)
2. Test each tab's PDF and CSV export
3. Verify using the checklist below

## Verification Checklist

### PDF Export Verification

#### ✅ Font Verification
- [ ] **Header Font**: 24pt, bold, white color (GoTrip title)
- [ ] **Subtitle Font**: 14pt, normal, light gray
- [ ] **Section Headers**: 14pt, bold, dark gray
- [ ] **Table Headers**: 9pt, bold, white
- [ ] **Table Body**: 8pt, normal, dark gray
- [ ] **Status Badges**: 7pt, bold, white
- [ ] **All fonts use Helvetica family**

#### ✅ Table Format Verification
- [ ] **Center Alignment**: All tables are centered on the page
- [ ] **Table Width**: Consistent 170mm width
- [ ] **Column Alignment**: Text properly aligned within columns
- [ ] **Row Height**: Consistent 8-9mm row height
- [ ] **Header Height**: 8mm header height
- [ ] **Alternating Rows**: Even rows have light gray background (#F9FAFB)
- [ ] **Borders**: Subtle row borders (0.3mm, light gray)
- [ ] **Text Truncation**: Long text properly truncated with ellipsis

#### ✅ Content Verification
- [ ] **Headers**: PDF header with GoTrip logo and report type
- [ ] **Footers**: Page numbers and generation date
- [ ] **Section Headers**: Properly formatted section titles
- [ ] **Status Badges**: Colored badges for status indicators
- [ ] **Currency Formatting**: Proper ₹ symbol and formatting
- [ ] **Date Formatting**: Consistent date format (DD-MMM-YYYY)

#### ✅ Special Features (Analytics)
- [ ] **Charts Included**: Revenue trends line chart visible
- [ ] **Pie Chart**: Bookings by travel mode chart visible
- [ ] **Chart Quality**: Charts are clear and readable
- [ ] **Chart Titles**: Charts have proper titles
- [ ] **Data Tables**: Revenue trends and top routes tables included

### CSV Export Verification

#### ✅ Format Verification
- [ ] **CSV Structure**: Proper comma-separated values
- [ ] **Quoting**: All cells properly quoted with double quotes
- [ ] **Headers**: First row contains column headers
- [ ] **Encoding**: UTF-8 encoding for special characters
- [ ] **Line Breaks**: Proper newline characters between rows

#### ✅ Data Verification
- [ ] **Complete Data**: All rows exported correctly
- [ ] **No Missing Values**: Empty cells handled properly
- [ ] **Special Characters**: Commas, quotes, newlines properly escaped
- [ ] **Data Types**: Numbers, strings, dates formatted correctly
- [ ] **Currency**: Currency values properly formatted

## Tab-Specific Verification

### Overview Tab
**PDF Checks:**
- [ ] Metric cards displayed (4 cards in 2x2 grid)
- [ ] Revenue breakdown table with Monthly/Quarterly/Yearly data
- [ ] All content center-aligned

**CSV Checks:**
- [ ] Headers: Metric, Value
- [ ] All statistics included
- [ ] Currency values properly formatted

### Bookings Tab
**PDF Checks:**
- [ ] Table with columns: Booking ID, User, Route, Mode, Amount, Status
- [ ] Route displayed as "City → City"
- [ ] Status badges with colors (green=confirmed, yellow=pending, red=cancelled)
- [ ] Currency formatting for amounts

**CSV Checks:**
- [ ] Headers: Booking ID, User Name, User Email, From City, To City, Travel Mode, Operator, Travel Date, Price, Status
- [ ] All booking data included

### Users Tab
**PDF Checks:**
- [ ] Table with columns: Name, Email, Coins, Bookings, Member Since
- [ ] Coins displayed in gold/yellow color
- [ ] Bookings count in green
- [ ] Date format: DD-MMM

**CSV Checks:**
- [ ] Headers: Name, Email, Coins, Total Bookings, Created At
- [ ] All user data included

### Analytics Tab
**PDF Checks:**
- [ ] **Charts**: Revenue trends line chart included
- [ ] **Charts**: Bookings by travel mode pie chart included
- [ ] Metric cards (4 cards)
- [ ] Revenue trends data table
- [ ] Top routes table

**CSV Checks:**
- [ ] Headers: Metric, Value
- [ ] Total Revenue, Total Bookings, Confirmation Rate included

### Routes Tab
**PDF Checks:**
- [ ] Table with columns: Route, Mode, Operator, Price, Duration
- [ ] Route format: "City → City"
- [ ] Travel mode in uppercase
- [ ] Price in green with currency symbol

**CSV Checks:**
- [ ] Headers: From City, To City, Travel Mode, Operator, Price, Duration, Departure Time, Arrival Time, Active
- [ ] All route data included

### Fields Tab
**PDF Checks:**
- [ ] Table with columns: Field, Label, Type, Mode, Req, Active
- [ ] Required badge (YES/NO) with color
- [ ] Active badge (YES/NO) with color
- [ ] Travel mode in uppercase

**CSV Checks:**
- [ ] Headers: Field Name, Label, Type, Travel Mode, Required, Active, Order, Placeholder
- [ ] All field data included

### Coins Tab
**PDF Checks:**
- [ ] Table with columns: Package, Coins, Price, Type, Disc, Status
- [ ] Coins amount in gold/yellow
- [ ] Price in green with currency
- [ ] Status badge (ACTIVE/INACTIVE)

**CSV Checks:**
- [ ] Headers: Name, Amount, Price, Type, Discount, Active, Popular, Sales
- [ ] All coin package data included

### Enquiries Tab
**PDF Checks:**
- [ ] Table with columns: ID, Name, Email, Subject, Status
- [ ] Status badge with colors
- [ ] Text truncation for long subjects

**CSV Checks:**
- [ ] Headers: ID, Name, Email, Subject, Status
- [ ] All enquiry data included

## Common Issues & Solutions

### Issue: PDF tables not centered
**Solution**: Verify `tableLeft = (pageWidth - tableWidth) / 2` calculation

### Issue: Fonts not rendering correctly
**Solution**: Ensure Helvetica font family is used consistently

### Issue: Charts not appearing in Analytics PDF
**Solution**: Ensure Chart.js charts are rendered before PDF generation

### Issue: CSV special characters breaking format
**Solution**: Verify all cells are properly quoted with double quotes

### Issue: Status badges overlapping text
**Solution**: Check badge width and text alignment

## Performance Testing

### PDF Generation
- [ ] **Small Dataset** (< 50 rows): Should generate in < 2 seconds
- [ ] **Medium Dataset** (50-200 rows): Should generate in < 5 seconds
- [ ] **Large Dataset** (> 200 rows): Should generate in < 10 seconds

### CSV Generation
- [ ] **Any Dataset**: Should generate in < 1 second

## Browser Compatibility

Test in the following browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if applicable)

## File Size Expectations

### PDF Files
- **Overview**: ~50-100 KB
- **Bookings** (20 rows): ~100-200 KB
- **Users** (18 rows): ~80-150 KB
- **Analytics** (with charts): ~200-400 KB
- **Routes** (2760 rows): ~500 KB - 2 MB
- **Fields** (8 rows): ~50-100 KB
- **Coins** (6 rows): ~50-100 KB
- **Enquiries**: ~50-150 KB

### CSV Files
- All tabs: < 100 KB (unless very large datasets)

## Notes

1. **Charts in PDF**: Charts are converted from Canvas to base64 images. Ensure Chart.js is loaded before generating Analytics PDF.

2. **Center Alignment**: All tables use the formula: `tableLeft = (pageWidth - tableWidth) / 2` where `pageWidth = 210mm` (A4 width) and `tableWidth = 170mm`.

3. **Font Consistency**: All text uses Helvetica font family with appropriate sizes:
   - Headers: 24pt, 14pt
   - Table headers: 9pt
   - Table body: 8pt
   - Badges: 7pt

4. **Color Scheme**:
   - Header background: #1F2937 (dark gray)
   - Table header: #3B82F6 (blue)
   - Status confirmed: #22C55E (green)
   - Status pending: #FBBF24 (yellow)
   - Status cancelled: #DC2626 (red)

## Automated Testing

For automated testing, use the `pdf-csv-test.html` file which includes:
- PDF generation tests
- CSV generation tests
- Font verification
- Table format verification
- Center alignment checks
- Download functionality tests

Run the test suite and review the results to ensure all features are working correctly.

