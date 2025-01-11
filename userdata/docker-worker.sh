#!/bin/bash

# Set a variable for the hostname. Modify this value as needed.
HOSTNAME="docker-worker"

# Set the hostname using the variable
hostnamectl set-hostname "$HOSTNAME"

# Update packages
yum update -y

# Install Docker
yum install -y docker

# Start Docker service
service docker start

# Enable Docker to start on boot
systemctl enable docker

# Join the Docker Swarm
docker swarm join --token ${DockerSwarmToken} ${DockerMasterIP}:2377
