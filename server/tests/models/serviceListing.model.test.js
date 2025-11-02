const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ServiceListing = require('../../models/ServiceListing');
const ServiceCategory = require('../../models/ServiceCategory');
const ServiceProvider = require('../../models/ServiceProvider');

let mongoServer;

beforeAll(async () => {
  // Increase timeout for MongoDB memory server creation
  jest.setTimeout(15000);
  
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27019, // Use a different port to avoid conflicts
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

describe('ServiceListing Model', () => {
  it('should create a valid ServiceListing document', async () => {
    // Create required references
    const category = await ServiceCategory.create({
      categoryName: 'Test Category',
      categoryDescription: 'Test Description'
    });

    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test service'
    });

    const listingData = {
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: 'Test Service',
      servicePrice: 100,
      serviceDetails: 'Test service details'
    };

    const listing = new ServiceListing(listingData);
    const saved = await listing.save();

    expect(saved._id).toBeDefined();
    expect(saved.serviceTitle).toBe('Test Service');
    expect(saved.servicePrice).toBe(100);
    expect(saved.isActive).toBe(true); // default
  }, 10000); // Increase timeout for this test

  it('should fail validation if required fields are missing', async () => {
    const listing = new ServiceListing({});
    let error;
    
    try {
      await listing.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.serviceProviderId).toBeDefined();
    expect(error.errors.categoryId).toBeDefined();
    expect(error.errors.serviceTitle).toBeDefined();
    expect(error.errors.servicePrice).toBeDefined();
    expect(error.errors.serviceDetails).toBeDefined();
  });

  it('should enforce max length for serviceTitle and serviceDetails', async () => {
    // Create required references
    const category = await ServiceCategory.create({
      categoryName: 'Test Category',
      categoryDescription: 'Test Description'
    });

    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test service'
    });

    const longTitle = 'a'.repeat(101); // Exceeds max length of 100
    const longDetails = 'b'.repeat(1001); // Exceeds max length of 1000

    const listing = new ServiceListing({
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: longTitle,
      servicePrice: 100,
      serviceDetails: longDetails
    });

    let error;
    try {
      await listing.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.serviceTitle).toBeDefined();
    expect(error.errors.serviceDetails).toBeDefined();
  });

  it('should set default serviceImage if null or undefined', async () => {
    // Create required references
    const category = await ServiceCategory.create({
      categoryName: 'Test Category',
      categoryDescription: 'Test Description'
    });

    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test service'
    });

    const listingData = {
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: 'Test Service',
      servicePrice: 100,
      serviceDetails: 'Test service details',
      serviceImage: null // Should be set to empty string
    };

    const listing = new ServiceListing(listingData);
    const saved = await listing.save();

    expect(saved.serviceImage).toBe(''); // Should default to empty string
  });

  it('should calculate commission and providerEarning correctly', async () => {
    // Create required references
    const category = await ServiceCategory.create({
      categoryName: 'Test Category',
      categoryDescription: 'Test Description'
    });

    const provider = await ServiceProvider.create({
      userId: new mongoose.Types.ObjectId(),
      serviceDescription: 'Test service',
      commissionRate: 15 // 15% commission
    });

    const listing = await ServiceListing.create({
      serviceProviderId: provider._id,
      categoryId: category._id,
      serviceTitle: 'Test Service',
      servicePrice: 1000,
      serviceDetails: 'Test service details'
    });

    expect(listing.commissionAmount).toBe(150); // 15% of 1000
    expect(listing.providerEarning).toBe(850); // 1000 - 150
  }, 10000); // Increase timeout for this test
});