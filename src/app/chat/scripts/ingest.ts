// scripts/ingest.ts
import { CheerioWebBaseLoader, GoogleSheetsLoader } from 'langchain/document_loaders';
import { RecursiveCharacterTextSplitter }           from 'langchain/text_splitter';
import { OpenAIEmbeddings }                         from '@langchain/openai';
import { Pool }                                     from 'pg';
import 'dotenv/config';

async function ingestBlog(pool: Pool, embedder: OpenAIEmbeddings) {
  const loader = new CheerioWebBaseLoader(
    'https://career-guidance-app-v1.vercel.app/blog',
    { selector: 'article.post' }
  );
  const docs    = await loader.load();
  const chunks  = await new RecursiveCharacterTextSplitter({ chunkSize:800, chunkOverlap:80 })
                      .splitDocuments(docs);
  for (const c of chunks) {
    const v = await embedder.embedQuery(c.pageContent);
    await pool.query(
      'INSERT INTO rag_chunks (source, content, embedding) VALUES ($1,$2,$3)',
      ['blog', c.pageContent, v]
    );
  }
}

async function ingestFaq(pool: Pool, embedder: OpenAIEmbeddings) {
  const loader = new GoogleSheetsLoader({
    spreadsheetId: '1BkWrajX_IC1d23QpfRwMBvyPzYzYP5GyaTLP4DoQTXA',
    sheetName: 'FAQ'
  });
  const docs   = await loader.load();
  const chunks = await new RecursiveCharacterTextSplitter({ chunkSize:600, chunkOverlap:40 })
                      .splitDocuments(docs);
  for (const c of chunks) {
    const v = await embedder.embedQuery(c.pageContent);
    await pool.query(
      'INSERT INTO rag_chunks (source, content, embedding) VALUES ($1,$2,$3)',
      ['ggs-FAQ', c.pageContent, v]
    );
  }
}

async function main() {
  const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
  const embedder= new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  await ingestBlog(pool, embedder);
  await ingestFaq(pool, embedder);
  await pool.end();
  console.log('✅ Ingest blog & FAQ xong');
}

main().catch(console.error);
