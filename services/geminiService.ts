import { GoogleGenAI } from "@google/genai";
import { User } from "../types";

// NOTE: Ideally this comes from process.env.API_KEY, handled by the developer instructions.
// The user of the generated code must ensure the environment variable is set or the key is provided.
const getClient = () => {
    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
      console.warn("API Key is missing for Gemini");
      return null;
    }
    return new GoogleGenAI({ apiKey });
}

export const generateFilialReport = async (filialName: string, users: User[]): Promise<string> => {
  const client = getClient();
  if (!client) return "Erro: Chave API não configurada.";

  const userDataSummary = users.map(u => 
    `- Nome: ${u.nomeCompleto}, Dept: ${u.departamento}, Setor: ${u.setor}, Data: ${new Date(u.dataCadastro).toLocaleDateString()}`
  ).join('\n');

  const prompt = `
    Você é um assistente executivo de RH. Gere um relatório executivo breve e profissional em Português do Brasil para a filial "${filialName}".
    
    Dados dos usuários desta filial:
    ${userDataSummary}

    O relatório deve conter:
    1. Um resumo da distribuição de departamentos.
    2. Uma observação sobre o crescimento recente (baseado nas datas).
    3. Sugestões de ação baseadas na distribuição dos setores.
    
    Use formatação Markdown. Seja conciso.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao comunicar com o serviço de IA. Verifique sua conexão e chave de API.";
  }
};