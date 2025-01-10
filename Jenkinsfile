pipeline {
    agent any

    tools {
        nodejs "NodeJS"
        jdk "JDK 17"
    }

    // identify environment variables
    environment {
        APP_NAME = "rmit-store"
        RELEASE = "1.0.0"
        DOCKER_USER = "nhan2102"
        DOCKER_CREDENTIALS = "dockerhub"
        ANSIBLE_CREDENTIALS = "ansible"

        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"       // !!!!! should be this form either can not push !!!!!
        IMAGE_TAG = "${RELEASE}-${env.BUILD_NUMBER}"      // will be updated in another pipeline

        SERVICE_NAME = "${APP_NAME}-service"
        DP_STACK_NAME = "deploy"

        AWS_REGION = "us-east-1"
        SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:975050071897:test-topic"
    }

    stages {
        stage("Clean Workspace") {
            steps {
                cleanWs()
                sh '''
                    docker system prune -f
                    if [ $(docker ps -aq | wc -l) -gt 0 ]; then
                        docker rm -vf $(docker ps -aq)
                    fi
                    if [ $(docker images -aq | wc -l) -gt 0 ]; then
                        docker rmi -f $(docker images -aq)
                    fi
                '''
            }
        }

        // checkout code from source code
        stage("Checkout from SCM"){ 
            steps {
                git branch: "refactor", url: "https://github.com/NhanNguyen20/COSC2767-RMIT-Store.git"
            }
        }

        /* 
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
    } */

    stage('CloudFormation Deploy') {
        steps {
            dir('cloudformation') {
                script {
                    // test
                    echo "AWS Region: ${env.AWS_REGION}"

                    def ssh_pub_key = sh(script: '''
                        sudo cat /home/ansibleadmin/.ssh/id_rsa.pub
                    ''', returnStdout: true).trim()

                    // Check if the stack exists
                    def stackExists = sh(script: '''
                        aws cloudformation describe-stacks --stack-name TestDevEnv > /dev/null 2>&1 && echo true || echo false
                    ''', returnStdout: true).trim()

                    if (stackExists == 'true') {    // delete stack if it exists
                        sh '''
                            aws cloudformation delete-stack --stack-name TestDevEnv
                        '''
                        // Wait for the stack to be deleted
                        sh '''
                            aws cloudformation wait stack-delete-complete \
                                --stack-name TestDevEnv
                        '''
                    }

                    // Create the stack
                    sh """
                        aws cloudformation deploy \
                            --template-file testdev-env.yml \
                            --stack-name TestDevEnv \
                            --capabilities CAPABILITY_IAM \
                            --parameter-overrides \
                                KeyName=devops_project_key \
                                VpcId=vpc-0b042585e9ec719f9 \
                                SubnetId=subnet-08996f374a5237f33 \
                                SshPubKey='${ssh_pub_key}' \
                                ElasticIp=eipalloc-0352959bcb4bfe70d
                    """

                        // Wait for the stack to be created
                    sh '''
                        aws cloudformation wait stack-create-complete \
                            --stack-name TestDevEnv
                    '''
                    }
                }
            }
        }
        
        stage("Test on Remote Server") {
            steps {
                script {
                    // Run the Ansible playbook
                    sh """
                        sudo -u ansibleadmin ansible-playbook -i ansible/hosts ansible/playbooks/PullAndRunFe.yml
                    """

                    // Read and check the exit code
                    def exitCode = readFile('/tmp/test_exit_code.txt').trim()
                    if (exitCode != '0') {
                        // Display test output due to failure
                        sh 'cat /tmp/test_output.txt || echo "No test output available."'
                        error "Tests failed with exit code: ${exitCode}"
                    }

                    echo "Tests passed successfully."
                }
            }
        }
    

    // post {
    //     failure {
    //         script {
    //             sh """
    //             aws sns publish \
    //               --region $AWS_REGION \
    //               --topic-arn $SNS_TOPIC_ARN \
    //               --message "Build Failed: Job ${env.JOB_NAME} #${env.BUILD_NUMBER}" \
    //               --subject "Jenkins Build FAILURE"
    //             """
    //         }
    //     }
    }
}
