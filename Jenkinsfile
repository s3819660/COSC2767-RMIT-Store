pipeline {
    agent any

    // app build using java maven -> need install these tools (on Jenkins UI)
    // then also add here as tools need to use
    tools {
        nodejs "nodejs"
    }

    // identify environment variables
    environment {
        // identify an app (that going to build) name
        APP_NAME = "fe-rmit-store"
        RELEASE = "1.0.0"
        DOCKER_USER = "nhan2102"
        DOCKER_CREDENTIALS = "dockerhub"

        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"       // !!!!! should be this form either can not push !!!!!
        
        IMAGE_TAG = "${RELEASE}-${env.BUILD_NUMBER}"      // will be updated in another pipeline
    }

    stages {
        // checkout code from source code
        stage("Checkout from SCM"){ // usually is Git
            // credentialId - what we named ID when adding credential
            steps {
                git branch: "main", url: "https://github.com/NhanNguyen20/COSC2767-RMIT-Store.git"
            }
        }

        stage("Build App"){ 
            steps { 
                sh "pwd"
                sh "ls -la"
                sh "cd ./client"
                sh "ls -la"
                sh "npm install"
            }
        }

        // create Docker image -> push to Docker Hub -> pull back to build image
        // stage("Build & Push Docker image"){
        //     steps {
        //         script {
        //             // "docker" the global object seen as Docker plugin
        //             // empty registry - use default Docker Hub


        //             docker.withRegistry('', DOCKER_CREDENTIALS) {      // authenticates with a Docker registry
        //                 docker_image = docker.build("${IMAGE_NAME}", "./client")
        //             }

        //             // ------------- can be in a separate registry auth if different registry ------------------------
        //             docker.withRegistry('', DOCKER_CREDENTIALS) {
        //             // .push() push image with a specific tag
        //                 docker_image.push("${IMAGE_TAG}")

        //                 // latest - a convention in Docker that points to the most recent version of the image
        //                 docker_image.push("latest")     // helpful for finding d most up-to-date image without specifying a version
        //             }
        //         }
        //     }
        // }
    }
}
