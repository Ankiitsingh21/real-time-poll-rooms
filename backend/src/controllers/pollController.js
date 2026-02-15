const Poll = require("../models/Poll");
const { nanoid } = require("nanoid");

const sseClients = new Map();

const broadcastPollUpdate = (pollId, pollData) => {
  const clients = sseClients.get(pollId);
  if (!clients) return;

  const data = JSON.stringify(pollData);
  clients.forEach((client) => {
    client.write(`data: ${data}\n\n`);
  });
};

const createPoll = async (req, res, next) => {
  try {
    const { question, options } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "At least 2 options are required" });
    }

    if (options.length > 10) {
      return res.status(400).json({ error: "Maximum 10 options allowed" });
    }

    const cleanedOptions = options
      .map((opt) => (typeof opt === "string" ? opt.trim() : ""))
      .filter((opt) => opt.length > 0);

    if (cleanedOptions.length < 2) {
      return res
        .status(400)
        .json({ error: "At least 2 non-empty options are required" });
    }

    const uniqueOptions = [
      ...new Set(cleanedOptions.map((o) => o.toLowerCase())),
    ];
    if (uniqueOptions.length !== cleanedOptions.length) {
      return res
        .status(400)
        .json({ error: "Duplicate options are not allowed" });
    }

    const poll = await Poll.create({
      pollId: nanoid(8),
      question: question.trim(),
      options: cleanedOptions.map((text) => ({ text, votes: 0 })),
      totalVotes: 0,
    });

    res.status(201).json({
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

const getPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ pollId: req.params.pollId }).select(
      "-votedIps -__v",
    );
    // console.log(poll);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    res.json({
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

const votePoll = async (req, res, next) => {
  try {
    const { optionId } = req.body;
    const { pollId } = req.params;

    if (!optionId) {
      return res.status(400).json({ error: "optionId is required" });
    }

    const poll = await Poll.findOne({ pollId });
    // console.log(poll);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ error: "Option not found" });
    }

    const voterIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (poll.votedIps.includes(voterIp)) {
      return res
        .status(403)
        .json({ error: "You have already voted in this poll" });
    }

    option.votes += 1;
    poll.totalVotes += 1;
    poll.votedIps.push(voterIp);

    await poll.save();

    const pollData = {
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      totalVotes: poll.totalVotes,
    };

    broadcastPollUpdate(pollId, pollData);

    res.json(pollData);
  } catch (error) {
    next(error);
  }
};

const streamPoll = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findOne({ pollId }).select("-votedIps -__v");
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const initialData = {
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      totalVotes: poll.totalVotes,
    };
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);

    if (!sseClients.has(pollId)) {
      sseClients.set(pollId, new Set());
    }
    sseClients.get(pollId).add(res);

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 30000);

    req.on("close", () => {
      clearInterval(heartbeat);
      const clients = sseClients.get(pollId);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) {
          sseClients.delete(pollId);
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPoll, getPoll, votePoll, streamPoll };
