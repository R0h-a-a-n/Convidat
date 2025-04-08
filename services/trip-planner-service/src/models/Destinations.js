import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
});

destinationSchema.index({ location: '2dsphere' });

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
