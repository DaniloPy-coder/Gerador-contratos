"use client";

import { useState, useRef, useEffect } from "react";

interface FormData {
  contratante: string;
  cpfContratante: string;
  contratado: string;
  cpfContratado: string;
  local: string;
  servico: string;
  valor: string;
  dataInicio: string;
  dataFim: string;
}

export default function Page() {
  const contractRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showContrato, setShowContrato] = useState(false);

  const [form, setForm] = useState<FormData>({
    contratante: "",
    cpfContratante: "",
    contratado: "",
    cpfContratado: "",
    local: "",
    servico: "",
    valor: "",
    dataInicio: "",
    dataFim: "",
  });

  // Carrega dados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("contratoForm");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  // Salva no localStorage
  useEffect(() => {
    localStorage.setItem("contratoForm", JSON.stringify(form));
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof FormData;
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const gerarContrato = () => {
    const hasEmptyFields = Object.values(form).some((val) => val.trim() === "");
    if (hasEmptyFields) {
      alert("Preencha todos os campos antes de gerar o contrato.");
      return;
    }

    setShowContrato(true);
  };

  const exportPDF = async () => {
    const hasEmptyFields = Object.values(form).some((val) => val.trim() === "");
    if (hasEmptyFields) {
      alert("Preencha todos os campos antes de baixar o PDF.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert("Erro ao gerar o PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "contrato.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar o PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">
          📄 Gerador de Contratos
        </h1>

        <div className="space-y-4">
          {(Object.entries({
            contratante: "Nome do Contratante",
            cpfContratante: "CPF do Contratante",
            contratado: "Nome do Contratado",
            cpfContratado: "CPF do Contratado",
            servico: "Serviço Prestado",
            local: "Cidade",
            valor: "Valor (R$)",
            dataInicio: "Data de Início",
            dataFim: "Data de Término",
          }) as [keyof FormData, string][]).map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              {name === "servico" ? (
                <textarea
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-gray-700 border rounded px-3 py-2"
                />
              ) : (
                <input
                  type={name.includes("data") ? "date" : "text"}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full text-gray-700 border rounded px-3 py-2"
                />
              )}
            </div>
          ))}

          <div className="flex gap-4 mt-4">
            <button
              onClick={gerarContrato}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              Visualizar Contrato
            </button>

            <button
              onClick={exportPDF}
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Gerando..." : "Baixar PDF"}
            </button>
          </div>
        </div>
      </div>

      {showContrato && (
        <div className="max-w-3xl mx-auto bg-white mt-8 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-600">Contrato Gerado</h2>

          <div ref={contractRef} id="print-area">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
              {`
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Pelo presente instrumento particular, de um lado ${form.contratante}, inscrito no CPF ${form.cpfContratante}, e de outro lado ${form.contratado}, inscrito no CPF ${form.cpfContratado}, têm entre si justo e contratado o seguinte:

Cláusula 1ª - Objeto  
O contratado prestará os serviços de ${form.servico} com início em ${form.dataInicio} e término em ${form.dataFim}, conforme as condições aqui estipuladas.

Cláusula 2ª - Remuneração  
O valor acordado para a prestação dos serviços é de R$${form.valor}. O pagamento será efetuado da seguinte forma: 50% no início do serviço e 50% na entrega final, salvo acordo diferente entre as partes por escrito.

Cláusula 3ª - Alterações no Escopo  
Caso o contratante solicite modificações, ampliações ou ajustes no serviço que não tenham sido previamente acordados neste contrato, o valor total será revisto, podendo haver acréscimos conforme o novo escopo. Tais alterações deverão ser registradas por escrito e aprovadas por ambas as partes.

Cláusula 4ª - Obrigações do Contratado  
O contratado se compromete a executar os serviços com zelo, diligência e conforme as normas técnicas aplicáveis.

Cláusula 5ª - Obrigações do Contratante  
O contratante deverá fornecer todas as informações e documentos necessários para a execução dos serviços, bem como efetuar os pagamentos nos prazos acordados.

Cláusula 6ª - Prazo e Rescisão  
O contrato vigorará pelo prazo estipulado, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias, sem prejuízo do cumprimento das obrigações pendentes.

Cláusula 7ª - Confidencialidade  
Ambas as partes se comprometem a manter em sigilo todas as informações confidenciais obtidas durante a vigência deste contrato.

Cláusula 8ª - Foro  
Para dirimir quaisquer controvérsias oriundas deste contrato, fica eleito o foro da comarca de ${form.local}, com renúncia a qualquer outro. E, por estarem assim justos e contratados, firmam o presente contrato em duas vias de igual teor.

Cláusula 9ª - Responsabilidade Civil  
O contratado será responsável por eventuais danos causados ao contratante decorrentes de dolo ou negligência comprovada na execução dos serviços.

Cláusula 10ª - Propriedade Intelectual  
Todos os materiais, produtos ou resultados gerados durante a prestação dos serviços serão de propriedade do contratante, salvo acordo prévio por escrito.

Cláusula 11ª - Subcontratação  
O contratado não poderá transferir ou subcontratar total ou parcialmente os serviços objeto deste contrato sem autorização prévia e por escrito do contratante.

Cláusula 12ª - Comunicação entre as Partes  
Toda e qualquer comunicação relacionada a este contrato deverá ser feita por escrito e enviada aos endereços de e-mail fornecidos pelas partes no momento da assinatura.

Cláusula 13ª - Caso Fortuito e Força Maior  
As partes não serão responsabilizadas por eventuais falhas no cumprimento das obrigações aqui pactuadas quando decorrentes de caso fortuito ou força maior, nos termos do artigo 393 do Código Civil.

Cláusula 14ª - Validade  
Se qualquer cláusula deste contrato for considerada inválida ou inexequível por um tribunal competente, as demais cláusulas permanecerão em pleno vigor e efeito.

${form.local}, ${dataHoje}

Assinatura CONTRATANTE: _______________________

Assinatura CONTRATADO: _______________________
              `}
            </pre>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Imprimir Contrato
          </button>
        </div>
      )}
    </div>
  );
}
