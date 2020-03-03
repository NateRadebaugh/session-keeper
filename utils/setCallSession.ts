import connectToDatabase from "./connectToDatabase";
import { SessionCacheDetails } from "../types";

async function setCallSession(
  callSession: SessionCacheDetails
): Promise<SessionCacheDetails> {
  const db = await connectToDatabase();
  const callSessions = await db.collection<SessionCacheDetails>("callSessions");

  const filters = {
    ClientId: callSession.ClientId,
    PhoneNumber: callSession.PhoneNumber
  };
  let existingSession = await callSessions.findOne(filters);

  // No existing, insert new
  if (!existingSession) {
    await callSessions.insertOne(callSession);
    existingSession = callSession;
  } else {
    await callSessions.updateOne(filters, { $set: callSession });
  }

  return existingSession;
}

export default setCallSession;
