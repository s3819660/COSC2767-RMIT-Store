pipeline {
    agent any

    tools {
        nodejs "NodeJS"
        jdk "JDK 17"
    }

    // identify dynamic variables
    parameters {
        string(name: 'GITHUB_URL', defaultValue: "${GITHUB_URL ?: 'https://github.com/s3819660/COSC2767-RMIT-Store.git'}")
        string(name: 'GIT_BRANCH', defaultValue: "${GIT_BRANCH ?: 'nhan-test'}")
        string(name: 'KEY_NAME', defaultValue: "${KEY_NAME ?: 'devops_project_key'}")
        string(name: 'VPC_ID_DEV', defaultValue: "${VPC_ID_DEV ?: 'vpc-0b042585e9ec719f9'}")
        string(name: 'SUBNET_ID_DEV', defaultValue: "${SUBNET_ID_DEV ?: 'subnet-08996f374a5237f33'}")
        string(name: 'ELASTIC_ID_DEV', defaultValue: "${ELASTIC_ID_DEV ?: 'eipalloc-0352959bcb4bfe70d'}")
        string(name: 'IMAGE_ID_FRONTEND', defaultValue: "${IMAGE_ID_FRONTEND ?: 'ami-05576a079321f21f8'}")
        string(name: 'IMAGE_ID_BACKEND', defaultValue: "${IMAGE_ID_BACKEND ?: 'ami-05576a079321f21f8'}")
        string(name: 'TRUSTED_SSH_CIDR', defaultValue: "${TRUSTED_SSH_CIDR ?: '0.0.0.0/0'}", description: 'CIDR block for SSH access to EC2 instances')
        string(name: 'HOSTNAME_FE', defaultValue: "${HOSTNAME_FE ?: 'worker-client'}")
        string(name: 'HOSTNAME_BE', defaultValue: "${HOSTNAME_BE ?: 'worker-server'}", description: 'Hostname of the backend server')
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

        VPC_CIDR = '10.0.0.0/16'
        PUBLIC_SUBNET1_CIDR = '10.0.1.0/24'
        PUBLIC_SUBNET2_CIDR = '10.0.2.0/24'
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
                git branch: "${params.GIT_BRANCH}", url: "${params.GITHUB_URL}"
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

         */

        stage('CloudFormation Deploy Dev Environment') {
            steps {
                dir('cloudformation') {
                    script {
                        // test
                        echo "AWS Region: ${env.AWS_REGION}"

                        def ssh_pub_key = sh(script: '''
                            sudo cat /home/ansibleadmin/.ssh/id_rsa.pub
                        ''', returnStdout: true).trim()

                        // Check if the stack exists
                        // def stackExists = sh(script: '''
                        //     aws cloudformation describe-stacks --stack-name TestDevEnv > /dev/null 2>&1 && echo true || echo false
                        // ''', returnStdout: true).trim()

                        // if (stackExists == 'true') {    // delete stack if it exists
                        //     sh '''
                        //         aws cloudformation delete-stack --stack-name TestDevEnv
                        //     '''
                        //     // Wait for the stack to be deleted
                        //     sh '''
                        //         aws cloudformation wait stack-delete-complete \
                        //             --stack-name DevEnv
                        //     '''
                        // }

                        // Create the stack
                        sh """
                            aws cloudformation deploy \
                                --template-file dev-env.yml \
                                --stack-name DevEnv \
                                --capabilities CAPABILITY_IAM \
                                --parameter-overrides \
                                    KeyName=${params.KEY_NAME} \
                                    VpcId=${params.VPC_ID_DEV} \
                                    SubnetId=${params.SUBNET_ID_DEV} \
                                    SshPubKey='${ssh_pub_key}' \
                                    ElasticIpId=${params.ELASTIC_ID_DEV}
                        """

                            // Wait for the stack to be created
                        sh '''
                            aws cloudformation wait stack-create-complete \
                                --stack-name DevEnv
                        '''
                    }
                }
            }
        }
        
        stage("Test on Remote Server") {
            steps {
                script {
                    // Run the Ansible playbook
                    ansiblePlaybook becomeUser: 'ansibleadmin', 
                                    credentialsId: "${env.ANSIBLE_CREDENTIALS}", 
                                    installation: 'Ansible', 
                                    inventory: 'ansible/hosts', 
                                    playbook: 'ansible/playbooks/PullAndTest.yml'

                    // Read and check the exit code
                    def exitCode = readFile('/tmp/jenkins/test_exit_code.txt').trim()
                    if (exitCode != '0') {
                        // Display test output due to failure
                        sh 'cat /tmp/jenkins/test_output.txt || echo "No test output available."'
                        error "Tests failed with exit code: ${exitCode}"
                    }

                    echo "Tests passed successfully."
                }
            }
        }

        stage('CloudFormation Deploy Production Stack') {
            steps {
                script {
                    // Optionally, fetch the latest AMI IDs using AWS SSM Parameter Store
                    /*
                    IMAGE_ID_FRONTEND = sh (
                        script: "aws ssm get-parameters --names /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 --region ${REGION} --query 'Parameters[0].Value' --output text",
                        returnStdout: true
                    ).trim()

                    IMAGE_ID_BACKEND = sh (
                        script: "aws ssm get-parameters --names /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 --region ${REGION} --query 'Parameters[0].Value' --output text",
                        returnStdout: true
                    ).trim()
                    */

                    def SWARM_MASTER_TOKEN = sh(script: "docker swarm join-token manager -q", returnStdout: true).trim()

                    def SWARM_MASTER_IP = sh(script: "hostname -I | awk '{print \$1}'", returnStdout: true).trim()

                    // Deploy or update the CloudFormation stack
                    sh """
                        aws cloudformation deploy \
                            --template-file prod-env.yml \
                            --stack-name ProdEnv \
                            --region ${env.AWS_REGION} \
                            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
                            --parameter-overrides \
                                KeyName=${params.KEY_NAME} \
                                ImageIdFrontEnd=${params.IMAGE_ID_FRONTEND} \
                                ImageIdBackEnd=${params.IMAGE_ID_BACKEND} \
                                VpcCidr=${VPC_CIDR} \
                                PublicSubnet1Cidr=${PUBLIC_SUBNET1_CIDR} \
                                PublicSubnet2Cidr=${PUBLIC_SUBNET2_CIDR} \
                                TrustedSSHCIDR=${params.TRUSTED_SSH_CIDR} \
                                SwarmMasterToken=${SWARM_MASTER_TOKEN} \
                                SwarmMasterIP=${SWARM_MASTER_IP} \
                                Hostname-FE=${params.HOSTNAME_FE} \
                                Hostname-BE=${params.HOSTNAME_BE}
                    """

                    // Wait for stack to be fully deployed
                    sh """
                        aws cloudformation wait stack-update-complete --stack-name ${STACK_NAME} --region ${REGION}
                    """

                    // Retrieve stack outputs and set them as environment variables
                    def stackOutputs = sh (
                        script: "aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${REGION} --query 'Stacks[0].Outputs' --output json",
                        returnStdout: true
                    ).trim()

                    def outputs = readJSON text: stackOutputs

                    // Extract specific outputs
                    def loadBalancerDNS = outputs.find { it.OutputKey == 'LoadBalancerDNS' }?.OutputValue
                    def frontEndASGName = outputs.find { it.OutputKey == 'FrontEndAutoScalingGroupName' }?.OutputValue
                    def backEndASGName = outputs.find { it.OutputKey == 'BackEndAutoScalingGroupName' }?.OutputValue

                    // Set environment variables for subsequent stages
                    env.LOAD_BALANCER_DNS = loadBalancerDNS
                    env.FRONT_END_ASG_NAME = frontEndASGName
                    env.BACK_END_ASG_NAME = backEndASGName

                    // (Optional) Echo the outputs
                    echo "Load Balancer DNS: ${env.LOAD_BALANCER_DNS}"
                    echo "Front-End ASG Name: ${env.FRONT_END_ASG_NAME}"
                    echo "Back-End ASG Name: ${env.BACK_END_ASG_NAME}"
                }
            }
        }

        stage("Deploy to Swarm") {
            steps {
                script {
                    // assign node labels
                    sh "docker node update --label-add role=client ${params.HOSTNAME_FE}"
                    sh "docker node update --label-add role=server ${params.HOSTNAME_BE}"

                    // deploy the stack
                    sh "docker stack deploy -c docker-compose.yml ${DP_STACK_NAME}"
                }
            }
        }

/* 
    post {
        failure {
            script {
                sh """
                aws sns publish \
                  --region $AWS_REGION \
                  --topic-arn $SNS_TOPIC_ARN \
                  --message "Build Failed: Job ${env.JOB_NAME} #${env.BUILD_NUMBER}" \
                  --subject "Jenkins Build FAILURE"
                """
            }
        }
    }
*/
    }
}
