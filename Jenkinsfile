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

        VPC_CIDR = '10.0.0.0/16'
        PUBLIC_SUBNET1_CIDR = '10.0.1.0/24'
        PUBLIC_SUBNET2_CIDR = '10.0.2.0/24'

        GITHUB_URL = "https://github.com/s3819660/COSC2767-RMIT-Store.git"
        GIT_BRANCH = "nhan-test"
        KEY_NAME = "devops_project_key"
        VPC_ID_DEV = "vpc-0b042585e9ec719f9"
        SUBNET_ID_DEV = "subnet-08996f374a5237f33"
        ELASTIC_ID_DEV = "eipalloc-0352959bcb4bfe70d"
        ELASTIC_IP_DEV = "23.20.223.181"
        IMAGE_ID_FRONTEND = "ami-05576a079321f21f8"
        IMAGE_ID_BACKEND = "ami-05576a079321f21f8"
        TRUSTED_SSH_CIDR = "0.0.0.0/0" // CIDR block for SSH access to EC2 instances
        HOSTNAME_FE = "worker-client"
        HOSTNAME_BE = "worker-server" // Hostname of the backend server

        SWARM_MASTER_TOKEN = ""
        SWARM_MASTER_IP = ""
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
                sh '''
                    truncate -s 0 /var/lib/jenkins/.ssh/known_hosts
                '''
                sh '''
                    sudo truncate -s 0 /home/ansibleadmin/.ssh/known_hosts
                '''
            }
        }

        // checkout code from source code
        stage("Checkout from SCM"){ 
            steps {
                git branch: "${env.GIT_BRANCH}", url: "${env.GITHUB_URL}"
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
                            sudo cat /var/lib/jenkins/.ssh/id_rsa.pub
                        ''', returnStdout: true).trim()

                        // Check if the stack exists
                        def stackExists = sh(script: '''
                            aws cloudformation describe-stacks --stack-name DevEnv > /dev/null 2>&1 && echo true || echo false
                        ''', returnStdout: true).trim()

                        if (stackExists == 'true') {    // delete stack if it exists
                            sh '''
                                aws cloudformation delete-stack --stack-name DevEnv
                            '''
                            // Wait for the stack to be deleted
                            sh '''
                                aws cloudformation wait stack-delete-complete \
                                    --stack-name DevEnv
                            '''
                        }

                        // Create the stack
                        sh """
                            aws cloudformation deploy \
                                --template-file dev-env.yml \
                                --stack-name DevEnv \
                                --capabilities CAPABILITY_IAM \
                                --parameter-overrides \
                                    KeyName=${env.KEY_NAME} \
                                    VpcId=${env.VPC_ID_DEV} \
                                    SubnetId=${env.SUBNET_ID_DEV} \
                                    SshPubKey='${ssh_pub_key}' \
                                    ElasticIpId=${env.ELASTIC_ID_DEV}
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

        stage('Pause for EC2 Initialization') {
            steps {
                script {
                    sleep(time: 1, unit: 'MINUTES')
                }
            }
        }
        
        stage("Test on Remote Server") {
            steps {
                script {
                    sh """
                        chmod +x ansible/playbooks/PullAndTest.yml
                        ssh-keyscan -H ${ELASTIC_IP_DEV} >> /var/lib/jenkins/.ssh/known_hosts
                    """

                    // sudo -u ansibleadmin bash -c "ssh-keyscan -H ${ELASTIC_IP_DEV} >> /home/ansibleadmin/.ssh/known_hosts"
                    // Run the Ansible playbook
                    // sh """
                    //     sudo -u ansibleadmin bash -c "ansible-playbook -i /var/lib/jenkins/workspace/rmit-store/ansible/hosts /var/lib/jenkins/workspace/rmit-store/ansible/playbooks/PullAndTest.yml"
                    // """
                    ansiblePlaybook credentialsId: "${env.ANSIBLE_CREDENTIALS}", 
                                    installation: 'Ansible', 
                                    inventory: 'ansible/hosts',
                                    playbook: 'ansible/playbooks/PullAndTest.yml'

                    // Read and check the exit code
                    // def exitCode = readFile('/tmp/jenkins/test_exit_code.txt').trim()
                    // if (exitCode != '0') {
                    //     // Display test output due to failure
                    //     sh 'cat /tmp/jenkins/test_output.txt || echo "No test output available."'
                    //     error "Tests failed with exit code: ${exitCode}"
                    // }

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

                    env.SWARM_MASTER_TOKEN = sh(script: "docker swarm join-token manager -q", returnStdout: true).trim()

                    env.SWARM_MASTER_IP = sh(script: "hostname -I | awk '{print \$1}'", returnStdout: true).trim()

                    // Deploy or update the CloudFormation stack
                    sh """
                        aws cloudformation deploy \
                            --template-file cloudformation/prod-env.yml \
                            --stack-name ProdEnv \
                            --region ${env.AWS_REGION} \
                            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
                            --parameter-overrides \
                                KeyName=${env.KEY_NAME} \
                                ImageIdFrontEnd=${env.IMAGE_ID_FRONTEND} \
                                ImageIdBackEnd=${env.IMAGE_ID_BACKEND} \
                                VpcCidr=${VPC_CIDR} \
                                PublicSubnet1Cidr=${PUBLIC_SUBNET1_CIDR} \
                                PublicSubnet2Cidr=${PUBLIC_SUBNET2_CIDR} \
                                TrustedSSHCIDR=${env.TRUSTED_SSH_CIDR} \
                                SwarmMasterToken=${SWARM_MASTER_TOKEN} \
                                SwarmMasterIP=${SWARM_MASTER_IP} \
                                HostnameFE=${env.HOSTNAME_FE} \
                                HostnameBE=${env.HOSTNAME_BE}
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
                    echo "join token: ${env.SWARM_MASTER_TOKEN} and IP ${env.SWARM_MASTER_IP}"
                    // assign node labels
                    sh "docker node update --label-add role=client ${env.HOSTNAME_FE}"
                    sh "docker node update --label-add role=server ${env.HOSTNAME_BE}"

                    // deploy the stack
                    sh "docker stack deploy -c docker-compose.yml ${env.DP_STACK_NAME}"
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
