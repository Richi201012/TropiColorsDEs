import type { VercelRequest, VercelResponse } from "@vercel/node";
import { firebaseStorage } from "../server/storage-firebase.js";
import { simpleStorage } from "../server/storage-simple.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let orders;
    try {
      orders = await firebaseStorage.getAllOrders();
    } catch (firebaseError) {
      console.log("Firebase not available, using simple storage");
      orders = simpleStorage.getAllOrders();
    }
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    try {
      const orders = simpleStorage.getAllOrders();
      return res.json({ success: true, orders });
    } catch (fallbackError) {
      return res.status(500).json({ success: false, message: "Error fetching orders" });
    }
  }
}
