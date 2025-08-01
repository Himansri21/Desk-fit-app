import prisma from "../prisma/client.js";

export const createEvent = async (req, res) => {
  const { title, description, location, startTime, endTime, visibility } = req.body;
  const userId = req.user.id;

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        visibility,
        createdBy: { connect: { id: userId } },
      },
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: "could not create an event", details: err.message });
  }
};

export const inviteUser = async (req, res) => {
  const { id: eventId } = req.params;
  const { invitedUserId } = req.body; // FIX: renamed from inviteUserId → invitedUserId for clarity
  const inviterId = req.user.id;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "event not found" });
    if (event.createdById !== inviterId)
      return res.status(403).json({ error: "only the creator can invite" }); // FIX: changed status from 500 → 403 (forbidden)

    if (event.visibility !== "private")
      return res.status(400).json({ error: "Invites are only required for private events" });

    const invite = await prisma.eventInvite.create({
      data: {
        event: { connect: { id: eventId } },
        invitedUser: { connect: { id: invitedUserId } }, // FIX: changed inviteUser → invitedUser to match schema
        invitedBy: { connect: { id: inviterId } },
      },
    });
    res.status(201).json(invite);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "failed to invite user", details: err.message }); // FIX: changed 500 → 409 for duplicate
    }
    res.status(500).json({ error: "failed to invite user", details: err.message });
  }
};

export const respondToInvite = async (req, res) => {
  const { inviteId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  if (!["accepted", "declined"].includes(action)) {
    // FIX: changed 'accept' → 'accepted' to match enum in Prisma
    return res.status(400).json({ error: "invalid action; must be 'accepted' or 'declined'" });
  }

  try {
    const invite = await prisma.eventInvite.findUnique({ where: { id: inviteId } });
    if (!invite) return res.status(404).json({ error: "invite not found" }); // FIX: changed from 403 → 404
    if (invite.invitedUserId !== userId)
      return res.status(403).json({ error: "this invite is not for you" });

    const updated = await prisma.eventInvite.update({
      where: { id: inviteId },
      data: { status: action },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "failed to respond to invite", details: err.message });
  }
};

export const joinPublicEvent = async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user.id;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "event not found" }); // FIX: changed 403 → 404

    if (event.visibility !== "public") {
      return res.status(403).json({ error: "this response is only for joining public event" });
    }

    const existing = await prisma.eventParticipant.findFirst({
      where: { eventId, userId },
    });
    if (existing) return res.status(400).json({ error: "already joined" });

    const participant = await prisma.eventParticipant.create({
      data: {
        event: { connect: { id: eventId } },
        user: { connect: { id: userId } },
      },
    });
    res.json({ message: "Joined public event", participant });
  } catch (err) {
    res.status(500).json({ error: "could not join event", details: err.message });
  }
};

export const listPublicEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { visibility: "public" },
      include: {
        createdBy: { select: { id: true, username: true, profileImage: true } },
      },
      orderBy: { startTime: "asc" },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public events", details: err.message });
  }
};

export const listPrivateInvitedEvents = async (req, res) => {
  // FIX: renamed function from listPriavteEvents → listPrivateInvitedEvents
  const userId = req.user.id;

  try {
    // FIX: Changed from prisma.eventInvite → prisma.event to get events created by the user
    const createdPrivate = await prisma.event.findMany({
      where: {
        createdById: userId,
        visibility: "private",
      },
      include: {
        createdBy: { select: { id: true, username: true } },
      },
    });

    const invited = await prisma.eventInvite.findMany({
      where: {
        invitedUserId: userId,
        status: "accepted",
      },
      include: {
        event: {
          include: {
            createdBy: { select: { id: true, username: true, profileImage: true } },
          },
        },
      },
    });

    const invitedEvents = invited.map((i) => i.event); // FIX: fixed typo inviteed → invitedEvents

    const allPrivate = [
      ...createdPrivate,
      ...invitedEvents.filter(
        (e) => !createdPrivate.some((cp) => cp.id === e.id)
      ), // FIX: fixed filer → filter
    ];

    res.json(allPrivate);
  } catch (err) {
    return res.status(500).json({
      error: "failed to fetch private invited events",
      details: err.message,
    });
  }
};
