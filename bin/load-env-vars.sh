#!/usr/bin/env bash
branch=$1
project=$2

#map branches to environments
case $branch in
  "master")
    environment=testing;
    ;;
  "staging")
    environment=staging;
    ;;
  "production")
    environment=production;
    ;;
  *)
    echo "Not matched"
    ;;
esac

case $branch in
  "master" | "staging" | "production")
	echo NEXT_PUBLIC_API_URL=$(aws ssm get-parameter --name "/tuulboxfrontend/$environment/next_public_api_url" --query "Parameter.Value" | sed s/\"//g) >> .env.production
	echo NEXT_PUBLIC_PLAY_STORE_APP_URL=$(aws ssm get-parameter --name "/tuulboxfrontend/$environment/next_public_play_store_app_url" --query "Parameter.Value" | sed s/\"//g) >> .env.production
	echo NEXT_PUBLIC_APP_STORE_APP_URL=$(aws ssm get-parameter --name "/tuulboxfrontend/$environment/next_public_app_store_app_url" --query "Parameter.Value" | sed s/\"//g) >> .env.production
esac
