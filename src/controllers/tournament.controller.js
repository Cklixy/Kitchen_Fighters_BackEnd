const Tournament = require('../models/tournament.model');
const Chef = require('../models/chef.model');

async function createTournament(req, res, next) {
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
  } catch (err) {
    next(err);
  }
}

async function listTournaments(req, res, next) {
  try {
    const tournaments = await Tournament.find().populate('participants').sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    next(err);
  }
}

async function enrollChef(req, res, next) {
  try {
    const { id } = req.params; // tournament id
    const { chefId } = req.body;

    const [tournament, chef] = await Promise.all([
      Tournament.findById(id),
      Chef.findById(chefId)
    ]);

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (!chef) return res.status(404).json({ message: 'Chef not found' });

    const exists = tournament.participants.some((p) => String(p) === String(chefId));
    if (exists) return res.status(409).json({ message: 'Chef already enrolled' });

    tournament.participants.push(chefId);
    await tournament.save();

    await tournament.populate('participants');
    res.json(tournament);
  } catch (err) {
    next(err);
  }
}

async function removeChef(req, res, next) {
  try {
    const { id } = req.params; // tournament id
    const { chefId } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const initialLength = tournament.participants.length;
    tournament.participants = tournament.participants.filter((p) => String(p) !== String(chefId));

    if (tournament.participants.length === initialLength) {
      return res.status(404).json({ message: 'Chef not enrolled' });
    }

    await tournament.save();
    await tournament.populate('participants');
    res.json(tournament);
  } catch (err) {
    next(err);
  }
}

async function startTournament(req, res, next) {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findByIdAndUpdate(
      id,
      { status: 'ongoing' },
      { new: true }
    ).populate('participants');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    next(err);
  }
}

async function finishTournament(req, res, next) {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findByIdAndUpdate(
      id,
      { status: 'finished' },
      { new: true }
    ).populate('participants');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTournament,
  listTournaments,
  enrollChef,
  removeChef,
  startTournament,
  finishTournament
};
