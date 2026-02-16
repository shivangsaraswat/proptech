import { db } from "../config/database";
import { users, tickets, ticketImages, ticketActivityLog, notifications } from "../models/schema";
import { hashPassword } from "../utils/password";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log("🗑️  Clearing existing data...");
    await db.delete(notifications);
    await db.delete(ticketActivityLog);
    await db.delete(ticketImages);
    await db.delete(tickets);
    await db.delete(users);

    // Create demo users
    console.log("👥 Creating demo users...");
    const hashedPassword = await hashPassword("password123");

    const [tenant, manager, technician] = await db
      .insert(users)
      .values([
        {
          name: "Ahmed Tenant",
          email: "tenant@demo.com",
          passwordHash: hashedPassword,
          role: "tenant",
          phone: "+1234567890",
          isActive: true,
        },
        {
          name: "Sara Manager",
          email: "manager@demo.com",
          passwordHash: hashedPassword,
          role: "manager",
          phone: "+1234567891",
          isActive: true,
        },
        {
          name: "Ali Technician",
          email: "technician@demo.com",
          passwordHash: hashedPassword,
          role: "technician",
          phone: "+1234567892",
          isActive: true,
        },
      ])
      .returning();

    console.log("✅ Created 3 demo users");

    // Create demo tickets
    console.log("🎫 Creating demo tickets...");
    const [ticket1, ticket2, ticket3, ticket4] = await db
      .insert(tickets)
      .values([
        {
          title: "Leaking faucet in kitchen",
          description:
            "The kitchen faucet is leaking water constantly. It started yesterday and is wasting a lot of water. Please fix urgently.",
          priority: "high",
          status: "open",
          unitNumber: "Apt 3B",
          building: "Sunrise Towers",
          createdBy: tenant.id,
        },
        {
          title: "Broken window in living room",
          description: "Window pane is cracked and needs replacement. May be a safety hazard.",
          priority: "medium",
          status: "assigned",
          unitNumber: "Apt 5A",
          building: "Sunrise Towers",
          createdBy: tenant.id,
          assignedTo: technician.id,
        },
        {
          title: "AC not cooling properly",
          description: "The air conditioning unit is running but not cooling the room effectively.",
          priority: "low",
          status: "in_progress",
          unitNumber: "Apt 2C",
          building: "Sunset Plaza",
          createdBy: tenant.id,
          assignedTo: technician.id,
        },
        {
          title: "Door lock not working",
          description: "Front door lock is jammed and difficult to open with key.",
          priority: "urgent",
          status: "done",
          unitNumber: "Apt 1A",
          building: "Sunrise Towers",
          createdBy: tenant.id,
          assignedTo: technician.id,
        },
      ])
      .returning();

    console.log("✅ Created 4 demo tickets");

    // Add activity logs
    console.log("📝 Creating activity logs...");
    await db.insert(ticketActivityLog).values([
      {
        ticketId: ticket1.id,
        userId: tenant.id,
        action: "created",
        details: "Created ticket: Leaking faucet in kitchen",
      },
      {
        ticketId: ticket2.id,
        userId: tenant.id,
        action: "created",
        details: "Created ticket: Broken window in living room",
      },
      {
        ticketId: ticket2.id,
        userId: manager.id,
        action: "updated",
        details: "Assigned to Ali Technician",
      },
      {
        ticketId: ticket3.id,
        userId: tenant.id,
        action: "created",
        details: "Created ticket: AC not cooling properly",
      },
      {
        ticketId: ticket3.id,
        userId: manager.id,
        action: "updated",
        details: "Assigned to Ali Technician",
      },
      {
        ticketId: ticket3.id,
        userId: technician.id,
        action: "updated",
        details: "Status changed from assigned to in_progress",
      },
      {
        ticketId: ticket4.id,
        userId: tenant.id,
        action: "created",
        details: "Created ticket: Door lock not working",
      },
      {
        ticketId: ticket4.id,
        userId: manager.id,
        action: "updated",
        details: "Assigned to Ali Technician",
      },
      {
        ticketId: ticket4.id,
        userId: technician.id,
        action: "updated",
        details: "Status changed from in_progress to done",
      },
    ]);

    console.log("✅ Created activity logs");

    // Add notifications
    console.log("🔔 Creating notifications...");
    await db.insert(notifications).values([
      {
        userId: technician.id,
        title: "New Ticket Assigned",
        message: "You have been assigned to: Broken window in living room",
        type: "ticket_assigned",
        relatedTicketId: ticket2.id,
        isRead: false,
      },
      {
        userId: technician.id,
        title: "New Ticket Assigned",
        message: "You have been assigned to: AC not cooling properly",
        type: "ticket_assigned",
        relatedTicketId: ticket3.id,
        isRead: true,
      },
      {
        userId: tenant.id,
        title: "Ticket Status Updated",
        message: 'Ticket "Door lock not working" status changed to: done',
        type: "ticket_status_changed",
        relatedTicketId: ticket4.id,
        isRead: false,
      },
    ]);

    console.log("✅ Created notifications");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Tenant:");
    console.log("  Email: tenant@demo.com");
    console.log("  Password: password123");
    console.log("\nManager:");
    console.log("  Email: manager@demo.com");
    console.log("  Password: password123");
    console.log("\nTechnician:");
    console.log("  Email: technician@demo.com");
    console.log("  Password: password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
