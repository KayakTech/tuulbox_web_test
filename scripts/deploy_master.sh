#!/bin/bash

  
# Stash any local changes
git stash

# Switch to the master branch
git checkout master

# Pull the latest changes from the repository
git pull

# clear all docker containers
yes | docker rm -f $(docker ps -a -q)
yes | docker builder prune

# build docker with docker-compose
# docker-compose up -d --build
yarn install
yarn build
pm2 stop all
pm2 start "sudo yarn start -p 80"



# docker rmi -f $(docker image ls -a -q) removes all images
# docker builder prune
# docker kill $(docker ps -q)
# docker_clean_ps
# docker rmi $(docker images -a -q)
# https://forums.docker.com/t/how-to-delete-cache/5753/2