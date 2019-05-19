const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformEvent, transformBooking } = require('./closure');

module.exports = {
  bookings: async () => {
    const bookings = await Booking.find();
    try {
      return bookings.map(booking => {
        return transformBooking(booking);
      });
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
    return transformBooking(result);
  },
  // cancel booking
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
}