pipeline {
    agent any

    environment {
        AWS_REGION       = "ap-south-1"
        AWS_ACCOUNT_ID   = "101762432072"
        IMAGE_TAG        = "${env.BUILD_ID}"

        FRONTEND_REPO    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/studypal-frontend"
        BACKEND_REPO     = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/studypal-backend"
        AI_REPO          = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/studypal-ai-service"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/dhaval-narale/Study-Pal-Gemini.git'
            }
        }

        stage('Configure AWS Credentials') {
            steps {
                withAWS(credentials: 'AWS Credentials', region: "${AWS_REGION}") {
                    sh """
                        aws sts get-caller-identity
                    """
                }
            }
        }

        stage('Login to ECR') {
            steps {
                withAWS(credentials: 'aws-creds', region: "${AWS_REGION}") {
                    sh """
                        aws ecr get-login-password --region $AWS_REGION | \
                        docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                    """
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh """
                    docker build -t $FRONTEND_REPO:$IMAGE_TAG ./frontend
                    docker build -t $BACKEND_REPO:$IMAGE_TAG ./backend
                    docker build -t $AI_REPO:$IMAGE_TAG ./ai-service
                """
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh """
                    docker push $FRONTEND_REPO:$IMAGE_TAG
                    docker push $BACKEND_REPO:$IMAGE_TAG
                    docker push $AI_REPO:$IMAGE_TAG
                """
            }
        }

        stage('Deploy Updated Containers (Same EC2)') {
            steps {
                sh """
                    echo "Stopping Old Containers..."
                    docker compose down

                    echo "Pulling Latest Images..."
                    docker pull $FRONTEND_REPO:$IMAGE_TAG
                    docker pull $BACKEND_REPO:$IMAGE_TAG
                    docker pull $AI_REPO:$IMAGE_TAG

                    echo "Updating Compose Image Tags..."
                    sed -i "s|studypal-frontend:.*|studypal-frontend:$IMAGE_TAG|g" docker-compose.yml
                    sed -i "s|studypal-backend:.*|studypal-backend:$IMAGE_TAG|g" docker-compose.yml
                    sed -i "s|studypal-ai-service:.*|studypal-ai-service:$IMAGE_TAG|g" docker-compose.yml

                    echo "Starting Updated Containers..."
                    docker compose up -d
                """
            }
        }
    }
}
