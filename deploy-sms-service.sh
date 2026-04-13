#!/bin/bash
# Deploy SMS service to Railway
# Usage: chmod +x deploy-sms-service.sh && ./deploy-sms-service.sh

echo "Setting up Zenoph SMS Service for Vercel deployment..."
echo ""

# Create the SMS service directory
SERVICES_DIR="sms-service-railway"
mkdir -p $SERVICES_DIR

# Copy the Flask SMS service
cp server/sms-service.py $SERVICES_DIR/app.py

# Create requirements.txt for Railway
cat > $SERVICES_DIR/requirements.txt << 'EOF'
Flask==2.3.3
python-dotenv==1.0.0
EOF

# Copy the Zenoph SDK
cp -r ../zenoph.notify-2.23.10-python $SERVICES_DIR/zenoph-sdk

# Create a Procfile for Railway
cat > $SERVICES_DIR/Procfile << 'EOF'
web: python app.py
EOF

# Create Railway configuration
cat > $SERVICES_DIR/railway.json << 'EOF'
{
  "buildCommand": "pip install -r requirements.txt",
  "startCommand": "python app.py",
  "envFile": ".env"
}
EOF

# Create initialization script
cat > $SERVICES_DIR/init.sh << 'EOF'
#!/bin/bash
# Initialize Zenoph SDK path
export PYTHONPATH="${PYTHONPATH}:./zenoph-sdk"
python app.py
EOF

chmod +x $SERVICES_DIR/init.sh

echo "✅ SMS Service setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://railway.app and sign up/login"
echo "2. Create a new project"
echo "3. Connect your GitHub repo or upload the $SERVICES_DIR folder"
echo "4. Add these environment variables in Railway:"
echo "   - SMS_API_KEY: c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b"
echo "   - SMS_SENDER_ID: ReekTickets"
echo ""
echo "5. Copy the deployed service URL"
echo "6. Add to Vercel environment:"
echo "   - SMS_SERVICE_URL: https://your-railway-app.herokuapp.com"
echo ""
echo "📁 Files created in: $SERVICES_DIR/"
