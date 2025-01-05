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
        APP_NAME = "rmit-store"
        RELEASE = "1.0.0"
        DOCKER_USER = "nhan2102"
        DOCKER_CREDENTIALS = "dockerhub"

        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"       // !!!!! should be this form either can not push !!!!!
        IMAGE_TAG = "${RELEASE}-${env.BUILD_NUMBER}"      // will be updated in another pipeline

        SERVICE_NAME = "${APP_NAME}-service"
        DP_STACK_NAME = "deploy"
    }

    stages {
        stage("clean workspace"){
            steps {
                script {
                    cleanWs();
                    sh """
                        docker system prune -f
                        docker rm -vf $(docker ps -aq)
                        docker rmi -f $(docker images -aq)
                    """
                }
            }
        }

        // checkout code from source code
        stage("Checkout from SCM"){ 
            steps {
                git branch: "main", url: "https://github.com/NhanNguyen20/COSC2767-RMIT-Store.git"
            }
        }

        stage("Unit Test") {
            steps {
                parallel(
                    "Client": {
                        dir('client') {
                            sh """
                                npm install
                                npm test
                            """
                        }   
                    },
                    "Server": {
                        dir('server') {
                            sh """
                                npm install
                                npm test
                            """
                        }
                    }
                )
            }
        } 

        // create Docker image -> push to Docker Hub -> pull back to build image
        stage("Build & Push Docker images") {
            steps {
                script {
                    parallel(
                        "Client": {
                            dir('client') {
                                docker.withRegistry('', DOCKER_CREDENTIALS) {
                                def clientImage = docker.build("${IMAGE_NAME}-client")
                                clientImage.push("${IMAGE_TAG}")
                                clientImage.push("latest")
                                }
                            }
                        },
                        "Server": {
                            dir('server') {
                                docker.withRegistry('', DOCKER_CREDENTIALS) {
                                def serverImage = docker.build("${IMAGE_NAME}-server")
                                serverImage.push("${IMAGE_TAG}")
                                serverImage.push("latest")
                                }
                            }
                        }
                    )
                }
            }
        }

        stage("Pull Docker Image") { // New stage added to pull the latest image
            steps {
                script {
                    sh """
                        docker pull ${IMAGE_NAME}-client:latest
                        docker pull ${IMAGE_NAME}-server:latest
                    """
                }
            }
        }

        stage("Deploy to Swarm") {
            steps {
                script {
                    sh "docker stack deploy -c docker-compose.yml ${DP_STACK_NAME}"
                }
            }
        }

    }
}
