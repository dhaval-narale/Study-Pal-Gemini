pipeline {
    agent any

    environment {
        AWS_REGION     = "ap-south-1"
        AWS_ACCOUNT_ID = "101762432072"
        IMAGE_TAG      = "${env.BUILD_ID}"

        FRONTEND_REPO  = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/studypal-frontend"
        BACKEND_REPO   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/studypal-backend"
        AI_REPO        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/studypal-ai-service"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/dhaval-narale/Study-Pal-Gemini.git'
            }
        }

        stage('AWS Login & ECR Auth') {
            steps {
                withCredentials([
                    aws(
                        credentialsId: 'AWS Credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh """
                    echo '✅ AWS Identity:'
                    aws sts get-caller-identity --region $AWS_REGION

                    echo '✅ Logging into ECR...'
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh """
                echo '✅ Building Frontend Image...'
                docker build -t $FRONTEND_REPO:$IMAGE_TAG ./frontend

                echo '✅ Building Backend Image...'
                docker build -t $BACKEND_REPO:$IMAGE_TAG ./backend

                echo '✅ Building AI Service Image...'
                docker build -t $AI_REPO:$IMAGE_TAG ./ai-service
                """
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh """
                echo '✅ Pushing Frontend...'
                docker push $FRONTEND_REPO:$IMAGE_TAG

                echo '✅ Pushing Backend...'
                docker push $BACKEND_REPO:$IMAGE_TAG

                echo '✅ Pushing AI Service...'
                docker push $AI_REPO:$IMAGE_TAG
                """
            }
        }

        stage('Deploy Updated Containers on Jenkins EC2') {
            steps {
                sh """
                echo '✅ Force Cleanup to Avoid Conflicts...'
                docker ps -aq | xargs -r docker stop || true
                docker ps -aq | xargs -r docker rm || true
                docker network prune -f || true

                echo '✅ Dropping Compose Project Containers...'
                docker compose down || true

                echo '✅ Pulling Latest Images from ECR...'
                docker pull $FRONTEND_REPO:$IMAGE_TAG
                docker pull $BACKEND_REPO:$IMAGE_TAG
                docker pull $AI_REPO:$IMAGE_TAG

                echo '✅ Updating docker-compose.yml image tags...'
                sed -i "s|studypal-frontend:.*|studypal-frontend:$IMAGE_TAG|g" docker-compose.yml
                sed -i "s|studypal-backend:.*|studypal-backend:$IMAGE_TAG|g" docker-compose.yml
                sed -i "s|studypal-ai-service:.*|studypal-ai-service:$IMAGE_TAG|g" docker-compose.yml

                echo '✅ Starting Updated Containers...'
                docker compose up -d

                echo '✅ Deployment completed successfully!!'
                """
            }
        }
    }
}
