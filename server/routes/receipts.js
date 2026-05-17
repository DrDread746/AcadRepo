import express from 'express';
import PDFDocument from 'pdfkit';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Purchase a book copy and create a tracking receipt ledger record
router.post('/', auth, async (req, res) => {
  try {
    const { resource_id, amount_paid } = req.body;
    const user_id = req.user.id;

    if (!resource_id) {
      return res.status(400).json({ error: 'resource_id is required' });
    }

    const checkResource = await pool.query(
      "SELECT id, title FROM resources WHERE id = $1 AND type = 'book'",
      [resource_id]
    );

    if (checkResource.rows.length === 0) {
      return res.status(404).json({ error: 'Specified academic book resource not found' });
    }

    const receipt_number = 'REC-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    const result = await pool.query(
      `INSERT INTO receipts (receipt_number, user_id, resource_id, amount_paid, payment_status)
       VALUES ($1, $2, $3, $4, 'completed') RETURNING *`,
      [receipt_number, user_id, resource_id, amount_paid || 0.00]
    );

    res.status(201).json({ message: 'Receipt issued successfully', receipt: result.rows[0] });
  } catch (error) {
    console.error('Issue receipt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all book copy receipts owned by the currently authenticated user
router.get('/my-receipts', auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      `SELECT r.*, res.title as book_title 
       FROM receipts r 
       JOIN resources res ON r.resource_id = res.id 
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch user receipts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Aggregate data analytical reports about library book inventory distributions
router.get('/analytics/books', auth, async (req, res) => {
  try {
    const bookCountRes = await pool.query(
      "SELECT COUNT(*) as total_books, COUNT(CASE WHEN verified THEN 1 END) as verified_books FROM resources WHERE type = 'book'"
    );

    const receiptStatsRes = await pool.query(
      "SELECT COUNT(*) as total_receipts, COALESCE(SUM(amount_paid), 0) as total_revenue FROM receipts"
    );

    const booksBySubjectRes = await pool.query(
      `SELECT s.name as subject_name, s.code as subject_code, COUNT(r.id) as book_count
       FROM subjects s
       LEFT JOIN resources r ON r.subject_id = s.id AND r.type = 'book'
       GROUP BY s.id, s.name, s.code
       ORDER BY book_count DESC`
    );

    const popularBooksRes = await pool.query(
      `SELECT r.id, r.title, s.name as subject_name, COUNT(rec.id) as receipts_count, r.downloads_count
       FROM resources r
       JOIN subjects s ON r.subject_id = s.id
       LEFT JOIN receipts rec ON rec.resource_id = r.id
       WHERE r.type = 'book'
       GROUP BY r.id, r.title, s.name, r.downloads_count
       ORDER BY receipts_count DESC, r.downloads_count DESC
       LIMIT 5`
    );

    res.json({
      summary: {
        total_books: parseInt(bookCountRes.rows[0].total_books || 0),
        verified_books: parseInt(bookCountRes.rows[0].verified_books || 0),
        total_receipts_issued: parseInt(receiptStatsRes.rows[0].total_receipts || 0),
        total_revenue_collected: parseFloat(receiptStatsRes.rows[0].total_revenue || 0)
      },
      analytics: {
        books_distribution_by_subject: booksBySubjectRes.rows,
        top_performing_books: popularBooksRes.rows
      }
    });
  } catch (error) {
    console.error('Aggregate book analytics database query failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Render dynamic structured PDF report and stream out to browser client
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT rec.*, u.name as user_name, u.email as user_email, 
              res.title as book_title, s.name as subject_name, s.code as subject_code
       FROM receipts rec
       JOIN users u ON rec.user_id = u.id
       JOIN resources res ON rec.resource_id = res.id
       JOIN subjects s ON res.subject_id = s.id
       WHERE rec.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction invoice entry data point not found' });
    }

    const data = result.rows[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${data.receipt_number}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // --- Header Section ---
    doc.fillColor('#10B981').fontSize(22).text('ACADREPO HUB RECEIPT', 50, 50, { bold: true });
    doc.fillColor('#6B7280').fontSize(10).text('Official System Transaction Ledger Statement', 50, 75);
    doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#E5E7EB').stroke();

    // --- Invoice Columns Info ---
    const columnTop = 115;
    doc.fillColor('#111827').fontSize(11).text('STATEMENT METADATA', 50, columnTop, { bold: true });
    doc.fillColor('#4B5563').fontSize(9)
       .text(`Receipt Database Token ID: ${data.id}`, 50, columnTop + 18)
       .text(`System Reference ID: ${data.receipt_number}`, 50, columnTop + 32)
       .text(`Timestamp Issued: ${new Date(data.created_at).toLocaleString()}`, 50, columnTop + 46);

    doc.fillColor('#111827').fontSize(11).text('RECIPIENT ACCOUNT', 320, columnTop, { bold: true });
    doc.fillColor('#4B5563').fontSize(9)
       .text(`Account User Identification ID: ${data.user_id}`, 320, columnTop + 18)
       .text(`Profile Username Name: ${data.user_name}`, 320, columnTop + 32)
       .text(`Contact Registry Email Address: ${data.user_email}`, 320, columnTop + 46);

    // --- Grid List Layout ---
    const gridTop = 200;
    doc.rect(50, gridTop, 495, 25).fill('#F9FAFB');
    doc.fillColor('#374151').fontSize(10).text('Academic Catalog Resource Item Description Summary', 60, gridTop + 8);
    doc.text('Status Ledger', 360, gridTop + 8, { width: 80, align: 'center' });
    doc.text('Subtotal Price', 450, gridTop + 8, { width: 80, align: 'right' });

    const itemRowTop = gridTop + 35;
    doc.fillColor('#111827').fontSize(10).text(data.book_title, 60, itemRowTop, { width: 280, bold: true });
    doc.fillColor('#6B7280').fontSize(9).text(`Course Branch Curricula Subject: ${data.subject_name} [${data.subject_code}]`, 60, itemRowTop + 16);
    
    doc.fillColor('#047857').fontSize(9).text(data.payment_status.toUpperCase(), 360, itemRowTop, { width: 80, align: 'center' });
    doc.fillColor('#111827').fontSize(10).text(`$${parseFloat(data.amount_paid).toFixed(2)}`, 450, itemRowTop, { width: 80, align: 'right' });

    doc.moveTo(50, itemRowTop + 45).lineTo(545, itemRowTop + 45).strokeColor('#F3F4F6').stroke();

    // --- Totals ---
    const calculationAreaTop = itemRowTop + 65;
    doc.fillColor('#4B5563').fontSize(10).text('Aggregate Net Amount Balance Due:', 280, calculationAreaTop, { align: 'right', width: 160 });
    doc.fillColor('#10B981').fontSize(12).text(`$${parseFloat(data.amount_paid).toFixed(2)}`, 450, calculationAreaTop, { align: 'right', width: 80, bold: true });

    // --- Footer Notice Signature ---
    doc.fillColor('#9CA3AF').fontSize(8).text('This receipt confirmation has been auto-generated by the internal server processes of the AcadRepo platform architecture and acts as a verified proof-of-access ledger payload document for electronic scholarly resource distribution protocols.', 50, 720, { align: 'center', width: 495 });

    doc.end();
  } catch (error) {
    console.error('PDF document compiler engine failed runtime stream execution:', error);
    res.status(500).setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ error: 'Server could not assemble structural PDF document binary configuration' }));
  }
});
// Add this route to your server/routes/receipts.js file

// Render dynamic structured Analytics Report as a retail shop-style receipt
router.get('/analytics/download-pdf', auth, async (req, res) => {
  try {
    // 1. Gather live system database analytics fields matching the screen metrics
    const bookCountRes = await pool.query(
      "SELECT COUNT(*) as total_books, COUNT(CASE WHEN verified THEN 1 END) as verified_books FROM resources WHERE type = 'book'"
    );

    const receiptStatsRes = await pool.query(
      "SELECT COUNT(*) as total_receipts, COALESCE(SUM(amount_paid), 0) as total_revenue FROM receipts"
    );

    const booksBySubjectRes = await pool.query(
      `SELECT s.name as subject_name, s.code as subject_code, COUNT(r.id) as book_count
       FROM subjects s
       LEFT JOIN resources r ON r.subject_id = s.id AND r.type = 'book'
       GROUP BY s.id, s.name, s.code
       ORDER BY book_count DESC`
    );

    const summary = {
      total_books: parseInt(bookCountRes.rows[0].total_books || 0),
      verified_books: parseInt(bookCountRes.rows[0].verified_books || 0),
      total_receipts_issued: parseInt(receiptStatsRes.rows[0].total_receipts || 0),
      total_revenue_collected: parseFloat(receiptStatsRes.rows[0].total_revenue || 0)
    };

    // 2. Configure response content header parameters to trigger an direct browser download stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=AcadRepo-Platform-Analytics.pdf');

    // Initialize compact shop-receipt styled PDF canvas size parameters 
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    // --- RETAIL SHOP STYLE PDF FORMATTING ---
    
    // Project Header Banner Accent
    doc.fillColor('#4B5563').fontSize(24).text(' ACADREPO ', { align: 'center', bold: true });
    doc.fillColor('#4B5563').fontSize(10).text('ACADEMIC INVENTORY & TRANSACTIONS MANAGEMENT', { align: 'center' });
    doc.text(`DATE GENERATED: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text('-------------------------------------------------------------------------', { align: 'center' }).moveDown(1);

    // Summary KPIs Block Section
    doc.fillColor('#111827').fontSize(12).text('METRICS SUMMARY LEDGER', { bold: true });
    doc.fillColor('#374151').fontSize(10)
       .text(`TOTAL CATALOGED TITLES: ....................................... ${summary.total_books}`)
       .text(`VERIFIED COPIES AVAILABLE: ................................... ${summary.verified_books}`)
       .text(`SYSTEM RECEIPTS TRANSACTED: .................................. ${summary.total_receipts_issued}`)
       .moveDown(1.5);

    doc.fillColor('#4B5563').fontSize(10).text('-------------------------------------------------------------------------', { align: 'center' }).moveDown(1);

    // Subject Distribution Grid Layout Table Header
    doc.fillColor('#111827').fontSize(12).text('SUBJECT CURRICULA VOLUMES INDEX', { bold: true }).moveDown(0.5);
    
    let yPosition = doc.y;
    doc.fontSize(10).fillColor('#111827')
       .text('SUBJECT DESCRIPTION TRACK', 45, yPosition, { bold: true })
       .text('CODE', 340, yPosition, { bold: true })
       .text('VOLUME COUNT', 440, yPosition, { bold: true, align: 'right', width: 90 });
    
    doc.text('=========================================================================', 40, yPosition + 12);
    yPosition += 28;

    // Table Data Matrix Rendering
    booksBySubjectRes.rows.forEach((subject) => {
      // Prevent page clipping overflow limits
      if (yPosition > 720) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.fillColor('#374151').fontSize(9)
         .text(subject.subject_name.toUpperCase(), 45, yPosition, { width: 280, lineBreak: false })
         .text(subject.subject_code, 340, yPosition)
         .text(subject.book_count.toString(), 440, yPosition, { align: 'right', width: 90 });
      
      yPosition += 22;
    });

    // Footer Block Notice Sign-off
    doc.moveDown(2);
    doc.fillColor('#4B5563').fontSize(10).text('-------------------------------------------------------------------------', { align: 'center' });
    doc.fillColor('#9CA3AF').fontSize(9)
       .text('*** END OF REPORT LEDGER ***', { align: 'center', bold: true })
       .text('ACADREPO ANALYTICS SYSTEM TRANSACTION DISPATCH ENGINE', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Analytics PDF export stream compile crash:', error);
    res.status(500).setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ error: 'Server failed to assemble custom receipt-style report view data stream' }));
  }
});
export default router;