// Die @types/pdfmake decken nur die Browser-API ab; der Node-Printer
// (pdfmake/src/printer) wird hier minimal selbst deklariert.
declare module 'pdfmake/src/printer' {
    import type { BufferOptions, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';

    class PdfPrinter {
        constructor(fonts: TFontDictionary);
        createPdfKitDocument(docDefinition: TDocumentDefinitions, options?: BufferOptions): PDFKit.PDFDocument;
    }

    export = PdfPrinter;
}
