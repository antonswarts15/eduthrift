#!/bin/bash

# Eduthrift Deployment Manager
# Usage: ./deploy.sh [qa|prod|both|stop]

case "$1" in
  "qa")
    echo "🚀 Deploying QA Environment..."
    docker-compose -f docker-compose.qa.yml down
    docker-compose -f docker-compose.qa.yml up -d --build
    echo "✅ QA Environment running on:"
    echo "   Frontend: http://localhost:4000"
    echo "   Backend:  http://localhost:4001"
    echo "   Database: localhost:4306"
    ;;
    
  "prod")
    echo "🚀 Deploying Production Environment..."
    if [ ! -f .env.prod ]; then
      echo "❌ Error: .env.prod file not found!"
      echo "   Copy .env.prod.template to .env.prod and configure"
      exit 1
    fi
    docker-compose -f docker-compose.prod.yml --env-file .env.prod down
    docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
    echo "✅ Production Environment running on:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo "   Database: localhost:3306"
    ;;
    
  "both")
    echo "🚀 Deploying Both Environments..."
    ./deploy.sh qa
    ./deploy.sh prod
    ;;
    
  "stop")
    echo "🛑 Stopping All Environments..."
    docker-compose -f docker-compose.qa.yml down
    docker-compose -f docker-compose.prod.yml down
    echo "✅ All environments stopped"
    ;;
    
  *)
    echo "Eduthrift Deployment Manager"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  qa     - Deploy QA environment (ports 4000-4002)"
    echo "  prod   - Deploy Production environment (ports 3000-3002)"
    echo "  both   - Deploy both environments"
    echo "  stop   - Stop all environments"
    echo ""
    echo "Environments:"
    echo "  QA:   For app store testing (sandbox APIs)"
    echo "  Prod: For live users (production APIs)"
    ;;
esac