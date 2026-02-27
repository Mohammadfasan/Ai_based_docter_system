import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = "mongodb+srv://mohammedfasan617_db_user:t1taH4OqfnhL4bRS@cluster0.tm6rmt3.mongodb.net/myDatabaseName?retryWrites=true&w=majority";
        
        // Connection options
        const options = {
            tls: true,
            tlsAllowInvalidCertificates: true,
            ssl: true,
        };
        
        const conn = await mongoose.connect(mongoURI, options);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('⚠️ MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('❌ Full error:', error);
        process.exit(1);
    }
};

export default connectDB;