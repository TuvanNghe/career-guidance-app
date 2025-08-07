// scripts/ingestFaq.ts
import { GoogleSheetsLoader }             from 'langchain/document_loaders';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings }               from '@langchain/openai';
import { Pool }                           from 'pg';
import 'dotenv/config';

async function main() {
  // 1. Load từ Google Sheets
  const loader = new GoogleSheetsLoader({
    spreadsheetId: '1BkWrajX_IC1d23QpfRwMBvyPzYzYP5GyaTLP4DoQTXA',
    sheetName    : 'FAQ'   // <--- Tên tab trong sheet; nếu khác, thay thành đúng tên
  });

  const docs = await loader.load();      // mỗi hàng → 1 Document với .pageContent = "Question\nAnswer"

  // 2. Chunk nhỏ lại (nếu câu trả lời dài)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize   : 600,
    chunkOverlap: 40
  });
  const chunks = await splitter.splitDocuments(docs);

  // 3. Embed & lưu vào Supabase pgvector
  const embedder = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  const pool     = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const chunk of chunks) {
    const embedding = await embedder.embedQuery(chunk.pageContent);
    await pool.query(
      `INSERT INTO rag_chunks (source, content, embedding)
       VALUES ($1, $2, $3)`,
      ['ggs-FAQ', chunk.pageContent, embedding]
    );
  }

  await pool.end();
  console.log(`✅ Đã ingest ${chunks.length} chunk từ Google Sheets FAQ.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
