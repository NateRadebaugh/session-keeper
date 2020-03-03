import connectToDatabase from "./connectToDatabase";
import { SessionCacheDetails } from "../types";

async function getCallSession(
  clientId: number,
  phoneNumber: string
): Promise<SessionCacheDetails> {
  const db = await connectToDatabase();
  const callSessions = await db.collection<SessionCacheDetails>("callSessions");

  let existingSession = await callSessions.findOne({
    ClientId: clientId,
    PhoneNumber: phoneNumber
  });

  if (!existingSession) {
    const newSession: SessionCacheDetails = {
      ClientId: clientId,
      PhoneNumber: phoneNumber,
      Answers: []
    };

    callSessions.insertOne(newSession);
    existingSession = newSession;
  }

  return existingSession;
}

export default getCallSession;
