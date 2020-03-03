import Cors from "micro-cors";

import connectToDatabase from "../../utils/connectToDatabase";
import getCallSession from "../../utils/getCallSession";
import { SessionCacheDetails } from "../../types";

const cors = Cors({
  allowMethods: ["GET", "HEAD"]
});

module.exports = cors(async (req, res) => {
  // Get a database connection, cached or otherwise,
  // using the connection string environment variable as the argument
  const db = await connectToDatabase();
  const callSessions = await db.collection<SessionCacheDetails>("callSessions");

  const query = req.query;
  const { ClientId, PhoneNumber } = query;
  if (!ClientId || !PhoneNumber) {
    res.status(400).json({
      error: "Bad request. ClientId and PhoneNumber are required"
    });
    return;
  }

  // for testing POC
  let clientId = 123;

  const existingSession = await getCallSession(clientId, PhoneNumber);
  if (existingSession) {
    await callSessions.deleteOne({ _id: existingSession._id });
  }

  // Respond with a JSON string of all users in the collection
  res.status(200).json({ previousSession: existingSession });
});
