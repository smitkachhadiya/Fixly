const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../../models/Booking'); 
const ServiceProvider = require('../../models/ServiceProvider'); // needed for commission calculation

let mongoServer;

beforeAll(async () => {
  // Increase timeout for MongoDB memory server creation
  jest.setTimeout(15000);
  
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27018, // Use a different port to avoid conflicts
    }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 15000); // Increase timeout to 15 seconds

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  // Clear database collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('Booking Model', () => {
  it('should create a valid Booking document', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test service'
    });

    const bookingData = {
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date('2025-01-01T10:00:00Z'),
      totalAmount: 1000
    };

    const booking = new Booking(bookingData);
    const saved = await booking.save();

    expect(saved._id).toBeDefined();
    expect(saved.bookingStatus).toBe('Pending'); // default
    expect(saved.commissionAmount).toBe(100); // 10% default
    expect(saved.providerEarning).toBe(900);
    expect(saved.commissionPaid).toBe(false); // default
  }, 10000); // Increase timeout for this test

  it('should fail validation if required fields are missing', async () => {
    const booking = new Booking({});
    let error;
    try {
      await booking.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.customerId).toBeDefined();
    expect(error.errors.serviceProviderId).toBeDefined();
    expect(error.errors.serviceListingId).toBeDefined();
    expect(error.errors.serviceDateTime).toBeDefined();
    expect(error.errors.totalAmount).toBeDefined();
  });

  it('should apply default values when not provided', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Service for defaults'
    });

    const booking = new Booking({
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date('2025-01-02T12:00:00Z'),
      totalAmount: 500
    });

    const saved = await booking.save();

    expect(saved.bookingStatus).toBe('Pending');
    expect(saved.commissionAmount).toBe(50);
    expect(saved.providerEarning).toBe(450);
    expect(saved.commissionPaid).toBe(false);
    expect(saved.bookingDateTime).toBeDefined();
  }, 10000); // Increase timeout for this test

  it('should fail if specialInstructions exceed 500 characters', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test service'
    });

    const longText = 'a'.repeat(501);
    const booking = new Booking({
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date(),
      totalAmount: 1000,
      specialInstructions: longText
    });

    let error;
    try {
      await booking.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.specialInstructions).toBeDefined();
  });

  it('should calculate commission and providerEarning correctly when totalAmount changes', async () => {
    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test service',
      commissionRate: 20
    });

    const booking = await Booking.create({
      customerId: new mongoose.Types.ObjectId(),
      serviceProviderId: provider._id,
      serviceListingId: new mongoose.Types.ObjectId(),
      serviceDateTime: new Date(),
      totalAmount: 2000
    });

    expect(booking.commissionAmount).toBe(400); // 20%
    expect(booking.providerEarning).toBe(1600);
  }, 10000); // Increase timeout for this test
});