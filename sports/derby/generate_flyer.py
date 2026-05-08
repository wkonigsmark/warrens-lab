from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors

def create_flyer():
    c = canvas.Canvas("Derby_Pool_Flyer.pdf", pagesize=letter)
    width, height = letter

    # All white background (default is white, but just to be safe)
    c.setFillColor(colors.white)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Title
    c.setFillColor(colors.HexColor("#1a3a2a"))
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(width/2.0, height - 2.5*inch, "Join the Pool!")

    # Subtitle
    c.setFillColor(colors.HexColor("#c9a84c"))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2.0, height - 3.5*inch, "2026 Run for The Roses")

    # Names
    c.setFillColor(colors.HexColor("#5a7a65"))
    c.setFont("Helvetica-Oblique", 20)
    c.drawCentredString(width/2.0, height - 4.25*inch, "Haltiners / Secors / Konigsmarks")

    # Embed the QR Code Image
    try:
        c.drawImage("derby-qr.jpg", width/2.0 - 2.5*inch, height - 9.5*inch, 5*inch, 5*inch, preserveAspectRatio=True, anchor='c')
    except Exception as e:
        print(f"Error loading QR code: {e}")
        c.setStrokeColor(colors.HexColor("#c9a84c"))
        c.setLineWidth(2)
        c.rect(width/2.0 - 2*inch, height - 9*inch, 4*inch, 4*inch, fill=0, stroke=1)
        c.setFillColor(colors.HexColor("#1a3a2a"))
        c.setFont("Helvetica", 14)
        c.drawCentredString(width/2.0, height - 7*inch, "[ ERROR LOADING QR CODE ]")

    # Footer
    c.setFont("Courier", 12)
    c.setFillColor(colors.HexColor("#1a3a2a"))
    c.drawCentredString(width/2.0, 1.5*inch, "Scan to lock in your picks.")

    c.save()

if __name__ == "__main__":
    create_flyer()
    print("Flyer created successfully as Derby_Pool_Flyer.pdf")
