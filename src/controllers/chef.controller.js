const Chef = require('../models/chef.model');

async function createChef(req, res, next) {
  try {
    const chef = await Chef.create(req.body);
    res.status(201).json(chef);
  } catch (err) {
    next(err);
  }
}

async function listChefs(req, res, next) {
  try {
    const chefs = await Chef.find().sort({ createdAt: -1 });
    res.json(chefs);
  } catch (err) {
    next(err);
  }
}

async function getChef(req, res, next) {
  try {
    const chef = await Chef.findById(req.params.id);
    if (!chef) return res.status(404).json({ message: 'Chef not found' });
    res.json(chef);
  } catch (err) {
    next(err);
  }
}

async function updateChef(req, res, next) {
  try {
    const chef = await Chef.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!chef) return res.status(404).json({ message: 'Chef not found' });
    res.json(chef);
  } catch (err) {
    next(err);
  }
}

async function deleteChef(req, res, next) {
  try {
    const chef = await Chef.findByIdAndDelete(req.params.id);
    if (!chef) return res.status(404).json({ message: 'Chef not found' });
    res.json({ message: 'Chef deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createChef,
  listChefs,
  getChef,
  updateChef,
  deleteChef
};
