import PDFDocument from "pdfkit";
import Attendance from "../models/Attendance.js";
import Event from "../models/Event.js";

// @desc  Generate and download a certificate for an attended event
// @route GET /api/certificates/:eventId
export const generateCertificate = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      user: req.user._id,
      event: req.params.eventId,
    });

    if (!attendance) {
      return res.status(403).json({ message: "You did not attend this event, so no certificate is available" });
    }

    const event = await Event.findById(req.params.eventId).populate("society", "name");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const doc = new PDFDocument({ layout: "landscape", size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Certificate-${event.title.replace(/\s+/g, "_")}.pdf"`
    );

    doc.pipe(res);

    // Border
    doc
      .lineWidth(3)
      .strokeColor("#334155")
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .stroke();

    doc
      .fontSize(12)
      .fillColor("#64748b")
      .font("Helvetica")
      .text("CAMPUSCONNECT", 0, 90, { align: "center" });

    doc
      .fontSize(32)
      .fillColor("#1e293b")
      .font("Helvetica-Bold")
      .text("Certificate of Attendance", 0, 130, { align: "center" });

    doc
      .fontSize(14)
      .fillColor("#64748b")
      .font("Helvetica")
      .text("This certifies that", 0, 200, { align: "center" });

    doc
      .fontSize(26)
      .fillColor("#334155")
      .font("Helvetica-Bold")
      .text(req.user.name, 0, 230, { align: "center" });

    doc
      .fontSize(14)
      .fillColor("#64748b")
      .font("Helvetica")
      .text("attended", 0, 280, { align: "center" });

    doc
      .fontSize(20)
      .fillColor("#1e293b")
      .font("Helvetica-Bold")
      .text(event.title, 0, 305, { align: "center" });

    doc
      .fontSize(13)
      .fillColor("#64748b")
      .font("Helvetica")
      .text(
        `organized by ${event.society?.name || "CampusConnect"} on ${new Date(
          event.startDateTime
        ).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        0,
        340,
        { align: "center" }
      );

    doc
      .fontSize(10)
      .fillColor("#94a3b8")
      .text(
        `Certificate ID: ${attendance._id}`,
        0,
        doc.page.height - 80,
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};