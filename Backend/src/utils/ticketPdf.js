const PDFDocument = require('pdfkit');

function formatDate(value) {
	try {
		const d = new Date(value);
		return d.toLocaleString();
	} catch (_) {
		return String(value || '');
	}
}

// Returns a Promise<Buffer> containing the generated PDF
async function generateTicketPdfBuffer(booking, user) {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ size: 'A4', margin: 40 });
		const chunks = [];
		doc.on('data', (c) => chunks.push(c));
		doc.on('error', reject);
		doc.on('end', () => resolve(Buffer.concat(chunks)));

		// Header
		doc
			.fillColor('#2563eb')
			.fontSize(22)
			.text('GoTrip — E-Ticket', { align: 'left' })
			.moveDown(0.3);
		doc
			.fillColor('#475569')
			.fontSize(12)
			.text('Your trip details are below. Please carry a valid ID at boarding.');

		doc.moveDown();

		// Ticket info box
		doc.roundedRect(40, doc.y, 515, 140, 8).stroke('#e6ebf2');
		const boxTop = doc.y + 12;
		doc
			.fontSize(12)
			.fillColor('#0f172a')
			.text(`Passenger: ${user?.name || user?.first_name || 'Guest'}`, 56, boxTop)
			.moveDown(0.3)
			.text(`Email: ${user?.email || 'N/A'}`)
			.moveDown(0.6)
			.text(`Booking ID: GT-${booking?.id}`)
			.moveDown(0.3)
			.text(`Mode: ${booking?.travelMode || 'N/A'}`)
			.moveDown(0.3)
			.text(`From: ${booking?.fromCity || 'N/A'}    To: ${booking?.toCity || 'N/A'}`)
			.moveDown(0.3)
			.text(`Departure: ${formatDate(booking?.travelDate || booking?.departureTime)}`)
			.moveDown(0.3)
			.text(`Seats/PNR: ${Array.isArray(booking?.seatNumbers) && booking.seatNumbers.length ? booking.seatNumbers.join(', ') : (booking?.pnrNumber || 'N/A')}`)
			.moveDown(0.3)
			.text(`Amount Paid: ₹${booking?.price ?? 'N/A'}`);

		doc.moveDown(6);
		doc
			.fillColor('#64748b')
			.fontSize(10)
			.text('Terms: Please arrive at least 30 minutes before departure. Tickets are non-transferable. Subject to operator terms and local regulations.');

		doc.end();
	});
}

module.exports = { generateTicketPdfBuffer };


