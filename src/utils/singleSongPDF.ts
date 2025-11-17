import { PDFDocument, PDFFont, PDFPage, rgb, RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { SongData } from './types';
import { generateQRCode } from './qrCodeGenerator';
import { FONT_PATH } from './fontConfig';
import * as unorm from 'unorm';
import { embedImage } from './pdfBookUtils';

// types
export type PDFBorderOptions = {
  enabled: boolean;
  color?: [number, number, number]; // 0–1 each
  width?: number;                   // stroke width
  imageUrl?: string;                // optional decorative border image
  imageInset?: number;              // margin inside page, e.g. 18
};

export type SingleSongPdfOptions = {
  border?: PDFBorderOptions;
  qrNote?: string; // override note text
};


export async function embedFont(pdfDoc: PDFDocument, fontPath: string): Promise<PDFFont> {
  const fontBytes = await fetch(fontPath).then(res => res.arrayBuffer());
  pdfDoc.registerFontkit(fontkit);
  return await pdfDoc.embedFont(fontBytes, { subset: false });
}

export async function generateSingleSongPage(
  pdfDoc: PDFDocument, 
  song: SongData,
  options: SingleSongPdfOptions = {}
): Promise<PDFPage[]> {
  const pages: PDFPage[] = [];
  let page = pdfDoc.addPage();
  pages.push(page);
  const { width, height } = page.getSize();
  const font = await embedFont(pdfDoc, FONT_PATH);
  // const borderEnabled = !!options.border?.enabled;
  // const borderInset = options.border?.imageUrl ? (options.border?.imageInset ?? 18) : (borderEnabled ? 36 : 0);

  const border = options?.border ?? { enabled: false };

  const borderInset = border.imageUrl ? (border.imageInset ?? 18) : (border.enabled ? 36 : 0);

// after computing border/borderInset
const borderImg = border.enabled && border.imageUrl ? await embedImage(pdfDoc, border.imageUrl) : null;
const drawBorder = (p: PDFPage) => {
  if (!border.enabled) return;
  if (borderImg) {
    p.drawImage(borderImg, { x: borderInset, y: borderInset, width: width - borderInset*2, height: height - borderInset*2 });
  } else {
    const [r,g,b] = border.color ?? [0.6,0.6,0.6]; const stroke = border.width ?? 1; 
    const m = 36;
    p.drawRectangle({ x: m, y: m, width: p.getWidth()-m*2, height: p.getHeight()-m*2, borderColor: rgb(r,g,b), borderWidth: stroke });
  }
};
drawBorder(page)


  // Draw border first (image or line)
  // if (border.enabled && border.imageUrl) {
  //   const img = await embedImage(pdfDoc, border.imageUrl);
  //   page.drawImage(img, { 
  //     x: borderInset, 
  //     y: borderInset, 
  //     width: width - borderInset*2, 
  //     height: height - borderInset*2 
  //   });
  // } else if (border.enabled) {
  //   const [r, g, b] = border.color ?? [0.6, 0.6, 0.6];
  //   const stroke = border.width ?? 1;
  //   const m = 36;
  //   page.drawRectangle({
  //     x: m, y: m, width: width - m*2, height: height - m*2,
  //     borderColor: rgb(r, g, b),
  //     borderWidth: stroke,
  //   });
  // }


  // Dynamic content margins (keep clear of border and page edge)
  const contentMargin = Math.max(50, borderInset + 20);
  let y = height - contentMargin - 30;

// 1) Optional image border (behind content)
// if (options.border?.enabled && options.border.imageUrl) {
//   const inset = options.border.imageInset ?? 18;
//   const img = await embedImage(pdfDoc, options.border.imageUrl);
//   page.drawImage(img, {
//     x: inset,
//     y: inset,
//     width: width - inset * 2,
//     height: height - inset * 2,
//     opacity: 1,
//   });
// }

// ... draw title/lyrics/translation ...

// 2) Optional stroked rectangle border (if no image)
// else if (options.border?.enabled && !options.border.imageUrl) {
//   const color = options.border.color ?? [0.6, 0.6, 0.6];
//   const stroke = options.border.width ?? 1;
//   const margin = 36;
//   page.drawRectangle({
//     x: margin,
//     y: margin,
//     width: width - margin * 2,
//     height: height - margin * 2,
//     borderColor: rgb(color[0], color[1], color[2]),
//     borderWidth: stroke,
//   });
// }

 
  // let y = height - 50;
  // Add centered title
  y = drawUnicodeText(page, song.title, {
    x: width / 2,
    y,
    size: 24,
    font,
    color: rgb(0, 0, 0),
    align: 'center'
  });
  y -= 40;

  // Draw lyrics
  const lyricsWithoutHistory = song.lyrics.filter(st => !st.some(l => l.startsWith('History:')));
  let result = drawSection(page, lyricsWithoutHistory, font, y, width, pdfDoc, contentMargin, drawBorder);

  // let result = drawSection(page, song.lyrics, font, y, width, pdfDoc, contentMargin);
  // let result = drawSection(page, song.lyrics, font, y, width, pdfDoc, contentMargin, drawBorder);
  y = result.currentY;
  page = result.page;
  if (!pages.includes(page)) pages.push(page);

  // Draw translation if available
  if (song.translation && song.translation.length > 0) {
    y -= 20;
    
    y = drawUnicodeText(page, 'Translation', {
      x: width / 2,
      y,
      size: 18,
      font,
      color: rgb(0, 0, 0),
      align: 'center'
    });
    y -= 20;

    // result = drawSection(page, song.translation, font, y, width, pdfDoc, contentMargin);
    result = drawSection(page, song.translation, font, y, width, pdfDoc, contentMargin, drawBorder);
    y = result.currentY;
    page = result.page;
  }


// History derived from lyrics, split into paragraph-stanzas so it can page-break cleanly
const historyIdx = song.lyrics.findIndex(st => st.some(l => l.startsWith('History:')));
if (historyIdx !== -1) {
  const historyLines = song.lyrics[historyIdx];
  const paragraphs: string[][] = [];
  let current: string[] = [];
  for (const line of historyLines) {
    if (line.trim() === '') {
      if (current.length) { paragraphs.push(current); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length) paragraphs.push(current);

  // small gap; no forced new page
  y -= 12;
  result = drawSection(page, paragraphs, font, y, width, pdfDoc, contentMargin, drawBorder);
  y = result.currentY;
  page = result.page;
}
  
  // Generate and draw QR code
  const qrCodeDataUrl = await generateQRCode(`https://ilahiapp.com/songs/${song.slug}`);
  const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
  const qrCodeDims = qrCodeImage.scale(0.5);
  const x = (width - qrCodeDims.width) / 2;


  if (y - qrCodeDims.height - 50 < contentMargin) {
    page = pdfDoc.addPage();
    drawBorder(page);
    y = page.getSize().height - contentMargin;
  }
 
  const qrX = (width - qrCodeDims.width) / 2;
  page.drawImage(qrCodeImage, {
    x: qrX,
    y: y - qrCodeDims.height,
    width: qrCodeDims.width,
    height: qrCodeDims.height,
  });

  // at the end of each page render
  // page.drawRectangle({
  //   x: 36, y: 36,
  //   width: page.getWidth() - 72,
  //   height: page.getHeight() - 72,
  //   borderColor: rgb(0.6, 0.6, 0.6),
  //   borderWidth: 1,
  // });

  // Add "Link to the App" text next to QR code
  drawUnicodeText(page, 'Link to the ilahi on the app', {
    x: width /2,
    y: y - qrCodeDims.height - 16,
    size: 14,
    font,
    color: rgb(0, 0, 0),
    align: 'center'
  });

  y -= qrCodeDims.height + 20;

  return pages;
}



function drawUnicodeText(page: PDFPage, text: string, options: {
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB,
  align?: 'left' | 'center' | 'right'
}): number {
  const { x, y, size, font, color, align = 'left' } = options;
  const normalizedText = unorm.nfc(text);
  let currentX = x;
  const textWidth = font.widthOfTextAtSize(normalizedText, size);

  if (align === 'center') {
    currentX -= textWidth / 2;
  } else if (align === 'right') {
    currentX -= textWidth;
  }

  page.drawText(normalizedText, { x: currentX, y, size, font, color });

  return y;
}

function drawSection(page: PDFPage, content: string[][], font: PDFFont, startY: number, width: number, pdfDoc: PDFDocument, margin: number, drawBorder: (p: PDFPage) => void): { currentY: number, page: PDFPage } {

// function drawSection(page: PDFPage, content: string[][], font: PDFFont, startY: number, width: number, pdfDoc: PDFDocument, margin: number): { currentY: number, page: PDFPage } {
  let currentY = startY;
  const { height } = page.getSize();
  const fontSize = 14;
  const lineSpacing = 16;
  // const margin = 50; // Add a margin

  content.forEach((stanza) => {
    const stanzaHeight = stanza.length * lineSpacing + 20; // 20 for stanza spacing
    if (currentY - stanzaHeight < margin) {
      page = pdfDoc.addPage();
      drawBorder(page);
      currentY = height - margin;
    }
    
    stanza.forEach(line => {
      const textWidth = font.widthOfTextAtSize(line, fontSize);
      const x = (width - textWidth) / 2;
      
      if (x < margin) {
        // If the text is too wide, we need to wrap it
        const words = line.split(' ');
        let currentLine = '';
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > width - 2 * margin) {
            drawUnicodeText(page, currentLine, {
              x: width / 2,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
              align: 'center'
            });
            if (currentY < margin + lineSpacing) {
              page = pdfDoc.addPage();
              drawBorder(page);
              currentY = page.getSize().height - margin;
            }            
            currentY -= lineSpacing;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          drawUnicodeText(page, currentLine, {
            x: width / 2,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
            align: 'center'
          });
          currentY -= lineSpacing;
        }
      } else {
        currentY = drawUnicodeText(page, line, {
          x: width / 2,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
          align: 'center'
        });
        currentY -= lineSpacing;
      }
    });
    currentY -= 20; // Space between stanzas
  });

  return { currentY, page };
}