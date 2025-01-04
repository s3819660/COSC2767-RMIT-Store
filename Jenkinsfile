pipeline {
    agent any

    // app build using java maven -> need install these tools (on Jenkins UI)
    // then also add here as tools need to use
    tools {
        nodejs "NodeJS"
        jdk "JDK"
    }

    // identify environment variables
    environment {
        // identify an app (that going to build) name
        APP_NAME = "client"
        RELEASE = "1.0.0"
        DOCKER_USER = "nhan2102"
        DOCKER_CREDENTIALS = "dockerhub"

        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"       // !!!!! should be this form either can not push !!!!!
        IMAGE_TAG = "${RELEASE}-${env.BUILD_NUMBER}"      // will be updated in another pipeline

        SERVICE_NAME = "${APP_NAME}-service"
    }

    stages {
        stage("clean workspace"){
            steps {
                cleanWs()
            }
        }

        // checkout code from source code
        stage("Checkout from SCM"){ // usually is Git
            // credentialId - what we named ID when adding credential
            steps {
                git branch: "main", url: "https://github.com/NhanNguyen20/COSC2767-RMIT-Store.git"
            }
        }

        stage("Build App"){ 
            steps { 
                sh '''
                    pwd
                    ls -la
                    cd client
                    ls -la
                    npm install
                '''
            }
        }

        // create Docker image -> push to Docker Hub -> pull back to build image
        stage("Build & Push Docker image"){
            steps {
                script {
                    dir('client'){
                        sh "pwd"
                        docker.withRegistry('', DOCKER_CREDENTIALS) {      // authenticates with a Docker registry
                            docker_image = docker.build("${IMAGE_NAME}")
                        }

                        // ------------- can be in a separate registry auth if different registry ------------------------
                        docker.withRegistry('', DOCKER_CREDENTIALS) {
                            docker_image.push("${IMAGE_TAG}")

                            docker_image.push("latest")     // helpful for finding d most up-to-date image without specifying a version
                        }

                    }

                }
            }
        }

        stage('Deploy to Swarm') {
            steps {
                script {
                    sh """
                    docker pull ${IMAGE_NAME}:latest
                    if docker service ls --filter name=${SERVICE_NAME} --format '{{.Name}}' | grep -q ${SERVICE_NAME}; then
                        docker service update --image ${IMAGE_NAME}:latest ${SERVICE_NAME}
                    else
                        docker service create --name ${SERVICE_NAME} --replicas 1 --publish 8080:9090 ${IMAGE_NAME}:latest
                    fi
                    """
                }
            }
        }

    }
}
