const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const events = async eventIds => {
  const events = await Event.find({ _id: { $in: eventIds } });
  try {
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      }
    })
  } catch (err) {
    throw err;
  }
}

const user = async userId => {
  const user = await User.findById(userId)
  try {
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    }
  } catch (err) {
    throw err
  }
}

const event = async eventId => {
  const event = await Event.findById(eventId);
  try {
    return {
      ...event._doc,
      _id: event.id,
      date: new Date(event._doc.date).toISOString(),
      creator: user.bind(this, event._doc.creator)
    }
  } catch (err) {
    throw err;
  }
}

module.exports = {
  events: async () => {
    const events = await Event.find();
    try {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        }
      })
    } catch (err) {
      throw err;
    }
  },

  bookings: async () => {
    const bookings = await Booking.find();
    try {
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: event.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        }
      });
    } catch (err) {
      throw err;
    }
  },
  // create event resolver
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5cdd85159cabfb074c342e42'
    });

    let createdEvent;

    // save event in db
    const result = await event.save()
    try {
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      }

      const existingUser = await User.findById('5cdd85159cabfb074c342e42');
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
  // create user resolver
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User already exists.');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();
      return { ...result._doc, password: null, id: result.id }
    } catch (err) {
      throw err;
    }
  },
  // create booking resover
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      event: fetchedEvent,
      user: '5cdd85159cabfb074c342e42'
    });
    const result = await booking.save();
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, booking._doc.user),
      event: event.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString()
    }
  },
  // cancel booking
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      console.log(booking.event);
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
}