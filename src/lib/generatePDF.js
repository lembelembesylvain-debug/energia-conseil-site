import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { LOGO_PUBLIC_PATH } from './branding'
import { ecrirePiedIdentite } from './piedLegalPdf'

export const generateAuditPDF = (audit, client, photos = []) => {
  const doc = new jsPDF()

  const primaryColor = [13, 148, 136]
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 80, 'F')
  try {
    doc.addImage(LOGO_PUBLIC_PATH, 'PNG', 15, 8, 36, 21)
  } catch {
    /* logo chargé côté navigateur si disponible */
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('AUDIT ÉNERGÉTIQUE', pageWidth / 2, 35, { align: 'center' })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('Rapport complet IA', pageWidth / 2, 50, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(`Audit #${audit.id.substring(0, 8)}`, pageWidth / 2, 100, { align: 'center' })
  doc.text(`Date : ${new Date(audit.created_at).toLocaleDateString('fr-FR')}`, pageWidth / 2, 110, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Client :', 20, 130)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`${client?.nom || '-'} ${client?.prenom || ''}`, 20, 140)
  doc.text(`Email : ${client?.email || '-'}`, 20, 148)
  doc.text(`Téléphone : ${client?.telephone || '-'}`, 20, 156)

  ecrirePiedIdentite(doc, 14, pageHeight - 28, pageWidth - 28)
  doc.save(`Audit_${audit.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`)
}
