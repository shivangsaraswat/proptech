import { db } from "../config/database";
import { ticketActivityLog, NewTicketActivityLog } from "../models/schema";
import { DbContext } from "../utils/transaction";

export const activityService = {
  /**
   * Log activity - can be called with or without transaction context
   * If called within a transaction, pass tx as second parameter
   */
  async logActivity(
    data: {
      ticketId: string;
      userId: string;
      action: string;
      details?: string;
    },
    dbOrTx: DbContext = db
  ): Promise<void> {
    await dbOrTx.insert(ticketActivityLog).values({
      ticketId: data.ticketId,
      userId: data.userId,
      action: data.action,
      details: data.details,
    });
  },
};
