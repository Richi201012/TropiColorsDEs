import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { contactMessages, insertContactMessageSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ 
      success: false, 
      message: "Database not configured" 
    });
  }

  const sql_client = neon(process.env.DATABASE_URL);
  const db = drizzle(sql_client);

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      
      const validatedData = insertContactMessageSchema.parse(body);
      const [message] = await db.insert(contactMessages).values(validatedData).returning();
      
      return res.status(201).json({ 
        success: true, 
        message: "Mensaje enviado correctamente",
        id: message.id 
      });
    } catch (error) {
      console.error("Error saving contact message:", error);
      return res.status(400).json({ 
        success: false, 
        message: "Error al enviar el mensaje. Por favor verifica los datos." 
      });
    }
  } 
  
  if (req.method === 'GET') {
    try {
      const messages = await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error al obtener mensajes" 
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
