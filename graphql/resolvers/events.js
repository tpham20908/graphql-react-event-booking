const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('./closure');

module.exports = {
  events: async () => {
    const events = await Event.find();
    try {
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  // create event resolver
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      creator: req.userId
    });

    let createdEvent;

    // save event in db
    const result = await event.save()
    try {
      createdEvent = transformEvent(result);

      const existingUser = await User.findById(req.userId);
      if (!existingUser) {
        throw new Error('User not found.');
      }
      existingUser.createdEvents.push(event);
      await existingUser.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
}