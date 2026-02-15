const express = require("express");
const router = express.Router();
const {
  createPoll,
  getPoll,
  votePoll,
  streamPoll,
} = require("../controllers/pollController");

router.post("/", createPoll);
router.get("/:pollId", getPoll);
router.post("/:pollId/vote", votePoll);
router.get("/:pollId/stream", streamPoll);

module.exports = router;
