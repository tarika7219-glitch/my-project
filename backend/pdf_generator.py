from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime

class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.create_custom_styles()
    
    def create_custom_styles(self):
        """Create custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#764ba2'),
            spaceAfter=6,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=10,
            alignment=TA_LEFT,
            spaceAfter=6
        ))
    
    def generate_report(self, analysis_data):
        """Generate PDF report from analysis data"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch,
            title="Resume Analysis Report"
        )
        
        story = []
        
        # Title
        story.append(Paragraph("Resume Analysis Report", self.styles['CustomTitle']))
        story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", 
                              self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Match Score Section
        match_pct = analysis_data.get('match_percentage', 0)
        story.append(Paragraph("📊 Match Score", self.styles['CustomHeading']))
        
        match_table_data = [
            ['Overall Match', f'{match_pct}%'],
        ]
        match_table = Table(match_table_data, colWidths=[2.5*inch, 2.5*inch])
        match_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 12),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#f0f0f0')),
            ('FONTNAME', (1, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (1, 0), (1, 0), 12),
            ('TEXTCOLOR', (1, 0), (1, 0), colors.HexColor('#667eea')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(match_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Summary
        summary = analysis_data.get('summary', 'No summary available')
        story.append(Paragraph("📝 Summary", self.styles['CustomHeading']))
        story.append(Paragraph(summary, self.styles['CustomBody']))
        story.append(Spacer(1, 0.2*inch))
        
        # Skills Matching
        story.append(Paragraph("✅ Matching Skills", self.styles['CustomHeading']))
        matching_skills = analysis_data.get('matching_skills', [])
        if matching_skills:
            skills_text = ', '.join(matching_skills)
            story.append(Paragraph(skills_text, self.styles['CustomBody']))
        else:
            story.append(Paragraph("No matching skills identified", self.styles['CustomBody']))
        story.append(Spacer(1, 0.15*inch))
        
        # Missing Skills
        story.append(Paragraph("❌ Missing Skills", self.styles['CustomHeading']))
        missing_skills = analysis_data.get('missing_skills', [])
        if missing_skills:
            skills_text = ', '.join(missing_skills)
            story.append(Paragraph(skills_text, self.styles['CustomBody']))
        else:
            story.append(Paragraph("No missing skills identified", self.styles['CustomBody']))
        story.append(Spacer(1, 0.15*inch))
        
        # Skills to Learn
        story.append(Paragraph("🎓 Skills to Learn (Prioritized)", self.styles['CustomHeading']))
        skills_to_learn = analysis_data.get('skills_to_learn', [])
        if skills_to_learn:
            learn_data = [[f"{i+1}.", skill] for i, skill in enumerate(skills_to_learn)]
            learn_table = Table(learn_data, colWidths=[0.5*inch, 4.5*inch])
            learn_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#f39c12')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#fffbf0')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f0f0f0')),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(learn_table)
        else:
            story.append(Paragraph("No skills to learn identified", self.styles['CustomBody']))
        story.append(Spacer(1, 0.2*inch))
        
        # Resume Improvements
        improvements = analysis_data.get('resume_improvements', {})
        if improvements:
            story.append(PageBreak())
            story.append(Paragraph("🚀 Resume Improvements", self.styles['CustomHeading']))
            
            # Quantified Achievements
            achievements = improvements.get('quantified_achievements', [])
            if achievements:
                story.append(Paragraph("Add Quantified Achievements", ParagraphStyle(
                    name='SubHeading',
                    parent=self.styles['Heading3'],
                    fontSize=11,
                    textColor=colors.HexColor('#3498db'),
                    spaceBefore=6,
                    spaceAfter=6
                )))
                for achievement in achievements:
                    story.append(Paragraph(f"• {achievement}", self.styles['CustomBody']))
                story.append(Spacer(1, 0.1*inch))
            
            # Summary Section Improvement
            summary_section = improvements.get('summary_section', '')
            if summary_section:
                story.append(Paragraph("Improve Your Summary Section", ParagraphStyle(
                    name='SubHeading',
                    parent=self.styles['Heading3'],
                    fontSize=11,
                    textColor=colors.HexColor('#2ecc71'),
                    spaceBefore=6,
                    spaceAfter=6
                )))
                story.append(Paragraph(summary_section, self.styles['CustomBody']))
                story.append(Spacer(1, 0.1*inch))
            
            # Keywords
            keywords = improvements.get('keywords', [])
            if keywords:
                story.append(Paragraph("Add Missing Tech Keywords", ParagraphStyle(
                    name='SubHeading',
                    parent=self.styles['Heading3'],
                    fontSize=11,
                    textColor=colors.HexColor('#e74c3c'),
                    spaceBefore=6,
                    spaceAfter=6
                )))
                keywords_text = ', '.join(keywords)
                story.append(Paragraph(keywords_text, self.styles['CustomBody']))
                story.append(Spacer(1, 0.1*inch))
            
            # ATS Compatibility
            ats_tips = improvements.get('ats_compatibility', '')
            if ats_tips:
                story.append(Paragraph("Improve ATS Compatibility", ParagraphStyle(
                    name='SubHeading',
                    parent=self.styles['Heading3'],
                    fontSize=11,
                    textColor=colors.HexColor('#f39c12'),
                    spaceBefore=6,
                    spaceAfter=6
                )))
                story.append(Paragraph(ats_tips, self.styles['CustomBody']))
                story.append(Spacer(1, 0.1*inch))
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(
            "This report was generated by Resume AI Analyzer. "
            "Use these insights to improve your resume and increase your job match potential.",
            ParagraphStyle(
                name='Footer',
                parent=self.styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
                alignment=TA_CENTER
            )
        ))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
