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

        AWS_REGION = "us-east-1"
        SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:975050071897:test-topic"

        ANSIBLE_SERVER = "54.146.173.204"
        ANSIBLE_CREDENTIALS = "ansibleadmin"
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
                git branch: "main", url: "https://github.com/NhanNguyen20/COSC2767-RMIT-Store.git"
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
                        // This code fails ansible connect to ansible workers, please don't uncomment
                        sh '''
                            aws cloudformation delete-stack --stack-name TestDevEnv
                        '''

                        // Wait for the stack to be deleted
                        sh '''
                            aws cloudformation wait stack-delete-complete \
                                --stack-name TestDevEnv
                        '''
                        
                        def ssh_pub_key = sh(script: '''
                            sudo cat /home/ansibleadmin/.ssh/id_rsa.pub
                        ''', returnStdout: true).trim()
                        

                        sh """
                            aws cloudformation deploy \
                                --template-file dev-env.yml \
                                --stack-name TestDevEnv \
                                --capabilities CAPABILITY_IAM \
                                --parameter-overrides \
                                    KeyName=devops_project_key \
                                    VpcId=vpc-0d0a77061e27d0a1b \
                                    SubnetId=subnet-095106efd8b1035a6 \
                                    SshPubKey='${ssh_pub_key}'
                        """

                        // Wait for the stack to be created
                        sh '''
                            aws cloudformation wait stack-create-complete \
                                --stack-name TestDevEnv
                        '''

                        // Retrieve the stack outputs
                        def stackOutputs = sh(script: '''
                            aws cloudformation describe-stacks \
                                --stack-name TestDevEnv \
                                --query "Stacks[0].Outputs"
                        ''', returnStdout: true).trim()

                        // Parse the outputs to extract values
                        def outputs = readJSON text: stackOutputs

                        // Extract specific output values
                        def ec2PublicIp = outputs.find { it.OutputKey == "EC2PublicIP" }?.OutputValue
                        // Store the values in environment variables for use in subsequent stages
                        env.EC2_PUBLIC_IP = ec2PublicIp
                    
                    }
                }
            }
        }


        stage('Ansible Connect to Worker EC2') {
            steps {
                script {
                    // Add the EC2 instance to the Ansible inventory file
                    sh """
                        sudo echo '[TestDevServer]
                        ${env.EC2_PUBLIC_IP}' > /etc/ansible/hosts
                    """

                    sh """
                        sudo chmod 777 /home/ansibleadmin/.ssh
                        sudo chmod 777 /home/ansibleadmin/.ssh/known_hosts
                        sudo chmod 777 /home/ansibleadmin/.ssh/id_rsa
                    """

                    sh """
                        sudo -u ansibleadmin whoami
                        sudo -u ansibleadmin ansible -m ping all
                    """
                }
            }
        }
        
        stage("Ansible Playbook") {
            steps {
                script {
                    sh '''
                        sudo -u ansibleadmin ansible-playbook /home/ansibleadmin/PullAndRunFe.yml
                    '''
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
