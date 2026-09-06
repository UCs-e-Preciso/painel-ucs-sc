import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_RAW_DIR = path.resolve(__dirname, '../data_raw');
const OUTPUT_JSON_PATH = path.resolve(__dirname, '../public/dados.json');

function main() {
  try {
    console.log("Iniciando processamento da planilha recebida...");

    // Verifica se a pasta data_raw existe
    if (!fs.existsSync(DATA_RAW_DIR)) {
      throw new Error(`Diretório não encontrado: ${DATA_RAW_DIR}`);
    }

    const excelFilePath = path.join(DATA_RAW_DIR, 'UCs de SC-completo.xlsx');
    
    if (!fs.existsSync(excelFilePath)) {
      console.log("Arquivo 'UCs de SC-completo.xlsx' não encontrado na pasta data_raw. Processo finalizado.");
      return;
    }
    console.log(`Planilha encontrada: UCs de SC-completo.xlsx`);

    // Lê a planilha
    console.log("Convertendo Excel para JSON...");
    const excelBuffer = fs.readFileSync(excelFilePath);
    const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
    
    const allData = {};
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      allData[sheetName] = xlsx.utils.sheet_to_json(sheet, { defval: null });
    }
    
    // Garante que a pasta public existe
    const publicDir = path.dirname(OUTPUT_JSON_PATH);
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    
    // Salva o JSON
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`✅ Sucesso: JSON estático gerado em ${OUTPUT_JSON_PATH}`);

    // Removido o bloco de limpeza para manter o arquivo Excel original no repositório.
    
  } catch (err) {
    console.error("❌ Falha na conversão:", err.message);
    process.exit(1);
  }
}

main();
