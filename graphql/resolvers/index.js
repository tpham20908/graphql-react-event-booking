const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event._doc.creator)
        }
      })
    })
    .catch(err => { throw err })
}

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      }
    })
    .catch(err => { throw err });
}

module.exports = {
  events: () => {
    return Event.find()
      .then(events => {
        return events.map(event => {
          return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event._doc.creator)
          }
        })
      })
      .catch(err => {
        throw err;
      })
  },
  // create event resolver
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5cdcb8b1e382c52d00c76134'
    });

    let createdEvent;

    // save event in db
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          _id: result._doc._id.toString(),
          creator: user.bind(this, result._doc.creator)
        };
        return User.findById('5cdcb8b1e382c52d00c76134');
      })
      .then(user => {
        if (!user) {
          throw new Error('User not found.');
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(() => {
        // return event as return type of mutation schema
        return createdEvent;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
  // create user resolver
  createUser: args => {
    return User
      .findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error('User already exists.');
        }
        return bcrypt.hash(args.userInput.password, 12)
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, password: null, id: result.id }
      })
      .catch(err => { throw err; })
  }
}