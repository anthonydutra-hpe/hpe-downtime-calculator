'use client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function PdfExportButton(){
  const handle = async ()=>{
    const el = document.body
    const canvas = await html2canvas(el as HTMLElement)
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    pdf.addImage(img, 'PNG', 20, 20, 560, 0)
    pdf.save('hpe-downtime-report.pdf')
  }
  return <button onClick={handle} className="mt-2 px-4 py-2 bg-hpe text-white rounded">Export PDF</button>
}
