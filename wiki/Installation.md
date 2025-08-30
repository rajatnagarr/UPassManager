# Installation Guide

This guide provides step-by-step instructions for setting up and deploying the UPassManager application.

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Git
- AWS account (or Azure/other cloud provider)
- Database (MongoDB, PostgreSQL, etc.)

## Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://gitlab.com/your-group/upassmanager.git
   cd upassmanager
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   cd upass-manager
   npm install
   
   # Install backend API dependencies
   cd backend-api
   npm install
   
   # Install backend common dependencies
   cd ../backend-common
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL=your_database_connection_string
   
   # Authentication
   JWT_SECRET=your_jwt_secret
   
   # Cloud Storage
   CLOUD_STORAGE_BUCKET=your_bucket_name
   
   # API Keys
   API_KEY=your_api_key
   ```

4. **Run Development Server**
   ```bash
   # Start the frontend
   cd upass-manager
   npm run dev
   
   # In a separate terminal, start the backend API
   cd upass-manager/backend-api
   npm run dev
   ```

5. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

## Production Deployment

### AWS Deployment

1. **Set Up AWS Resources**
   - Create an S3 bucket for static assets
   - Set up an RDS instance for the database
   - Configure Lambda functions for serverless backend
   - Set up API Gateway for API endpoints
   - Configure CloudFront for content delivery

2. **Configure CI/CD Pipeline**
   - Set up GitLab CI/CD pipeline using the `.gitlab-ci.yml` file
   - Configure AWS credentials as GitLab CI/CD variables
   - Set up deployment stages (build, test, deploy)

3. **Deploy the Application**
   ```bash
   # Build the application
   npm run build
   
   # Deploy to AWS
   # This can be automated through the CI/CD pipeline
   ```

### Docker Deployment

1. **Build Docker Images**
   ```bash
   # Build frontend image
   docker build -t upassmanager-frontend ./upass-manager
   
   # Build backend image
   docker build -t upassmanager-backend ./upass-manager/backend-api
   ```

2. **Run Docker Containers**
   ```bash
   # Run frontend container
   docker run -p 3000:3000 upassmanager-frontend
   
   # Run backend container
   docker run -p 3001:3001 upassmanager-backend
   ```

## Troubleshooting

- **Database Connection Issues**: Verify that your database connection string is correct and that the database server is running.
- **API Errors**: Check the API logs for detailed error messages.
- **Frontend Build Failures**: Ensure that all dependencies are installed correctly.

## Next Steps

After installation, refer to the [User Guide](UserGuide) for information on how to use the application.
