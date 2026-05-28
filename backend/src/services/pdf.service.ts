import { jsPDF } from 'jspdf';
import { IGeneratedPaper } from '../types';

export function generatePDF(paper: IGeneratedPaper): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = 20;

  const lineHeight = 6;
  const sectionGap = 10;

  function checkPageBreak(requiredSpace: number): void {
    if (y + requiredSpace > pageHeight - 25) {
      doc.addPage();
      y = 20;
    }
  }

  function drawHorizontalLine(yPos: number): void {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  }

  function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth) as string[];
  }

  // ─── HEADER ────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = wrapText(paper.title, contentWidth, 18);
  for (const line of titleLines) {
    checkPageBreak(10);
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 8;
  }
  y += 2;

  // Subject and Grade
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subject: ${paper.subject}`, marginLeft, y);
  doc.text(`Grade: ${paper.grade}`, pageWidth - marginRight, y, { align: 'right' });
  y += lineHeight;

  // Total Marks and Duration
  doc.text(`Total Marks: ${paper.totalMarks}`, marginLeft, y);
  doc.text(`Duration: ${paper.duration}`, pageWidth - marginRight, y, { align: 'right' });
  y += lineHeight + 2;

  drawHorizontalLine(y);
  y += 6;

  // ─── STUDENT INFO ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Student Information', marginLeft, y);
  y += lineHeight + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const labelWidth = 30;
  const fieldWidth = (contentWidth - labelWidth * 2 - 10) / 2;

  // Row 1: Name and Roll Number
  doc.text('Name:', marginLeft, y);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(marginLeft + labelWidth, y, marginLeft + labelWidth + fieldWidth, y);

  const col2X = marginLeft + labelWidth + fieldWidth + 10;
  doc.text('Roll No:', col2X, y);
  doc.line(col2X + labelWidth, y, col2X + labelWidth + fieldWidth, y);
  y += lineHeight + 2;

  // Row 2: Section and Date
  doc.text('Section:', marginLeft, y);
  doc.line(marginLeft + labelWidth, y, marginLeft + labelWidth + fieldWidth, y);

  doc.text('Date:', col2X, y);
  doc.line(col2X + labelWidth, y, col2X + labelWidth + fieldWidth, y);
  y += lineHeight + 4;

  drawHorizontalLine(y);
  y += 6;

  // ─── GENERAL INSTRUCTIONS ─────────────────────────────────
  if (paper.instructions && paper.instructions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('General Instructions:', marginLeft, y);
    y += lineHeight + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    for (let i = 0; i < paper.instructions.length; i++) {
      const instructionText = `${i + 1}. ${paper.instructions[i]}`;
      const lines = wrapText(instructionText, contentWidth - 5, 9);
      for (const line of lines) {
        checkPageBreak(lineHeight);
        doc.text(line, marginLeft + 3, y);
        y += lineHeight - 1;
      }
      y += 1;
    }

    y += 3;
    drawHorizontalLine(y);
    y += sectionGap;
  }

  // ─── SECTIONS & QUESTIONS ─────────────────────────────────
  for (const section of paper.sections) {
    checkPageBreak(25);

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(section.title, pageWidth / 2, y, { align: 'center' });
    y += lineHeight;

    // Section description
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    const descLines = wrapText(section.description, contentWidth, 10);
    for (const line of descLines) {
      checkPageBreak(lineHeight);
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += lineHeight - 1;
    }
    y += 2;

    // Section instructions
    if (section.instructions) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const instrLines = wrapText(`Instructions: ${section.instructions}`, contentWidth, 9);
      for (const line of instrLines) {
        checkPageBreak(lineHeight);
        doc.text(line, marginLeft, y);
        y += lineHeight - 1;
      }
      y += 2;
    }

    // Section marks
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`[Total Marks: ${section.totalMarks}]`, pageWidth - marginRight, y, { align: 'right' });
    y += lineHeight + 2;

    // Questions
    for (const question of section.questions) {
      checkPageBreak(20);

      // Question number and text with marks
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const qNumText = `Q${question.questionNumber}.`;
      doc.text(qNumText, marginLeft, y);

      const marksText = `[${question.marks} Mark${question.marks > 1 ? 's' : ''}]`;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(marksText, pageWidth - marginRight, y, { align: 'right' });

      // Difficulty tag
      const difficultyTag = `(${question.difficulty})`;
      const marksWidth = doc.getTextWidth(marksText);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(difficultyTag, pageWidth - marginRight - marksWidth - 3, y, { align: 'right' });

      // Question text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const qTextStartX = marginLeft + 12;
      const qTextWidth = contentWidth - 12 - 30; // Leave space for marks
      const qTextLines = wrapText(question.text, qTextWidth, 10);

      for (let lineIdx = 0; lineIdx < qTextLines.length; lineIdx++) {
        if (lineIdx === 0) {
          doc.text(qTextLines[lineIdx], qTextStartX, y);
        } else {
          y += lineHeight;
          checkPageBreak(lineHeight);
          doc.text(qTextLines[lineIdx], qTextStartX, y);
        }
      }
      y += lineHeight + 1;

      // MCQ Options
      if (question.type === 'MCQ' && question.options && question.options.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        const optionLabels = ['(a)', '(b)', '(c)', '(d)'];
        for (let optIdx = 0; optIdx < question.options.length; optIdx++) {
          checkPageBreak(lineHeight);
          let optionText = question.options[optIdx];

          // If option doesn't already start with a label, add one
          const hasLabel = /^\s*\(?[a-dA-D]\)?[\.\)]\s*/.test(optionText);
          if (!hasLabel && optIdx < optionLabels.length) {
            optionText = `${optionLabels[optIdx]} ${optionText}`;
          }

          const optLines = wrapText(optionText, qTextWidth - 10, 9);
          for (const optLine of optLines) {
            checkPageBreak(lineHeight);
            doc.text(optLine, qTextStartX + 8, y);
            y += lineHeight - 1;
          }
        }
        y += 2;
      }

      y += 3;
    }

    // Section separator
    y += 3;
    if (paper.sections.indexOf(section) < paper.sections.length - 1) {
      checkPageBreak(5);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(marginLeft + 20, y, pageWidth - marginRight - 20, y);
      y += sectionGap;
    }
  }

  // ─── FOOTER: End of Paper ─────────────────────────────────
  checkPageBreak(15);
  y += 5;
  drawHorizontalLine(y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('--- End of Question Paper ---', pageWidth / 2, y, { align: 'center' });

  // Convert to Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
