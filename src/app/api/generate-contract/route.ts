import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const contrato = `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Pelo presente instrumento particular, de um lado ${data.contratante}, inscrito no CPF ${data.cpfContratante}, e de outro lado ${data.contratado}, inscrito no CPF ${data.cpfContratado}, têm entre si justo e contratado o seguinte:

Cláusula 1ª - Objeto  
O contratado prestará os serviços de ${data.servico} com início em ${data.dataInicio} e término em ${data.dataFim}, conforme as condições aqui estipuladas.

Cláusula 2ª - Remuneração  
O valor acordado para a prestação dos serviços é de R$${data.valor}. O pagamento será efetuado da seguinte forma: 50% no início do serviço e 50% na entrega final, salvo acordo diferente entre as partes por escrito.

Cláusula 3ª - Alterações no Escopo  
Caso o contratante solicite modificações, ampliações ou ajustes no serviço que não tenham sido previamente acordados neste contrato, o valor total será revisto, podendo haver acréscimos conforme o novo escopo. Tais alterações deverão ser registradas por escrito e aprovadas por ambas as partes.

Cláusula 4ª - Obrigações do Contratante  
O contratante deverá fornecer todas as informações e documentos necessários para a execução dos serviços, bem como efetuar os pagamentos nos prazos acordados.

Cláusula 5ª - Prazo e Rescisão  
O contrato vigorará pelo prazo estipulado, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias, sem prejuízo do cumprimento das obrigações pendentes.

Cláusula 6ª - Confidencialidade  
Ambas as partes se comprometem a manter em sigilo todas as informações confidenciais obtidas durante a vigência deste contrato.

Cláusula 7ª - Foro  
Para dirimir quaisquer controvérsias oriundas deste contrato, fica eleito o foro da comarca de ${data.local}, com renúncia a qualquer outro. E, por estarem assim justos e contratados, firmam o presente contrato em duas vias de igual teor.

${data.local}, ___/___/____

Assinatura CONTRATANTE: _______________________

Assinatura CONTRATADO: _______________________
    `.trim();

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pageWidth = 595;
        const pageHeight = 842;
        const fontSize = 12;
        const margin = 50;
        const lineHeight = 18;

        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        const lines = contrato.split("\n");

        for (const line of lines) {
            const wrappedLines = line.match(/.{1,90}/g) || [line];

            for (const subline of wrappedLines) {
                if (y < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                }

                page.drawText(subline.trim(), {
                    x: margin,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                });

                y -= lineHeight;
            }
        }

        const pdfBytes = await pdfDoc.save();

        return new Response(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=contrato.pdf",
            },
        });
    } catch (error) {
        console.error("Erro ao gerar o PDF:", error);
        return new Response("Erro interno ao gerar o contrato.", { status: 500 });
    }
}
